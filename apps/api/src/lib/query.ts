import { z } from 'zod';
import { FABRIC_CATEGORIES, PRODUCT_SORTS } from '@aura/types';

/** Repeated query params arrive as `?categories=a&categories=b` or `?categories=a,b`. */
const csv = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    const arr = Array.isArray(v) ? v : v.split(',');
    const cleaned = arr.map((s) => s.trim()).filter(Boolean);
    return cleaned.length > 0 ? cleaned : undefined;
  });

const bool = z
  .union([z.string(), z.boolean()])
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    return v === true || v === 'true' || v === '1';
  });

export const productQuerySchema = z.object({
  categories: csv,
  fabricCategories: csv.pipe(z.array(z.enum(FABRIC_CATEGORIES)).optional()),
  fabrics: csv,
  priceMin: z.coerce.number().int().nonnegative().optional(),
  priceMax: z.coerce.number().int().positive().optional(),
  customSize: bool,
  sort: z.enum(PRODUCT_SORTS).default('featured'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(60).default(12),
  q: z.string().trim().min(1).max(100).optional(),
});

export type ProductQueryParsed = z.infer<typeof productQuerySchema>;
