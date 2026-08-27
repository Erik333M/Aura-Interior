import { Router } from 'express';
import { prisma } from '../db.js';
import { badRequest } from '../lib/errors.js';
import { parseOrThrow } from '../lib/parse.js';
import { createInquirySchema } from '../lib/validation.js';
import { inquiryLimiter } from '../middleware/rateLimit.js';
import { sendInquiryNotification } from '../lib/mailer.js';

export const inquiriesRouter: Router = Router();

/**
 * THE conversion endpoint. Aura has no cart and no checkout — this replaces
 * both, so it is the single most important write in the system.
 *
 * Ordering matters: the row is committed FIRST, then the notification is
 * attempted. An SMTP outage must never cost a lead.
 */
inquiriesRouter.post('/', inquiryLimiter, async (req, res, next) => {
  try {
    const input = parseOrThrow(createInquirySchema, req.body);

    if (input.website) {
      // Honeypot tripped. Look successful, record nothing.
      res.status(201).json({ ok: true });
      return;
    }

    // Validate references up front so a typo'd id becomes a 400 with a field
    // message rather than a foreign-key error.
    const [product, fabric] = await Promise.all([
      input.productId
        ? prisma.product.findUnique({
            where: { id: input.productId },
            select: { id: true, nameEn: true },
          })
        : null,
      input.fabricId
        ? prisma.fabric.findUnique({
            where: { id: input.fabricId },
            select: { id: true, nameEn: true },
          })
        : null,
    ]);

    if (input.productId && !product) {
      throw badRequest('Unknown product', { productId: 'This piece does not exist' });
    }
    if (input.fabricId && !fabric) {
      throw badRequest('Unknown fabric', { fabricId: 'This fabric does not exist' });
    }

    const row = await prisma.inquiry.create({
      data: {
        name: input.name,
        phone: input.phone,
        ...(input.email ? { email: input.email } : {}),
        message: input.message,
        ...(product ? { productId: product.id } : {}),
        ...(fabric ? { fabricId: fabric.id } : {}),
        ...(input.customDimensions ? { customDimensions: input.customDimensions } : {}),
        status: 'NEW',
        ...(req.ip ? { sourceIp: req.ip } : {}),
      },
    });

    // Fire and forget: the customer should not wait on SMTP, and a failure
    // here is logged rather than surfaced.
    void sendInquiryNotification({
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      message: row.message,
      productName: product?.nameEn ?? null,
      fabricName: fabric?.nameEn ?? null,
      customDimensions: row.customDimensions,
    });

    res.status(201).json({
      id: row.id,
      status: row.status,
      message: 'Thank you — we will be in touch shortly.',
    });
  } catch (err) {
    next(err);
  }
});
