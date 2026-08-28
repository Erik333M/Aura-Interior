import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from './env.js';

/**
 * Prisma 7 connects through a driver adapter rather than a URL in the schema,
 * and the adapter is chosen from the URL scheme at runtime.
 *
 * This is the whole payoff of keeping the schema Postgres-portable: SQLite for
 * local development, Postgres in production, and nothing else in the codebase
 * knows the difference. Serverless hosts (Vercel, Lambda) have an ephemeral,
 * read-only filesystem, so SQLite cannot work there at all — a `postgres://`
 * DATABASE_URL is what makes a deploy possible.
 *
 * NOTE: schema.prisma's `provider` must match. `npm run db:use-postgres` flips
 * it, since Prisma reads the provider at generate time, not run time.
 */
const url = env.DATABASE_URL;
const isPostgres = url.startsWith('postgres://') || url.startsWith('postgresql://');

const adapter = isPostgres
  ? new PrismaPg({
      connectionString: url,
      // Serverless invocations are short-lived and numerous; a small pool with
      // a fast idle timeout avoids exhausting Postgres' connection limit.
      max: 3,
      idleTimeoutMillis: 10_000,
    })
  : new PrismaBetterSqlite3({
      // better-sqlite3 wants a filesystem path, not a `file:` URL.
      url: url.startsWith('file:') ? url.slice('file:'.length) : url,
    });

export const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export const databaseKind = isPostgres ? 'postgres' : 'sqlite';

export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
}
