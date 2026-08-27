import type { Category, Fabric, Product } from './models.js';
import type { FabricCategory, ProductSort } from './enums.js';

/** Every list endpoint returns this shape. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Counts used to render filter options and grey out ones that would return nothing.
 *
 * Each dimension is counted with every OTHER active filter applied, but NOT its
 * own. That is what makes the numbers useful: with "Beds" selected, the fabric
 * counts show how many beds come in each fabric, while the category counts still
 * show what you would get by also ticking Sofas.
 */
export interface ProductFacets {
  categories: Array<{ id: string; slug: string; count: number }>;
  fabricCategories: Array<{ value: FabricCategory; count: number }>;
  fabrics: Array<{ id: string; hex: string; count: number }>;
  customSizeAvailable: number;
  price: {
    /** Full-catalogue bounds. Deliberately NOT filtered — the slider track must
     *  stay still while you drag it, or the handles chase the data. */
    min: number;
    max: number;
    /** Distribution of matches under every other active filter. */
    histogram: number[];
    /** AMD width of one histogram bucket, so the client can label the axis. */
    bucketSize: number;
  };
}

export interface ProductListResponse extends Paginated<Product> {
  facets: ProductFacets;
}

export interface ProductQuery {
  categories?: string[];
  fabricCategories?: FabricCategory[];
  fabrics?: string[];
  priceMin?: number;
  priceMax?: number;
  customSize?: boolean;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
  q?: string;
}

export interface CreateInquiryInput {
  name: string;
  phone: string;
  email?: string;
  message: string;
  productId?: string;
  fabricId?: string;
  customDimensions?: string;
}

export interface CreateReviewInput {
  productId?: string;
  authorName: string;
  authorEmail: string;
  rating: 1 | 2 | 3 | 4 | 5;
  body: string;
}

/** Typed error body returned by every failing route. */
export interface ApiError {
  error: {
    code: string;
    message: string;
    /** Field-level messages, keyed by path, for form validation failures. */
    fields?: Record<string, string>;
  };
}

export type CategoryListResponse = Category[];
export type FabricListResponse = Fabric[];
