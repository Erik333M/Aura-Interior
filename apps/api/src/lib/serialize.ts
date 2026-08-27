import type {
  Category,
  Fabric,
  Inquiry,
  InquiryStatus,
  FabricCategory,
  Product,
  ProductImage,
  Project,
  RatingSummary,
  Review,
  ReviewStatus,
} from '@aura/types';
import { pick } from './localized.js';

// See eslint.config.js: `any` is permitted in this file only. Prisma rows are
// structurally dynamic, and this module is the boundary where they become typed.
type Row = any;

export function toImage(row: Row): ProductImage {
  return {
    id: row.id,
    url: row.url,
    alt: row.alt,
    width: row.width,
    height: row.height,
    blurhash: row.blurhash,
    sortOrder: row.sortOrder,
  };
}

export function toCategory(row: Row): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: pick(row, 'name'),
    description: pick(row, 'desc'),
    heroImage: row.heroImage ?? null,
    ...(row._count?.products !== undefined ? { productCount: row._count.products } : {}),
  };
}

export function toFabric(row: Row): Fabric {
  return {
    id: row.id,
    name: pick(row, 'name'),
    hex: row.hex,
    textureUrl: row.textureUrl ?? null,
    category: row.category as FabricCategory,
  };
}

export function toReview(row: Row): Review {
  return {
    id: row.id,
    productId: row.productId ?? null,
    authorName: row.authorName,
    rating: row.rating as 1 | 2 | 3 | 4 | 5,
    body: row.body,
    status: row.status as ReviewStatus,
    createdAt: row.createdAt.toISOString(),
  };
}

/** Average + per-star counts, computed from APPROVED reviews only. */
export function toRatingSummary(reviews: Array<{ rating: number }>): RatingSummary {
  const breakdown: RatingSummary['breakdown'] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) {
    const key = r.rating as 1 | 2 | 3 | 4 | 5;
    if (key >= 1 && key <= 5) breakdown[key] += 1;
  }
  const count = reviews.length;
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return {
    average: count === 0 ? 0 : Math.round((total / count) * 10) / 10,
    count,
    breakdown,
  };
}

export function toProduct(row: Row): Product {
  const approved: Array<{ rating: number }> = (row.reviews ?? []).filter(
    (r: Row) => r.status === 'APPROVED',
  );

  return {
    id: row.id,
    slug: row.slug,
    name: pick(row, 'name'),
    description: pick(row, 'desc'),
    priceFrom: row.priceFrom,
    categoryId: row.categoryId,
    ...(row.category ? { category: toCategory(row.category) } : {}),
    defaultMaterial: pick(row, 'material'),
    dimensions: {
      widthCm: row.widthCm,
      depthCm: row.depthCm,
      heightCm: row.heightCm,
    },
    customSizeAvailable: row.customSizeAvailable,
    leadTimeDays: row.leadTimeDays,
    featured: row.featured,
    createdAt: row.createdAt.toISOString(),
    images: (row.images ?? []).map(toImage),
    // ProductFabric is a join row; unwrap it to the fabric itself.
    fabrics: (row.fabrics ?? []).map((pf: Row) => toFabric(pf.fabric ?? pf)),
    ...(row.reviews ? { reviews: approved.map((r) => toReview(r as Row)) } : {}),
    ...(row.reviews ? { rating: toRatingSummary(approved) } : {}),
  };
}

export function toProject(row: Row): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: pick(row, 'title'),
    description: pick(row, 'desc'),
    year: row.year,
    location: pick(row, 'location'),
    images: (row.images ?? []).map(toImage),
    createdAt: row.createdAt.toISOString(),
  };
}

export function toInquiry(row: Row): Inquiry {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email ?? null,
    message: row.message,
    productId: row.productId ?? null,
    product: row.product
      ? { id: row.product.id, slug: row.product.slug, name: pick(row.product, 'name') }
      : null,
    fabricId: row.fabricId ?? null,
    fabric: row.fabric
      ? { id: row.fabric.id, name: pick(row.fabric, 'name'), hex: row.fabric.hex }
      : null,
    customDimensions: row.customDimensions ?? null,
    status: row.status as InquiryStatus,
    createdAt: row.createdAt.toISOString(),
  };
}
