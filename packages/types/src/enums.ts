/**
 * These are modelled as TypeScript unions + string columns rather than Prisma
 * `enum`s because SQLite has no native enum type. Postgres does, so when the
 * datasource swaps over these can become real enums without a data migration.
 */

export const FABRIC_CATEGORIES = ['BOUCLE', 'VELVET', 'LINEN', 'LEATHER'] as const;
export type FabricCategory = (typeof FABRIC_CATEGORIES)[number];

export const REVIEW_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const INQUIRY_STATUSES = ['NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST'] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const PRODUCT_SORTS = ['featured', 'price-asc', 'price-desc', 'newest'] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];
