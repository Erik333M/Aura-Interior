import { Router } from 'express';
import type { Paginated, Review } from '@aura/types';
import { prisma } from '../db.js';
import { badRequest, notFound } from '../lib/errors.js';
import { toReview } from '../lib/serialize.js';
import { parseOrThrow } from '../lib/parse.js';
import { createReviewSchema, reviewQuerySchema } from '../lib/validation.js';
import { reviewLimiter } from '../middleware/rateLimit.js';

export const reviewsRouter: Router = Router();

/** Public listing — APPROVED only, always. authorEmail is never exposed. */
reviewsRouter.get('/', async (req, res, next) => {
  try {
    const q = parseOrThrow(reviewQuerySchema, req.query);

    const where = {
      status: 'APPROVED',
      ...(q.productId ? { productId: q.productId } : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      prisma.review.count({ where }),
    ]);

    const body: Paginated<Review> = {
      items: rows.map(toReview),
      total,
      page: q.page,
      pageSize: q.pageSize,
    };
    res.json(body);
  } catch (err) {
    next(err);
  }
});

/** Submissions always land as PENDING — nothing appears publicly unmoderated. */
reviewsRouter.post('/', reviewLimiter, async (req, res, next) => {
  try {
    const input = parseOrThrow(createReviewSchema, req.body);

    // Honeypot: a filled hidden field means a bot. Answer 201 so it learns
    // nothing, but store nothing.
    if (input.website) {
      res.status(201).json({ ok: true });
      return;
    }

    if (input.productId) {
      const exists = await prisma.product.findUnique({
        where: { id: input.productId },
        select: { id: true },
      });
      if (!exists) throw badRequest('Unknown product', { productId: 'This piece does not exist' });
    }

    const row = await prisma.review.create({
      data: {
        ...(input.productId ? { productId: input.productId } : {}),
        authorName: input.authorName,
        authorEmail: input.authorEmail,
        rating: input.rating,
        body: input.body,
        status: 'PENDING',
      },
    });

    // 202: accepted for moderation, not yet published.
    res.status(202).json({
      id: row.id,
      status: row.status,
      message: 'Thank you — your review will appear once it has been checked.',
    });
  } catch (err) {
    next(err);
  }
});

/** Rating summary for a product, computed from approved reviews only. */
reviewsRouter.get('/summary/:productId', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.productId },
      select: { id: true },
    });
    if (!product) throw notFound('Product');

    const rows = await prisma.review.findMany({
      where: { productId: product.id, status: 'APPROVED' },
      select: { rating: true },
    });

    const breakdown: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of rows) {
      const key = r.rating as 1 | 2 | 3 | 4 | 5;
      if (key >= 1 && key <= 5) breakdown[key] += 1;
    }
    const count = rows.length;
    const total = rows.reduce((sum, r) => sum + r.rating, 0);

    res.json({
      average: count === 0 ? 0 : Math.round((total / count) * 10) / 10,
      count,
      breakdown,
    });
  } catch (err) {
    next(err);
  }
});
