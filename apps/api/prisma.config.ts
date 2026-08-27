import { defineConfig, env } from 'prisma/config';

/**
 * Prisma 7 configuration.
 *
 * The connection URL lives here (used by `prisma db push`, `migrate`, `studio`)
 * rather than in schema.prisma, which no longer accepts a `url`. The running
 * server does not use this file at all — it connects through a driver adapter,
 * see src/db.ts.
 *
 * Env vars are supplied by dotenv-cli from the monorepo-root .env; see the
 * db:* scripts in package.json.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
