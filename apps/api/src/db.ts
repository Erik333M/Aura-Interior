import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { env } from './env.js';

/**
 * Prisma 7 connects through a driver adapter rather than a URL in the schema.
 * This is the single place that knows the database is SQLite — moving to
 * Postgres means swapping this import for `@prisma/adapter-pg` and changing the
 * provider in schema.prisma. Nothing else in the codebase changes.
 *
 * better-sqlite3 wants a filesystem path, not a `file:` URL, so strip the scheme.
 */
const url = env.DATABASE_URL.startsWith('file:')
  ? env.DATABASE_URL.slice('file:'.length)
  : env.DATABASE_URL;

const adapter = new PrismaBetterSqlite3({ url });

export const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
}
