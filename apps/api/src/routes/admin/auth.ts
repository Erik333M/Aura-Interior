import { Router } from 'express';
import type { AdminSession } from '@aura/types';
import { prisma } from '../../db.js';
import { env } from '../../env.js';
import { HttpError } from '../../lib/errors.js';
import { parseOrThrow } from '../../lib/parse.js';
import { adminLoginSchema } from '../../lib/validation.js';
import { signAdminToken, verifyPassword } from '../../lib/auth.js';
import { loginLimiter } from '../../middleware/rateLimit.js';
import { requireAdmin } from '../../middleware/auth.js';

export const adminAuthRouter: Router = Router();

/**
 * Password-only sign-in.
 *
 * There is one operator — the workshop — so an email field asked for a value
 * that identified nobody. The password still verifies against the bcrypt hash
 * seeded from ADMIN_PASSWORD; it is never compared in plaintext.
 *
 * Trade-off worth naming: with no username, an attacker only has to guess one
 * secret rather than two. The rate limit on this route (10 failures / 15 min,
 * successes not counted) is what carries that weight, so do not loosen it.
 */
adminAuthRouter.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { password } = parseOrThrow(adminLoginSchema, req.body);

    const admin = await prisma.adminUser.findFirst({ orderBy: { createdAt: 'asc' } });

    // Compare against a dummy hash when no admin row exists, so a
    // misconfigured deploy does not answer noticeably faster than a wrong
    // password and advertise that fact.
    const hash =
      admin?.passwordHash ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
    const ok = await verifyPassword(password, hash);

    if (!admin || !ok) {
      throw new HttpError(401, 'INVALID_CREDENTIALS', 'Incorrect password');
    }

    const body: AdminSession = {
      token: signAdminToken({ sub: admin.id, email: admin.email }),
      expiresIn: env.JWT_EXPIRES_IN,
    };
    res.json(body);
  } catch (err) {
    next(err);
  }
});

/** Lets the admin UI check a stored token without fetching a page of data. */
adminAuthRouter.get('/me', requireAdmin, (req, res) => {
  res.json({ admin: { id: req.admin?.sub } });
});
