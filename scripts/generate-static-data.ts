/**
 * Bakes the catalogue into static JSON so the site works with no backend.
 *
 * A serverless host cannot run the SQLite the API uses, and standing up
 * Postgres is not always worth it for a read-only shop window. This snapshot is
 * built from the SAME seed data the database is seeded from, so the two cannot
 * drift: change products.ts, re-run, and both are updated.
 *
 * The web app reads these when VITE_STATIC_DATA is set (see services/static.ts)
 * and talks to the live API otherwise, so local development is unaffected.
 *
 *   npm run data:generate
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { categories } from '../apps/api/prisma/data/categories.js';
import { fabrics } from '../apps/api/prisma/data/fabrics.js';
import { MATTRESS_MARKUP, products } from '../apps/api/prisma/data/products.js';
import { projects } from '../apps/api/prisma/data/projects.js';
import { reviewSeeds } from '../apps/api/prisma/data/reviews.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(ROOT, 'apps/web/public/media/generated/manifest.json');
const OUT = path.join(ROOT, 'apps/web/public/data');

interface ManifestEntry {
  url: string;
  width: number;
  height: number;
  blurhash: string;
}

/** Stable ids derived from slugs — no database means no cuids. */
const id = (kind: string, slug: string): string => `${kind}_${slug}`;

async function main(): Promise<void> {
  await mkdir(OUT, { recursive: true });
  const manifest: Record<string, ManifestEntry> = JSON.parse(await readFile(MANIFEST, 'utf8'));

  const categoryById = new Map(
    categories.map((c) => [
      c.slug,
      {
        id: id('cat', c.slug),
        slug: c.slug,
        name: c.name,
        description: c.desc,
        heroImage: manifest[`category-${c.slug}`]?.url ?? null,
        isService: c.isService ?? false,
        productCount: products.filter((p) => p.categorySlug === c.slug).length,
      },
    ]),
  );

  const fabricBySlug = new Map(
    fabrics.map((f) => [
      f.slug,
      {
        id: id('fab', f.slug),
        name: f.name,
        hex: f.hex,
        textureUrl: manifest[`fabric-${f.slug}`]?.url ?? null,
        category: f.category,
      },
    ]),
  );

  const images = (slug: string) =>
    [1, 2]
      .map((n) => ({ key: `product-${slug}-${n}`, n }))
      .filter(({ key }) => manifest[key])
      .map(({ key, n }) => {
        const m = manifest[key] as ManifestEntry;
        return {
          id: `img_${slug}_${n}`,
          url: m.url,
          alt: '',
          width: m.width,
          height: m.height,
          blurhash: m.blurhash,
          sortOrder: n,
        };
      });

  const built = products.map((p) => {
    const category = categoryById.get(p.categorySlug);
    const sizes = [...(p.sizeCosts ?? [])]
      .sort((a, b) => a.cost - b.cost)
      .map((z, i) => ({
        id: `size_${p.slug}_${z.widthCm}x${z.depthCm}`,
        widthCm: z.widthCm,
        depthCm: z.depthCm,
        priceFrom: z.cost * MATTRESS_MARKUP,
        sortOrder: i,
      }));

    return {
      id: id('prod', p.slug),
      slug: p.slug,
      name: p.name,
      description: p.desc,
      priceFrom: p.priceFrom,
      categoryId: category?.id ?? '',
      category: category ? { ...category, productCount: category.productCount } : undefined,
      defaultMaterial: p.material,
      dimensions: { widthCm: p.widthCm, depthCm: p.depthCm, heightCm: p.heightCm },
      customSizeAvailable: p.customSizeAvailable,
      leadTimeDays: p.leadTimeDays,
      featured: p.featured,
      // Fixed rather than "now": a changing timestamp would make every build a
      // content change and bust caches for nothing.
      createdAt: '2026-01-01T00:00:00.000Z',
      images: images(p.slug),
      sizes,
      fabrics: p.fabricSlugs.map((s) => fabricBySlug.get(s)).filter(Boolean),
    };
  });

  const builtProjects = projects.map((pr) => ({
    id: id('proj', pr.slug),
    slug: pr.slug,
    title: pr.title,
    description: pr.desc,
    year: pr.year,
    location: pr.location,
    createdAt: '2026-01-01T00:00:00.000Z',
    images: Array.from({ length: pr.imageCount }, (_, i) => {
      const m = manifest[`project-${pr.slug}-${i + 1}`];
      return m
        ? {
            id: `img_${pr.slug}_${i + 1}`,
            url: m.url,
            alt: '',
            width: m.width,
            height: m.height,
            blurhash: m.blurhash,
            sortOrder: i + 1,
          }
        : null;
    }).filter(Boolean),
  }));

  // Only APPROVED reviews, exactly as the public API filters them — a static
  // snapshot must not become a way to read unmoderated content.
  const builtReviews = reviewSeeds
    .filter((r) => r.status === 'APPROVED')
    .map((r, i) => ({
      id: `rev_${i}`,
      productId: id('prod', r.slug),
      authorName: r.authorName,
      rating: r.rating,
      body: r.body,
      status: r.status,
      createdAt: '2026-01-01T00:00:00.000Z',
    }));

  await writeFile(path.join(OUT, 'reviews.json'), JSON.stringify(builtReviews));
  await writeFile(path.join(OUT, 'products.json'), JSON.stringify(built));
  await writeFile(
    path.join(OUT, 'categories.json'),
    JSON.stringify([...categoryById.values()]),
  );
  await writeFile(path.join(OUT, 'fabrics.json'), JSON.stringify([...fabricBySlug.values()]));
  await writeFile(path.join(OUT, 'projects.json'), JSON.stringify(builtProjects));

  console.log(`✔ ${built.length} products, ${categoryById.size} categories, ` +
    `${fabricBySlug.size} fabrics, ${builtProjects.length} projects → apps/web/public/data`);
  console.log(`  priced sizes: ${built.reduce((n, p) => n + p.sizes.length, 0)}, ` +
    `approved reviews: ${builtReviews.length}`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
