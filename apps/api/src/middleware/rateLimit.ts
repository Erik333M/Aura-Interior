import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit';
import type { ApiError } from '@aura/types';

/**
 * Rate limits. The brief asks for strict limits on every POST, and the reason
 * differs per route: inquiries are the conversion path (protect the inbox from
 * flooding), reviews are user-generated content (protect moderation), and login
 * is a credential endpoint (slow down guessing).
 */

const tooMany = (message: string) => {
  const body: ApiError = { error: { code: 'RATE_LIMITED', message } };
  return body;
};

const base = {
  standardHeaders: 'draft-7' as const,
  legacyHeaders: false,
};

/** Broad ceiling for reads. */
export const generalLimiter: RateLimitRequestHandler = rateLimit({
  ...base,
  windowMs: 60_000,
  limit: 240,
  message: tooMany('Too many requests. Please slow down.'),
});

/** The conversion endpoint. Generous enough for a real customer who resubmits. */
export const inquiryLimiter: RateLimitRequestHandler = rateLimit({
  ...base,
  windowMs: 15 * 60_000,
  limit: 5,
  message: tooMany('You have sent several enquiries already. Please wait a little while.'),
});

export const reviewLimiter: RateLimitRequestHandler = rateLimit({
  ...base,
  windowMs: 60 * 60_000,
  limit: 3,
  message: tooMany('You have submitted several reviews already. Please try again later.'),
});

/** Credential endpoint: only failures count, so a legitimate admin logging in
 *  repeatedly is never locked out by their own successes. */
export const loginLimiter: RateLimitRequestHandler = rateLimit({
  ...base,
  windowMs: 15 * 60_000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: tooMany('Too many sign-in attempts. Try again in a few minutes.'),
});

export const uploadLimiter: RateLimitRequestHandler = rateLimit({
  ...base,
  windowMs: 60_000,
  limit: 30,
  message: tooMany('Too many uploads. Please wait a moment.'),
});
