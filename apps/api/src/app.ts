import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './env.js';
import { productsRouter } from './routes/products.js';
import { categoriesRouter } from './routes/categories.js';
import { fabricsRouter } from './routes/fabrics.js';
import { projectsRouter } from './routes/projects.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

export function createApp(): Express {
  const app = express();

  // Behind a proxy in production, trust exactly one hop so express-rate-limit
  // reads a real client IP instead of the proxy's.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    helmet({
      // The API serves JSON and generated images, never HTML, so CSP here would
      // only ever apply to error pages. The web app sets its own.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '256kb' }));

  // Generous global ceiling — the strict per-route limits on POST endpoints
  // (reviews, inquiries) arrive with those routes in Phase 2.
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 240,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
    }),
  );

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, env: env.NODE_ENV, time: new Date().toISOString() });
  });

  app.use('/api/products', productsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/fabrics', fabricsRouter);
  app.use('/api/projects', projectsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
