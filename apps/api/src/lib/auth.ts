import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../env.js';

export interface AdminClaims {
  sub: string;
  email: string;
}

export function signAdminToken(claims: AdminClaims): string {
  return jwt.sign(claims, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAdminToken(token: string): AdminClaims | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded === 'string') return null;
    const { sub, email } = decoded as Record<string, unknown>;
    if (typeof sub !== 'string' || typeof email !== 'string') return null;
    return { sub, email };
  } catch {
    // Expired, malformed, or signed with a different secret — all the same to
    // the caller, and none of them should leak a reason to the client.
    return null;
  }
}

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
