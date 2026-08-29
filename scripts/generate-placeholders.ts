/**
 * Generates branded placeholder imagery, then runs the real production image
 * pipeline over it: sharp → AVIF + WebP + JPEG at 400/800/1600px, plus a base64
 * blur placeholder for each.
 *
 * The point is that this is NOT throwaway scaffolding. Aspect ratios, variant
 * sizes, filenames and the manifest shape are exactly what real photography
 * will use, so replacing these files changes no application code. Drop real
 * photos into media/source/<key>.jpg and re-run: the script prefers a real
 * source file over a generated one whenever it finds it.
 *
 *   npm run media:generate
 */
import os from 'node:os';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

import { categories } from '../apps/api/prisma/data/categories.js';
import { products } from '../apps/api/prisma/data/products.js';
import { projects } from '../apps/api/prisma/data/projects.js';
import { fabrics } from '../apps/api/prisma/data/fabrics.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR = path.join(ROOT, 'media', 'source');
const OUT_DIR = path.join(ROOT, 'apps', 'web', 'public', 'media', 'generated');
const MANIFEST = path.join(OUT_DIR, 'manifest.json');

const WIDTHS = [400, 800, 1600] as const;

/**
 * AVIF encoder effort, 0–9. This one number was the entire build time: at the
 * library default of 4 it costs 276ms per image against 21ms at 0, which across
 * 303 encodes is 84 of a 87-second build. Measured output at 800px:
 *
 *   effort 0 → 21ms, 39.3kB      effort 2 → 47ms, 37.4kB
 *   effort 1 → 30ms, 37.6kB      effort 4 → 276ms, 34.0kB
 *
 * Effort 1 takes almost all of the compression for a fraction of the time —
 * past it you pay a lot of seconds for a couple of kB on lazy-loaded images
 * behind a CDN. Raise it if the images ever become the bottleneck instead.
 */
const AVIF_EFFORT = 1;

/**
 * WebP encoder effort, 0–6. At 1600px the library default of 4 costs 130ms
 * against 69ms at 2, for 75kB versus 82kB — the single most expensive operation
 * in the whole pipeline, dearer even than AVIF.
 */
const WEBP_EFFORT = 2;

/**
 * Let sharp use ONE thread per operation and parallelise across images
 * ourselves instead. libvips defaults to a thread pool per call, which then
 * contends with our own concurrency: measured over 16 images, leaving it alone
 * ran the batch at ~29s per 101 images and this at ~13s.
 */
sharp.concurrency(1);
/** The master render size. Derived, so adding a width above 1600 just works. */
const MAX_WIDTH: number = Math.max(...WIDTHS);

/** Aspect ratios, chosen per surface and fixed so layouts never shift. */
const RATIO = {
  product: 4 / 5, // portrait — furniture stands up
  hero: 16 / 9,
  project: 3 / 2,
  swatch: 1,
} as const;

interface Job {
  key: string;
  label: string;
  eyebrow: string;
  ratio: number;
  /** Swatch tiles render as flat fabric colour rather than a studio scene. */
  swatchHex?: string;
}

export interface ManifestEntry {
  url: string;
  width: number;
  height: number;
  blurhash: string;
}
export type Manifest = Record<string, ManifestEntry>;

// ── deterministic per-key variation ─────────────────────────────────────────
function hashOf(key: string): number {
  return parseInt(createHash('sha1').update(key).digest('hex').slice(0, 8), 16);
}
function vary(key: string, salt: number, min: number, max: number): number {
  const h = hashOf(key + ':' + salt);
  return min + ((h % 1000) / 1000) * (max - min);
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * A dark studio scene: gradient ground, warm gold vignette offset per key, a
 * soft contact shadow on a floor line, hairline gold frame, and spaced serif
 * capitals. Close enough to the brand that the site reads as designed while the
 * real photography is still being shot.
 */
function sceneSvg(job: Job, w: number, h: number): string {
  const { key, label, eyebrow } = job;

  if (job.swatchHex) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <radialGradient id="s" cx="38%" cy="32%" r="78%">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.28"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="${job.swatchHex}"/>
  <rect width="${w}" height="${h}" fill="url(#s)"/>
</svg>`;
  }

  const cx = vary(key, 1, 34, 66);
  const cy = vary(key, 2, 26, 44);
  const floorY = h * 0.74;
  const objW = w * vary(key, 3, 0.42, 0.6);
  const objH = h * vary(key, 4, 0.3, 0.44);
  const objX = (w - objW) / 2;
  const objY = floorY - objH;
  const radius = objH * vary(key, 5, 0.06, 0.26);

  const titleSize = Math.max(11, w * 0.052);
  const eyebrowSize = Math.max(7, w * 0.019);
  const inset = Math.round(w * 0.035);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#141416"/>
      <stop offset="58%" stop-color="#0B0B0D"/>
      <stop offset="100%" stop-color="#141416"/>
    </linearGradient>
    <radialGradient id="lamp" cx="${cx}%" cy="${cy}%" r="62%">
      <stop offset="0%" stop-color="#C6A15B" stop-opacity="0.26"/>
      <stop offset="55%" stop-color="#C6A15B" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#C6A15B" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="piece" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="#3A3A40"/>
      <stop offset="100%" stop-color="#1A1A1D"/>
    </linearGradient>
    <radialGradient id="contact" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000" stop-opacity="0.62"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${w}" height="${h}" fill="url(#ground)"/>
  <rect width="${w}" height="${h}" fill="url(#lamp)"/>

  <ellipse cx="${w / 2}" cy="${floorY + objH * 0.05}" rx="${objW * 0.62}" ry="${objH * 0.1}" fill="url(#contact)"/>
  <rect x="${objX}" y="${objY}" width="${objW}" height="${objH}" rx="${radius}" fill="url(#piece)"/>
  <rect x="${objX}" y="${objY}" width="${objW}" height="${objH}" rx="${radius}"
        fill="none" stroke="#C6A15B" stroke-opacity="0.18" stroke-width="1"/>
  <line x1="0" y1="${floorY}" x2="${w}" y2="${floorY}" stroke="#C6A15B" stroke-opacity="0.12" stroke-width="1"/>

  <rect x="${inset}" y="${inset}" width="${w - inset * 2}" height="${h - inset * 2}"
        fill="none" stroke="#C6A15B" stroke-opacity="0.15" stroke-width="1"/>

  <text x="50%" y="${h * 0.875}" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-size="${titleSize}"
        letter-spacing="${titleSize * 0.14}" fill="#EFE8DC" fill-opacity="0.92">${esc(label.toUpperCase())}</text>
  <text x="50%" y="${h * 0.93}" text-anchor="middle"
        font-family="Helvetica, Arial, sans-serif" font-size="${eyebrowSize}" font-weight="500"
        letter-spacing="${eyebrowSize * 0.24}" fill="#C6A15B" fill-opacity="0.85">${esc(eyebrow.toUpperCase())}</text>
</svg>`;
}

async function findSource(key: string): Promise<string | null> {
  if (!existsSync(SOURCE_DIR)) return null;
  const files = await readdir(SOURCE_DIR);
  const match = files.find((f) => path.parse(f).name === key);
  return match ? path.join(SOURCE_DIR, match) : null;
}

async function render(job: Job): Promise<ManifestEntry> {
  const maxW = MAX_WIDTH;
  const maxH = Math.round(maxW / job.ratio);

  // Real photography wins over generated art whenever it exists.
  const source = await findSource(job.key);
  const base = source
    ? sharp(source).resize(maxW, maxH, { fit: 'cover', position: 'attention' })
    : sharp(Buffer.from(sceneSvg(job, maxW, maxH)));

  const master = await base.toBuffer();

  await Promise.all(
    WIDTHS.flatMap((w) => {
      const h = Math.round(w / job.ratio);
      const resized = () => sharp(master).resize(w, h, { fit: 'cover' });
      return [
        resized()
          .avif({ quality: 55, effort: AVIF_EFFORT })
          .toFile(path.join(OUT_DIR, `${job.key}-${w}.avif`)),
        resized()
          .webp({ quality: 72, effort: WEBP_EFFORT })
          .toFile(path.join(OUT_DIR, `${job.key}-${w}.webp`)),
        resized()
          .jpeg({ quality: 78, mozjpeg: true })
          .toFile(path.join(OUT_DIR, `${job.key}-${w}.jpg`)),
      ];
    }),
  );

  // Blur placeholder — tiny, inlined into HTML, cross-faded out on load.
  const blur = await sharp(master)
    .resize(20, Math.max(1, Math.round(20 / job.ratio)), { fit: 'cover' })
    .blur(1.2)
    .jpeg({ quality: 40 })
    .toBuffer();

  return {
    url: `/media/generated/${job.key}`,
    width: maxW,
    height: maxH,
    blurhash: `data:image/jpeg;base64,${blur.toString('base64')}`,
  };
}

function buildJobs(): Job[] {
  const jobs: Job[] = [];

  for (const p of products) {
    const cat = categories.find((c) => c.slug === p.categorySlug);
    const eyebrow = cat?.name.en ?? 'Aura Interior';
    // Two angles per product: the grid cross-fades to the second on hover.
    jobs.push({ key: `product-${p.slug}-1`, label: p.name.en, eyebrow, ratio: RATIO.product });
    jobs.push({
      key: `product-${p.slug}-2`,
      label: p.name.en,
      eyebrow: `${eyebrow} · II`,
      ratio: RATIO.product,
    });
  }

  for (const c of categories) {
    jobs.push({
      key: `category-${c.slug}`,
      label: c.name.en,
      eyebrow: 'Aura Interior',
      ratio: RATIO.hero,
    });
  }

  for (const pr of projects) {
    for (let i = 1; i <= pr.imageCount; i += 1) {
      jobs.push({
        key: `project-${pr.slug}-${i}`,
        label: pr.title.en,
        eyebrow: pr.location.en,
        ratio: RATIO.project,
      });
    }
  }

  for (const f of fabrics) {
    jobs.push({
      key: `fabric-${f.slug}`,
      label: f.name.en,
      eyebrow: f.category,
      ratio: RATIO.swatch,
      swatchHex: f.hex,
    });
  }

  jobs.push({
    key: 'hero-home',
    label: 'Aura Interior',
    eyebrow: 'Made in Yerevan',
    ratio: RATIO.hero,
  });
  jobs.push({
    key: 'about-workshop',
    label: 'The Workshop',
    eyebrow: 'Made in Yerevan',
    ratio: RATIO.hero,
  });

  return jobs;
}

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true });
  const jobs = buildJobs();
  const manifest: Manifest = {};

  console.log(`Generating ${jobs.length} images × ${WIDTHS.length} sizes × 3 formats…`);
  if (existsSync(SOURCE_DIR))
    console.log(`Using real photography from ${SOURCE_DIR} where available.`);

  // A continuous pool, not fixed batches. Batching awaited every slot before
  // refilling, so each round ran at the speed of its slowest image and the
  // other workers sat idle — the biggest single loss in the pipeline.
  const CONCURRENCY = Math.max(4, (os.availableParallelism?.() ?? 4) * 2);
  let next = 0;
  let done = 0;

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, async () => {
      for (;;) {
        const i = next++;
        const job = jobs[i];
        if (!job) return;
        manifest[job.key] = await render(job);
        done += 1;
        process.stdout.write(`\r  ${done}/${jobs.length}`);
      }
    }),
  );
  console.log('');

  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
  console.log(`\n✔ ${jobs.length} images → ${path.relative(ROOT, OUT_DIR)}`);
  console.log(`✔ manifest → ${path.relative(ROOT, MANIFEST)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
