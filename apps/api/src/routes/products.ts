import { Router } from 'express';
import type { ProductFacets, ProductListResponse } from '@aura/types';
import { prisma } from '../db.js';
import { notFound, badRequest } from '../lib/errors.js';
import { toProduct } from '../lib/serialize.js';
import { productQuerySchema } from '../lib/query.js';

export const productsRouter: Router = Router();

/** Full relation set for a catalogue card. */
const listInclude = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' } },
  fabrics: { include: { fabric: true } },
} as const;

const PRICE_BUCKETS = 24;

productsRouter.get('/', async (req, res, next) => {
  try {
    const parsed = productQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues) fields[issue.path.join('.')] = issue.message;
      throw badRequest('Invalid filter parameters', fields);
    }
    const q = parsed.data;

    if (q.priceMin !== undefined && q.priceMax !== undefined && q.priceMin > q.priceMax) {
      throw badRequest('priceMin cannot exceed priceMax', {
        priceMin: 'Must be less than or equal to priceMax',
      });
    }

    // Interior Design is a service; it never appears in the product catalogue.
    const where: Record<string, unknown> = { category: { isService: false } };

    if (q.categories) where['category'] = { isService: false, slug: { in: q.categories } };
    if (q.customSize !== undefined) where['customSizeAvailable'] = q.customSize;
    if (q.priceMin !== undefined || q.priceMax !== undefined) {
      where['priceFrom'] = {
        ...(q.priceMin !== undefined ? { gte: q.priceMin } : {}),
        ...(q.priceMax !== undefined ? { lte: q.priceMax } : {}),
      };
    }

    const fabricFilters: Record<string, unknown>[] = [];
    if (q.fabrics) fabricFilters.push({ fabricId: { in: q.fabrics } });
    if (q.fabricCategories)
      fabricFilters.push({ fabric: { category: { in: q.fabricCategories } } });
    if (fabricFilters.length > 0) {
      where['AND'] = fabricFilters.map((f) => ({ fabrics: { some: f } }));
    }

    if (q.q) {
      // NOTE: SQLite has no case-insensitive `contains` for non-ASCII, so
      // Armenian and Russian search is currently case-sensitive. Postgres with
      // `mode: 'insensitive'` fixes this for free when the datasource swaps.
      where['OR'] = [
        { nameHy: { contains: q.q } },
        { nameRu: { contains: q.q } },
        { nameEn: { contains: q.q } },
        { descEn: { contains: q.q } },
      ];
    }

    const orderBy =
      q.sort === 'price-asc'
        ? [{ priceFrom: 'asc' as const }]
        : q.sort === 'price-desc'
          ? [{ priceFrom: 'desc' as const }]
          : q.sort === 'newest'
            ? [{ createdAt: 'desc' as const }]
            : [{ featured: 'desc' as const }, { createdAt: 'desc' as const }];

    const [rows, total, facets] = await Promise.all([
      prisma.product.findMany({
        where,
        include: listInclude,
        orderBy,
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      prisma.product.count({ where }),
      buildFacets(),
    ]);

    const body: ProductListResponse = {
      items: rows.map(toProduct),
      total,
      page: q.page,
      pageSize: q.pageSize,
      facets,
    };
    res.json(body);
  } catch (err) {
    next(err);
  }
});

productsRouter.get('/:slug', async (req, res, next) => {
  try {
    const row = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        ...listInclude,
        // Only approved reviews are ever exposed publicly.
        reviews: { where: { status: 'APPROVED' }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!row) throw notFound('Product');
    res.json(toProduct(row));
  } catch (err) {
    next(err);
  }
});

/**
 * Facet counts are computed against the unfiltered catalogue so the sidebar can
 * show "how many would this option give me" and grey out the zeroes, rather
 * than collapsing to whatever the current filters already selected.
 */
async function buildFacets(): Promise<ProductFacets> {
  const base = { category: { isService: false } };

  const [categories, fabricRows, customCount, prices] = await Promise.all([
    prisma.category.findMany({
      where: { isService: false },
      select: { id: true, slug: true, _count: { select: { products: true } } },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.fabric.findMany({
      select: { id: true, hex: true, category: true, _count: { select: { products: true } } },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.product.count({ where: { ...base, customSizeAvailable: true } }),
    prisma.product.findMany({ where: base, select: { priceFrom: true } }),
  ]);

  const values = prices.map((p) => p.priceFrom).sort((a, b) => a - b);
  const min = values[0] ?? 0;
  const max = values[values.length - 1] ?? 0;

  const histogram = new Array<number>(PRICE_BUCKETS).fill(0);
  if (max > min) {
    const span = max - min;
    for (const v of values) {
      const idx = Math.min(PRICE_BUCKETS - 1, Math.floor(((v - min) / span) * PRICE_BUCKETS));
      histogram[idx] = (histogram[idx] ?? 0) + 1;
    }
  } else if (values.length > 0) {
    histogram[0] = values.length;
  }

  const byFabricCategory = new Map<string, number>();
  for (const f of fabricRows) {
    byFabricCategory.set(f.category, (byFabricCategory.get(f.category) ?? 0) + f._count.products);
  }

  return {
    categories: categories.map((c) => ({ id: c.id, slug: c.slug, count: c._count.products })),
    fabricCategories: [...byFabricCategory.entries()].map(([value, count]) => ({
      value: value as ProductFacets['fabricCategories'][number]['value'],
      count,
    })),
    fabrics: fabricRows.map((f) => ({ id: f.id, hex: f.hex, count: f._count.products })),
    customSizeAvailable: customCount,
    price: { min, max, histogram },
  };
}
