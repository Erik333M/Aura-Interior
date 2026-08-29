/** Shape of the seed catalogue. Shared by prisma/seed.ts and the image generator. */
export interface L10n {
  hy: string;
  ru: string;
  en: string;
}

export interface SeedCategory {
  slug: string;
  name: L10n;
  desc: L10n;
  sortOrder: number;
  isService?: boolean;
}

export interface SeedFabric {
  slug: string;
  name: L10n;
  hex: string;
  category: 'BOUCLE' | 'VELVET' | 'LINEN' | 'LEATHER';
  sortOrder: number;
}

/** One purchasable size with its own price. */
export interface SeedSizeCost {
  widthCm: number;
  depthCm: number;
  /** Wholesale cost in AMD. Retail is this times the category markup. */
  cost: number;
}

export interface SeedProduct {
  slug: string;
  name: L10n;
  desc: L10n;
  material: L10n;
  categorySlug: string;
  priceFrom: number;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  customSizeAvailable: boolean;
  leadTimeDays: number;
  featured: boolean;
  /** Slugs from the fabric library that this piece can be commissioned in. */
  fabricSlugs: string[];
  /**
   * Real per-size price table, where the supplier gave one. Absent means the
   * piece is quoted from `priceFrom` and sized to order — the UI shows the size
   * chips without prices rather than inventing them.
   */
  sizeCosts?: SeedSizeCost[];
}

export interface SeedProject {
  slug: string;
  title: L10n;
  desc: L10n;
  location: L10n;
  year: number;
  featured: boolean;
  imageCount: number;
}
