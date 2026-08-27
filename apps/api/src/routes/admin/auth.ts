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

adminAuthRouter.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = parseOrThrow(adminLoginSchema, req.body);

    const admin = await prisma.adminUser.findUnique({ where: { email } });

    // Compare against a dummy hash when the user is missing so the response
    // time does not reveal whether an email exists.
    const hash =
      admin?.passwordHash ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
    const ok = await verifyPassword(password, hash);

    if (!admin || !ok) {
      // One message for both failure modes — never confirm which half was wrong.
      throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
    }

    const body: AdminSession = {
      token: signAdminToken({ sub: admin.id, email: admin.email }),
      expiresIn: env.JWT_EXPIRES_IN,
      admin: { id: admin.id, email: admin.email },
    };
    res.json(body);
  } catch (err) {
    next(err);
  }
});

/** Lets the admin UI check a stored token without a full page of data. */
adminAuthRouter.get('/me', requireAdmin, (req, res) => {
  res.json({ admin: { id: req.admin?.sub, email: req.admin?.email } });
});
