import { Router } from 'express';
import { prisma } from '../../db.js';
import { notFound } from '../../lib/errors.js';
import { parseOrThrow } from '../../lib/parse.js';
import {
  inquiryQuerySchema,
  reviewQuerySchema,
  updateInquiryStatusSchema,
  updateReviewStatusSchema,
} from '../../lib/validation.js';
import { toInquiry, toReview } from '../../lib/serialize.js';

export const adminModerationRouter: Router = Router();

// ── Review moderation queue ──────────────────────────────────────────────────

/** Defaults to PENDING: the queue should open on what needs a decision. */
adminModerationRouter.get('/reviews', async (req, res, next) => {
  try {
    const q = parseOrThrow(reviewQuerySchema, req.query);
    const where = {
      ...(q.status ? { status: q.status } : {}),
      ...(q.productId ? { productId: q.productId } : {}),
    };

    const [rows, total, pending] = await Promise.all([
      prisma.review.findMany({
        where,
        include: { product: { select: { slug: true, nameEn: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      prisma.review.count({ where }),
      prisma.review.count({ where: { status: 'PENDING' } }),
    ]);

    res.json({
      // Admins are the one audience allowed to see authorEmail — they need it
      // to follow up on a review before approving it.
      items: rows.map((r) => ({
        ...toReview(r),
        authorEmail: r.authorEmail,
        product: r.product ? { slug: r.product.slug, name: r.product.nameEn } : null,
      })),
      total,
      page: q.page,
      pageSize: q.pageSize,
      pendingCount: pending,
    });
  } catch (err) {
    next(err);
  }
});

adminModerationRouter.patch('/reviews/:id', async (req, res, next) => {
  try {
    const { status } = parseOrThrow(updateReviewStatusSchema, req.body);
    const existing = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('Review');

    const row = await prisma.review.update({
      where: { id: existing.id },
      data: { status },
    });
    res.json(toReview(row));
  } catch (err) {
    next(err);
  }
});

// ── Inquiry inbox ────────────────────────────────────────────────────────────

adminModerationRouter.get('/inquiries', async (req, res, next) => {
  try {
    const q = parseOrThrow(inquiryQuerySchema, req.query);
    const where = q.status ? { status: q.status } : {};

    const [rows, total, newCount] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        include: {
          product: { select: { id: true, slug: true, nameHy: true, nameRu: true, nameEn: true } },
          fabric: { select: { id: true, hex: true, nameHy: true, nameRu: true, nameEn: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      prisma.inquiry.count({ where }),
      prisma.inquiry.count({ where: { status: 'NEW' } }),
    ]);

    res.json({
      items: rows.map(toInquiry),
      total,
      page: q.page,
      pageSize: q.pageSize,
      newCount,
    });
  } catch (err) {
    next(err);
  }
});

adminModerationRouter.patch('/inquiries/:id', async (req, res, next) => {
  try {
    const { status } = parseOrThrow(updateInquiryStatusSchema, req.body);
    const existing = await prisma.inquiry.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('Inquiry');

    const row = await prisma.inquiry.update({
      where: { id: existing.id },
      data: { status },
      include: {
        product: { select: { id: true, slug: true, nameHy: true, nameRu: true, nameEn: true } },
        fabric: { select: { id: true, hex: true, nameHy: true, nameRu: true, nameEn: true } },
      },
    });
    res.json(toInquiry(row));
  } catch (err) {
    next(err);
  }
});

/** Counts for the admin dashboard badges. */
adminModerationRouter.get('/stats', async (_req, res, next) => {
  try {
    const [pendingReviews, newInquiries, products, projects] = await Promise.all([
      prisma.review.count({ where: { status: 'PENDING' } }),
      prisma.inquiry.count({ where: { status: 'NEW' } }),
      prisma.product.count(),
      prisma.project.count(),
    ]);
    res.json({ pendingReviews, newInquiries, products, projects });
  } catch (err) {
    next(err);
  }
});
