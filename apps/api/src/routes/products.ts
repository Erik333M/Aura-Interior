import { Router } from 'express';
import type { FabricCategory, ProductFacets, ProductListResponse } from '@aura/types';
import { prisma } from '../db.js';
import { notFound, badRequest } from '../lib/errors.js';
import { toProduct } from '../lib/serialize.js';
import { productQuerySchema, type ProductQueryParsed } from '../lib/query.js';

export const productsRouter: Router = Router();

/** Full relation set for a catalogue card. */
const listInclude = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' } },
  fabrics: { include: { fabric: true } },
} as const;

const PRICE_BUCKETS = 24;

/** Which filter dimension to leave out when counting a facet. */
type Dimension = 'categories' | 'fabrics' | 'fabricCategories' | 'price' | 'customSize';

type Where = Record<string, unknown>;

/**
 * Builds the Prisma `where` for a query, optionally omitting one dimension.
 *
 * Omitting the dimension is the whole trick behind useful facet counts: when we
 * count categories we apply the price, fabric and custom-size filters but NOT
 * the category filter, so the user can see what selecting another category
 * would add rather than a column of zeroes.
 */
function buildWhere(q: ProductQueryParsed, skip?: Dimension): Where {
  // Interior Design is a service; it never appears in the product catalogue.
  const where: Where = { category: { isService: false } };

  if (skip !== 'categories' && q.categories) {
    where['category'] = { isService: false, slug: { in: q.categories } };
  }

  if (skip !== 'customSize' && q.customSize !== undefined) {
    where['customSizeAvailable'] = q.customSize;
  }

  if (skip !== 'price' && (q.priceMin !== undefined || q.priceMax !== undefined)) {
    where['priceFrom'] = {
      ...(q.priceMin !== undefined ? { gte: q.priceMin } : {}),
      ...(q.priceMax !== undefined ? { lte: q.priceMax } : {}),
    };
  }

  // Each fabric constraint is its own `some` clause so that selecting two
  // fabrics means "available in BOTH", not "has at least one fabric row".
  const and: Where[] = [];
  if (skip !== 'fabrics' && q.fabrics) {
    and.push({ fabrics: { some: { fabricId: { in: q.fabrics } } } });
  }
  if (skip !== 'fabricCategories' && q.fabricCategories) {
    and.push({ fabrics: { some: { fabric: { category: { in: q.fabricCategories } } } } });
  }
  if (and.length > 0) where['AND'] = and;

  if (q.q) {
    // NOTE: SQLite has no case-insensitive `contains` for non-ASCII, so Armenian
    // and Russian search is case-sensitive today. Postgres with
    // `mode: 'insensitive'` fixes this for free when the datasource swaps.
    where['OR'] = [
      { nameHy: { contains: q.q } },
      { nameRu: { contains: q.q } },
      { nameEn: { contains: q.q } },
      { descEn: { contains: q.q } },
    ];
  }

  return where;
}

function orderFor(sort: ProductQueryParsed['sort']) {
  switch (sort) {
    case 'price-asc':
      return [{ priceFrom: 'asc' as const }];
    case 'price-desc':
      return [{ priceFrom: 'desc' as const }];
    case 'newest':
      return [{ createdAt: 'desc' as const }];
    default:
      return [{ featured: 'desc' as const }, { createdAt: 'desc' as const }];
  }
}

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

    const where = buildWhere(q);

    const [rows, total, facets] = await Promise.all([
      prisma.product.findMany({
        where,
        include: listInclude,
        orderBy: orderFor(q.sort),
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      prisma.product.count({ where }),
      buildFacets(q),
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

async function buildFacets(q: ProductQueryParsed): Promise<ProductFacets> {
  const [categories, fabrics, customCount, pricePool, bounds] = await Promise.all([
    // Categories: counted without the category filter.
    prisma.category.findMany({
      where: { isService: false },
      select: {
        id: true,
        slug: true,
        _count: { select: { products: { where: buildWhere(q, 'categories') } } },
      },
      orderBy: { sortOrder: 'asc' },
    }),

    // Fabrics: counted without either fabric filter, so both the colour swatches
    // and the fabric-type list stay explorable.
    prisma.fabric.findMany({
      select: {
        id: true,
        hex: true,
        category: true,
        _count: {
          select: {
            products: { where: { product: buildWhere(q, 'fabrics') } },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    }),

    prisma.product.count({
      where: { ...buildWhere(q, 'customSize'), customSizeAvailable: true },
    }),

    // Histogram reflects every other filter…
    prisma.product.findMany({
      where: buildWhere(q, 'price'),
      select: { priceFrom: true },
    }),

    // …but the slider track uses whole-catalogue bounds so it never moves.
    prisma.product.aggregate({
      where: { category: { isService: false } },
      _min: { priceFrom: true },
      _max: { priceFrom: true },
    }),
  ]);

  const min = bounds._min.priceFrom ?? 0;
  const max = bounds._max.priceFrom ?? 0;
  const span = max - min;
  const bucketSize = span > 0 ? Math.ceil(span / PRICE_BUCKETS) : 0;

  const histogram = new Array<number>(PRICE_BUCKETS).fill(0);
  for (const { priceFrom } of pricePool) {
    const idx =
      span > 0
        ? Math.min(PRICE_BUCKETS - 1, Math.floor(((priceFrom - min) / span) * PRICE_BUCKETS))
        : 0;
    histogram[idx] = (histogram[idx] ?? 0) + 1;
  }

  // Fabric *types* aggregate their member fabrics' counts. Counting distinct
  // products per type would need a second round-trip; for a catalogue this size
  // the sum is the honest upper bound and matches what the swatches show.
  const byType = new Map<FabricCategory, number>();
  for (const f of fabrics) {
    const key = f.category as FabricCategory;
    byType.set(key, (byType.get(key) ?? 0) + f._count.products);
  }

  return {
    categories: categories.map((c) => ({ id: c.id, slug: c.slug, count: c._count.products })),
    fabricCategories: [...byType.entries()].map(([value, count]) => ({ value, count })),
    fabrics: fabrics.map((f) => ({ id: f.id, hex: f.hex, count: f._count.products })),
    customSizeAvailable: customCount,
    price: { min, max, histogram, bucketSize },
  };
}
