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
