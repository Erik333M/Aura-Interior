import { z } from 'zod';
import { INQUIRY_STATUSES } from '@aura/types';

/**
 * Every request body is parsed through one of these before it reaches a route.
 * Nothing downstream trusts `req.body`.
 */

/** Armenian mobile numbers, plus international forms customers actually type. */
const phone = z
  .string()
  .trim()
  .min(6, 'Phone number is too short')
  .max(32)
  .regex(/^[+()\d\s-]+$/, 'Phone number contains invalid characters');

const localized = z.object({
  hy: z.string().trim().min(1),
  ru: z.string().trim().min(1),
  en: z.string().trim().min(1),
});

export const createInquirySchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(120),
  phone,
  email: z.email('Enter a valid email address').max(200).optional().or(z.literal('')),
  message: z.string().trim().min(1, 'Please tell us what you need').max(4000),
  productId: z.string().trim().min(1).max(64).optional(),
  fabricId: z.string().trim().min(1).max(64).optional(),
  customDimensions: z.string().trim().max(400).optional(),
  /**
   * Honeypot. Deliberately permissive: validating it to max(0) would return a
   * field error naming `website`, teaching the bot exactly which input to leave
   * alone. The route accepts the submission, answers 201, and stores nothing.
   */
  website: z.string().max(200).optional(),
});

export const createReviewSchema = z.object({
  productId: z.string().trim().min(1).max(64).optional(),
  authorName: z.string().trim().min(2, 'Please enter your name').max(120),
  authorEmail: z.email('Enter a valid email address').max(200),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(10, 'Please write at least a sentence').max(4000),
  /** Honeypot — see createInquirySchema. */
  website: z.string().max(200).optional(),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().min(3).max(200),
  password: z.string().min(1).max(200),
});

export const adminProductSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase words separated by hyphens'),
  name: localized,
  description: localized,
  defaultMaterial: localized,
  priceFrom: z.coerce.number().int().positive('Price must be greater than zero'),
  categoryId: z.string().trim().min(1),
  dimensions: z.object({
    widthCm: z.coerce.number().int().positive(),
    depthCm: z.coerce.number().int().positive(),
    heightCm: z.coerce.number().int().positive(),
  }),
  customSizeAvailable: z.coerce.boolean(),
  leadTimeDays: z.coerce.number().int().min(1).max(365),
  featured: z.coerce.boolean(),
  fabricIds: z.array(z.string().trim().min(1)).default([]),
});

export const updateReviewStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});

export const updateInquiryStatusSchema = z.object({
  status: z.enum(INQUIRY_STATUSES),
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(2, 'Search for at least two characters').max(100),
  limit: z.coerce.number().int().min(1).max(24).default(8),
});

export const inquiryQuerySchema = z.object({
  status: z.enum(INQUIRY_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export const reviewQuerySchema = z.object({
  productId: z.string().trim().min(1).max(64).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});
