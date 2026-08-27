import { createApp } from './app.js';
import { env } from './env.js';
import { disconnect, prisma } from './db.js';

const app = createApp();

const server = app.listen(env.API_PORT, () => {
  console.log(`  ▸ aura api    http://localhost:${env.API_PORT}/api  (${env.NODE_ENV})`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`\n[api] ${signal} received, shutting down`);
  server.close();
  await disconnect();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

// Fail fast and loudly if the database is unreachable at boot.
prisma.$queryRaw`SELECT 1`.catch((err: unknown) => {
  console.error('[api] cannot reach the database. Did you run `npm run db:push`?\n', err);
  process.exit(1);
});
