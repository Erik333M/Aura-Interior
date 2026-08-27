import { Router } from 'express';
import type { SearchResponse } from '@aura/types';
import { prisma } from '../db.js';
import { parseOrThrow } from '../lib/parse.js';
import { searchQuerySchema } from '../lib/validation.js';
import { toCategory, toProduct } from '../lib/serialize.js';

export const searchRouter: Router = Router();

/**
 * Trilingual search across product names, descriptions and category names.
 *
 * TWO KNOWN LIMITATIONS, both inherited from SQLite and both fixed by the
 * Postgres swap the schema was kept portable for:
 *
 *  1. LIKE is case-insensitive for ASCII only, so Armenian and Russian queries
 *     are case-sensitive today. Postgres: `mode: 'insensitive'`.
 *  2. There is no accent folding, so "boucle" does not match "Bouclé".
 *     Postgres: `unaccent`, or a normalised search column.
 *
 * Neither is worth emulating in application code for a catalogue this size —
 * it would mean loading every row to compare in JS.
 */
searchRouter.get('/', async (req, res, next) => {
  try {
    const { q, limit } = parseOrThrow(searchQuerySchema, req.query);

    const match = { contains: q };

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          category: { isService: false },
          OR: [
            { nameHy: match },
            { nameRu: match },
            { nameEn: match },
            { descHy: match },
            { descRu: match },
            { descEn: match },
            // Material copy names the fabrics ("Bouclé over a hardwood frame"),
            // which is what people actually search for.
            { materialHy: match },
            { materialRu: match },
            { materialEn: match },
          ],
        },
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          fabrics: { include: { fabric: true } },
        },
        orderBy: [{ featured: 'desc' }, { priceFrom: 'asc' }],
        take: limit,
      }),
      prisma.category.findMany({
        where: {
          OR: [{ nameHy: match }, { nameRu: match }, { nameEn: match }],
        },
        include: { _count: { select: { products: true } } },
        orderBy: { sortOrder: 'asc' },
        take: 5,
      }),
    ]);

    const body: SearchResponse = {
      query: q,
      products: products.map(toProduct),
      categories: categories.map(toCategory),
      total: products.length + categories.length,
    };
    res.json(body);
  } catch (err) {
    next(err);
  }
});
