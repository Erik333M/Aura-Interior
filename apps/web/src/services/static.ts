import type {
  Category,
  Fabric,
  FabricCategory,
  Paginated,
  Product,
  ProductFacets,
  ProductListResponse,
  ProductQuery,
  Project,
  RatingSummary,
  Review,
  SearchResponse,
} from '@aura/types';

/**
 * Static-data mode.
 *
 * A serverless host cannot run the SQLite the API uses, so the built site ships
 * a JSON snapshot of the catalogue (see scripts/generate-static-data.ts) and
 * this module answers the same questions the API would — the same filtering,
 * sorting, pagination and facet rules, reimplemented over an in-memory array.
 *
 * It is a read-only shop window: enquiries, reviews and admin all still need
 * the real API. Those paths report that plainly rather than pretending.
 */

const PRICE_BUCKETS = 24;

let cache: {
  products: Product[];
  categories: Category[];
  fabrics: Fabric[];
  projects: Project[];
  reviews: Review[];
} | null = null;

async function load() {
  if (cache) return cache;
  const [products, categories, fabrics, projects, reviews] = await Promise.all(
    ['products', 'categories', 'fabrics', 'projects', 'reviews'].map((n) =>
      fetch(`/data/${n}.json`).then((r) => {
        if (!r.ok) throw new Error(`static data missing: ${n}.json`);
        return r.json();
      }),
    ),
  );
  cache = { products, categories, fabrics, projects, reviews };
  return cache;
}

/** Mirrors buildWhere() in apps/api/src/routes/products.ts. */
function matches(p: Product, q: ProductQuery, skip?: string): boolean {
  if (p.category?.slug === 'interior-design') return false;

  if (skip !== 'categories' && q.categories?.length) {
    if (!p.category || !q.categories.includes(p.category.slug)) return false;
  }
  if (skip !== 'customSize' && q.customSize !== undefined) {
    if (p.customSizeAvailable !== q.customSize) return false;
  }
  if (skip !== 'price') {
    if (q.priceMin !== undefined && p.priceFrom < q.priceMin) return false;
    if (q.priceMax !== undefined && p.priceFrom > q.priceMax) return false;
  }
  if (skip !== 'fabrics' && q.fabrics?.length) {
    if (!p.fabrics.some((f) => q.fabrics?.includes(f.id))) return false;
  }
  if (skip !== 'fabricCategories' && q.fabricCategories?.length) {
    if (!p.fabrics.some((f) => q.fabricCategories?.includes(f.category))) return false;
  }
  if (q.q) {
    const needle = q.q.toLowerCase();
    const hay = [
      ...Object.values(p.name),
      ...Object.values(p.description),
      ...Object.values(p.defaultMaterial),
    ]
      .join(' ')
      .toLowerCase();
    // Case-insensitive here, unlike SQLite — a nicety of running in JS.
    if (!hay.includes(needle)) return false;
  }
  return true;
}

function sortProducts(list: Product[], sort: ProductQuery['sort']): Product[] {
  const out = [...list];
  switch (sort) {
    case 'price-asc':
      return out.sort((a, b) => a.priceFrom - b.priceFrom);
    case 'price-desc':
      return out.sort((a, b) => b.priceFrom - a.priceFrom);
    case 'newest':
      return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    default:
      return out.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

export async function staticProducts(q: ProductQuery = {}): Promise<ProductListResponse> {
  const { products, categories, fabrics } = await load();
  const page = q.page ?? 1;
  const pageSize = q.pageSize ?? 12;

  const all = products.filter((p) => matches(p, q));
  const sorted = sortProducts(all, q.sort);

  // Facets: each dimension counted with every OTHER filter applied, matching
  // the API so options grey out identically.
  const pool = (skip: string) => products.filter((p) => matches(p, q, skip));
  const catPool = pool('categories');
  const fabPool = pool('fabrics');
  const pricePool = pool('price');

  const bounds = products.filter((p) => p.category?.slug !== 'interior-design');
  const min = Math.min(...bounds.map((p) => p.priceFrom));
  const max = Math.max(...bounds.map((p) => p.priceFrom));
  const span = max - min;
  const histogram = new Array<number>(PRICE_BUCKETS).fill(0);
  for (const p of pricePool) {
    const idx =
      span > 0
        ? Math.min(PRICE_BUCKETS - 1, Math.floor(((p.priceFrom - min) / span) * PRICE_BUCKETS))
        : 0;
    histogram[idx] = (histogram[idx] ?? 0) + 1;
  }

  const byType = new Map<FabricCategory, number>();
  const fabCounts = fabrics.map((f) => {
    const count = fabPool.filter((p) => p.fabrics.some((x) => x.id === f.id)).length;
    byType.set(f.category, (byType.get(f.category) ?? 0) + count);
    return { id: f.id, hex: f.hex, count };
  });

  const facets: ProductFacets = {
    categories: categories
      .filter((c) => c.slug !== 'interior-design')
      .map((c) => ({
        id: c.id,
        slug: c.slug,
        count: catPool.filter((p) => p.category?.slug === c.slug).length,
      })),
    fabricCategories: [...byType.entries()].map(([value, count]) => ({ value, count })),
    fabrics: fabCounts,
    customSizeAvailable: pool('customSize').filter((p) => p.customSizeAvailable).length,
    price: { min, max, histogram, bucketSize: span > 0 ? Math.ceil(span / PRICE_BUCKETS) : 0 },
  };

  return {
    items: sorted.slice((page - 1) * pageSize, page * pageSize),
    total: all.length,
    page,
    pageSize,
    facets,
  };
}

export async function staticProduct(slug: string): Promise<Product> {
  const { products, reviews } = await load();
  const found = products.find((p) => p.slug === slug);
  if (!found) throw new Error('Product not found');
  const own = reviews.filter((r) => r.productId === found.id);
  return { ...found, reviews: own, rating: summarise(own) };
}

export async function staticCategories(): Promise<Category[]> {
  return (await load()).categories;
}
export async function staticFabrics(): Promise<Fabric[]> {
  return (await load()).fabrics;
}
export async function staticProjects(): Promise<Project[]> {
  return (await load()).projects;
}

function summarise(list: Review[]): RatingSummary {
  const breakdown: RatingSummary['breakdown'] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of list) breakdown[r.rating] += 1;
  const total = list.reduce((n, r) => n + r.rating, 0);
  return {
    average: list.length === 0 ? 0 : Math.round((total / list.length) * 10) / 10,
    count: list.length,
    breakdown,
  };
}

export async function staticReviews(productId?: string): Promise<Paginated<Review>> {
  const { reviews } = await load();
  const items = productId ? reviews.filter((r) => r.productId === productId) : reviews;
  return { items, total: items.length, page: 1, pageSize: items.length };
}

export async function staticRatingSummary(productId: string): Promise<RatingSummary> {
  const { reviews } = await load();
  return summarise(reviews.filter((r) => r.productId === productId));
}

export async function staticSearch(q: string, limit = 8): Promise<SearchResponse> {
  const { categories } = await load();
  const res = await staticProducts({ q, pageSize: limit });
  const needle = q.toLowerCase();
  const cats = categories.filter((c) =>
    Object.values(c.name).join(' ').toLowerCase().includes(needle),
  );
  return { query: q, products: res.items, categories: cats, total: res.total + cats.length };
}
