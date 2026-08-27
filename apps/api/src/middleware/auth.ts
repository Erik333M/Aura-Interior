import type { NextFunction, Request, Response } from 'express';
import { unauthorized } from '../lib/errors.js';
import { verifyAdminToken, type AdminClaims } from '../lib/auth.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AdminClaims;
    }
  }
}

/** Bearer-token gate for everything under /api/admin (except login). */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  const header = req.get('authorization');
  if (!header?.startsWith('Bearer ')) {
    next(unauthorized());
    return;
  }

  const claims = verifyAdminToken(header.slice('Bearer '.length).trim());
  if (!claims) {
    next(unauthorized('Session expired — please sign in again'));
    return;
  }

  req.admin = claims;
  next();
}
