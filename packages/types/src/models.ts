import type { Localized } from './locale.js';
import type { FabricCategory, InquiryStatus, ReviewStatus } from './enums.js';

/** A responsive image with its generated AVIF/WebP variants and blur placeholder. */
export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  /** Tiny base64 data-URI rendered underneath the real image while it loads. */
  blurhash: string;
  sortOrder: number;
}

export interface Category {
  id: string;
  slug: string;
  name: Localized;
  description: Localized;
  heroImage: string | null;
  /** Present on list endpoints that compute facets. */
  productCount?: number;
}

export interface Fabric {
  id: string;
  name: Localized;
  hex: string;
  textureUrl: string | null;
  category: FabricCategory;
}

export interface Dimensions {
  widthCm: number;
  depthCm: number;
  heightCm: number;
}

/** A size the customer can buy, with the price for that size. */
export interface ProductSize {
  id: string;
  widthCm: number;
  depthCm: number;
  /** Retail price in AMD for this exact size. */
  priceFrom: number;
}

export interface Product {
  id: string;
  slug: string;
  name: Localized;
  description: Localized;
  /** Starting price in Armenian dram. Displayed as "from N ֏" — never a fixed SKU price. */
  priceFrom: number;
  categoryId: string;
  category?: Category;
  defaultMaterial: Localized;
  dimensions: Dimensions;
  customSizeAvailable: boolean;
  leadTimeDays: number;
  featured: boolean;
  createdAt: string;
  images: ProductImage[];
  /**
   * Priced sizes, cheapest first. Empty means the piece is quoted from
   * `priceFrom` and made to the customer's dimensions — the UI must not
   * invent a price per size in that case.
   */
  sizes: ProductSize[];
  fabrics: Fabric[];
  reviews?: Review[];
  rating?: RatingSummary;
}

export interface RatingSummary {
  average: number;
  count: number;
  /** Count of reviews per star value, indexed 1–5. */
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface Review {
  id: string;
  productId: string | null;
  authorName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  body: string;
  status: ReviewStatus;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  productId: string | null;
  product?: Pick<Product, 'id' | 'slug' | 'name'> | null;
  fabricId: string | null;
  fabric?: Pick<Fabric, 'id' | 'name' | 'hex'> | null;
  customDimensions: string | null;
  status: InquiryStatus;
  createdAt: string;
}

export interface Project {
  id: string;
  slug: string;
  title: Localized;
  description: Localized;
  year: number;
  location: Localized;
  images: ProductImage[];
  createdAt: string;
}
