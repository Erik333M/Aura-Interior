/**
 * Seeds the catalogue. Idempotent: safe to re-run, upserts on natural keys.
 *
 * Images come from the manifest written by `npm run media:generate`, so the
 * generator must run first. `npm run setup` at the repo root does both in order.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

import { prisma } from '../src/db.js';
import { env } from '../src/env.js';
import { categories } from './data/categories.js';
import { fabrics } from './data/fabrics.js';
import { MATTRESS_MARKUP, products } from './data/products.js';
import { projects } from './data/projects.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = path.resolve(HERE, '../../web/public/media/generated/manifest.json');

interface ManifestEntry {
  url: string;
  width: number;
  height: number;
  blurhash: string;
}

async function loadManifest(): Promise<Record<string, ManifestEntry>> {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, 'utf8')) as Record<string, ManifestEntry>;
  } catch {
    console.error(
      `\n  Image manifest not found at ${MANIFEST_PATH}\n` +
        `  Run \`npm run media:generate\` first (or just \`npm run setup\` from the repo root).\n`,
    );
    process.exit(1);
  }
}

/** A handful of realistic approved/pending reviews so moderation has something to act on. */
const reviewSeeds = [
  {
    slug: 'arev-bed',
    authorName: 'Անի Հ.',
    rating: 5,
    status: 'APPROVED',
    body: 'Պատվիրեցինք մեր չափսերով, ստացանք ուղիղ 4 շաբաթում։ Բուկլեն շատ ավելի խիտ է, քան սպասում էինք։',
  },
  {
    slug: 'arev-bed',
    authorName: 'Karen M.',
    rating: 5,
    status: 'APPROVED',
    body: 'The curved headboard is exactly as shown. They came to measure and installed it themselves.',
  },
  {
    slug: 'arev-bed',
    authorName: 'Мария С.',
    rating: 4,
    status: 'APPROVED',
    body: 'Кровать отличная, единственное — доставка задержалась на несколько дней.',
  },
  {
    slug: 'sevan-bed',
    authorName: 'Davit G.',
    rating: 5,
    status: 'APPROVED',
    body: 'Storage base is enormous and the gas struts feel solid. Worth the lead time.',
  },
  {
    slug: 'sevan-bed',
    authorName: 'Լիլիթ Ա.',
    rating: 5,
    status: 'APPROVED',
    body: 'Ընտրեցինք թավշյա գրաֆիտ գույնը։ Սենյակը ամբողջովին փոխվեց։',
  },
  {
    slug: 'garni-sofa',
    authorName: 'Nune P.',
    rating: 4,
    status: 'APPROVED',
    body: 'Very deep seat — check the depth against your room first. Fabric quality is excellent.',
  },
  {
    slug: 'vardi-pouf',
    authorName: 'Աram T.',
    rating: 5,
    status: 'APPROVED',
    body: 'Small piece, big difference. Ordered two in bouclé sand.',
  },
  {
    slug: 'zvartnots-panel',
    authorName: 'Sona V.',
    rating: 5,
    status: 'APPROVED',
    body: 'They handled measuring, manufacturing and installation. The LED detail is beautiful at night.',
  },
  {
    slug: 'masis-wardrobe',
    authorName: 'Test Pending',
    rating: 3,
    status: 'PENDING',
    body: 'This one is still awaiting moderation — it should not appear on the public site.',
  },
  {
    slug: 'nairi-bed',
    authorName: 'Spam Bot',
    rating: 1,
    status: 'REJECTED',
    body: 'Rejected review, also must never appear publicly.',
  },
] as const;

async function main(): Promise<void> {
  const manifest = await loadManifest();
  const img = (key: string): ManifestEntry | null => manifest[key] ?? null;

  console.log('Seeding Aura Interior…');

  // ── Categories ────────────────────────────────────────────────────────────
  for (const c of categories) {
    const hero = img(`category-${c.slug}`);
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {
        nameHy: c.name.hy,
        nameRu: c.name.ru,
        nameEn: c.name.en,
        descHy: c.desc.hy,
        descRu: c.desc.ru,
        descEn: c.desc.en,
        sortOrder: c.sortOrder,
        isService: c.isService ?? false,
        heroImage: hero?.url ?? null,
      },
      create: {
        slug: c.slug,
        nameHy: c.name.hy,
        nameRu: c.name.ru,
        nameEn: c.name.en,
        descHy: c.desc.hy,
        descRu: c.desc.ru,
        descEn: c.desc.en,
        sortOrder: c.sortOrder,
        isService: c.isService ?? false,
        heroImage: hero?.url ?? null,
      },
    });
  }
  console.log(`  ✔ ${categories.length} categories`);

  // ── Fabrics ───────────────────────────────────────────────────────────────
  for (const f of fabrics) {
    const tex = img(`fabric-${f.slug}`);
    const data = {
      nameHy: f.name.hy,
      nameRu: f.name.ru,
      nameEn: f.name.en,
      hex: f.hex,
      category: f.category,
      sortOrder: f.sortOrder,
      textureUrl: tex?.url ?? null,
    };
    await prisma.fabric.upsert({
      where: { slug: f.slug },
      update: data,
      create: { slug: f.slug, ...data },
    });
  }
  console.log(`  ✔ ${fabrics.length} fabrics`);

  // ── Products ──────────────────────────────────────────────────────────────
  const categoryIds = new Map(
    (await prisma.category.findMany({ select: { id: true, slug: true } })).map((c) => [
      c.slug,
      c.id,
    ]),
  );
  const fabricIds = new Map(
    (await prisma.fabric.findMany({ select: { id: true, slug: true } })).map((f) => [f.slug, f.id]),
  );

  for (const p of products) {
    const categoryId = categoryIds.get(p.categorySlug);
    if (!categoryId) throw new Error(`Unknown category "${p.categorySlug}" on product "${p.slug}"`);

    const data = {
      nameHy: p.name.hy,
      nameRu: p.name.ru,
      nameEn: p.name.en,
      descHy: p.desc.hy,
      descRu: p.desc.ru,
      descEn: p.desc.en,
      materialHy: p.material.hy,
      materialRu: p.material.ru,
      materialEn: p.material.en,
      priceFrom: p.priceFrom,
      categoryId,
      widthCm: p.widthCm,
      depthCm: p.depthCm,
      heightCm: p.heightCm,
      customSizeAvailable: p.customSizeAvailable,
      leadTimeDays: p.leadTimeDays,
      featured: p.featured,
    };

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: { slug: p.slug, ...data },
    });

    // Replace relations wholesale so re-seeding never accumulates duplicates.
    await prisma.image.deleteMany({ where: { productId: product.id } });
    for (const n of [1, 2]) {
      const entry = img(`product-${p.slug}-${n}`);
      if (!entry) continue;
      await prisma.image.create({
        data: {
          productId: product.id,
          url: entry.url,
          // Alt is stored language-neutral; the client composes a localized alt
          // from the product name it already has. This is the fallback.
          alt: `${p.name.en} — Aura Interior`,
          width: entry.width,
          height: entry.height,
          blurhash: entry.blurhash,
          sortOrder: n,
        },
      });
    }

    // Priced sizes, where the supplier gave a real table. Replaced wholesale so
    // re-seeding never leaves a stale size behind.
    await prisma.productSize.deleteMany({ where: { productId: product.id } });
    if (p.sizeCosts?.length) {
      const sorted = [...p.sizeCosts].sort((a, b) => a.cost - b.cost);
      for (const [i, size] of sorted.entries()) {
        await prisma.productSize.create({
          data: {
            productId: product.id,
            widthCm: size.widthCm,
            depthCm: size.depthCm,
            priceFrom: size.cost * MATTRESS_MARKUP,
            sortOrder: i,
          },
        });
      }
    }

    await prisma.productFabric.deleteMany({ where: { productId: product.id } });
    for (const slug of p.fabricSlugs) {
      const fabricId = fabricIds.get(slug);
      if (!fabricId) throw new Error(`Unknown fabric "${slug}" on product "${p.slug}"`);
      await prisma.productFabric.create({ data: { productId: product.id, fabricId } });
    }
  }
  console.log(`  ✔ ${products.length} products with images and fabric options`);

  // ── Projects ──────────────────────────────────────────────────────────────
  for (const pr of projects) {
    const data = {
      titleHy: pr.title.hy,
      titleRu: pr.title.ru,
      titleEn: pr.title.en,
      descHy: pr.desc.hy,
      descRu: pr.desc.ru,
      descEn: pr.desc.en,
      locationHy: pr.location.hy,
      locationRu: pr.location.ru,
      locationEn: pr.location.en,
      year: pr.year,
      featured: pr.featured,
    };
    const project = await prisma.project.upsert({
      where: { slug: pr.slug },
      update: data,
      create: { slug: pr.slug, ...data },
    });

    await prisma.image.deleteMany({ where: { projectId: project.id } });
    for (let n = 1; n <= pr.imageCount; n += 1) {
      const entry = img(`project-${pr.slug}-${n}`);
      if (!entry) continue;
      await prisma.image.create({
        data: {
          projectId: project.id,
          url: entry.url,
          alt: `${pr.title.en} — ${pr.location.en}`,
          width: entry.width,
          height: entry.height,
          blurhash: entry.blurhash,
          sortOrder: n,
        },
      });
    }
  }
  console.log(`  ✔ ${projects.length} interior design projects`);

  // ── Reviews ───────────────────────────────────────────────────────────────
  const productIds = new Map(
    (await prisma.product.findMany({ select: { id: true, slug: true } })).map((p) => [
      p.slug,
      p.id,
    ]),
  );
  await prisma.review.deleteMany({});
  for (const r of reviewSeeds) {
    const productId = productIds.get(r.slug);
    if (!productId) continue;
    await prisma.review.create({
      data: {
        productId,
        authorName: r.authorName,
        authorEmail: `${r.authorName.toLowerCase().replace(/[^a-z]/g, '') || 'guest'}@example.com`,
        rating: r.rating,
        body: r.body,
        status: r.status,
      },
    });
  }
  const approved = reviewSeeds.filter((r) => r.status === 'APPROVED').length;
  console.log(
    `  ✔ ${reviewSeeds.length} reviews (${approved} approved, ${reviewSeeds.length - approved} held back)`,
  );

  // ── Admin ─────────────────────────────────────────────────────────────────
  // Credentials come from env — never hardcoded, never committed.
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
  await prisma.adminUser.upsert({
    where: { email: env.ADMIN_EMAIL },
    update: { passwordHash },
    create: { email: env.ADMIN_EMAIL, passwordHash },
  });
  console.log(`  ✔ admin user ${env.ADMIN_EMAIL}`);

  if (env.ADMIN_PASSWORD === 'change-me-before-first-run') {
    console.warn('\n  ⚠  ADMIN_PASSWORD is still the placeholder from .env.example. Change it.\n');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err: unknown) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
