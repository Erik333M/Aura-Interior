import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { MulterError } from 'multer';
import type { ErrorRequestHandler } from 'express';
import { env } from './env.js';
import { HttpError } from './lib/errors.js';
import { UPLOAD_DIR } from './lib/images.js';
import { productsRouter } from './routes/products.js';
import { categoriesRouter } from './routes/categories.js';
import { fabricsRouter } from './routes/fabrics.js';
import { projectsRouter } from './routes/projects.js';
import { reviewsRouter } from './routes/reviews.js';
import { inquiriesRouter } from './routes/inquiries.js';
import { searchRouter } from './routes/search.js';
import { adminRouter } from './routes/admin/index.js';
import { generalLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

/** Turns multer's own errors into the same typed body as everything else. */
const uploadErrorHandler: ErrorRequestHandler = (err, _req, _res, next) => {
  if (err instanceof MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'That image is larger than 12 MB'
        : err.code === 'LIMIT_FILE_COUNT'
          ? 'Too many images at once (maximum 8)'
          : err.message;
    next(new HttpError(400, 'UPLOAD_REJECTED', message, { images: message }));
    return;
  }
  next(err);
};

export function createApp(): Express {
  const app = express();

  // Behind a proxy in production, trust exactly one hop so express-rate-limit
  // reads a real client IP instead of the proxy's.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    helmet({
      // The API serves JSON and images, never HTML, so a CSP here would only
      // ever apply to error pages. The web app sets its own.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '256kb' }));

  // Broad ceiling for everything; the strict per-route limits live with the
  // routes they protect (see middleware/rateLimit.ts).
  app.use(generalLimiter);

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, env: env.NODE_ENV, time: new Date().toISOString() });
  });

  // Admin-uploaded derivatives. Immutable: every filename is content-addressed
  // by a UUID, so a long max-age is safe.
  app.use(
    '/uploads',
    express.static(UPLOAD_DIR, {
      maxAge: '365d',
      immutable: true,
      fallthrough: true,
      index: false,
    }),
  );

  app.use('/api/products', productsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/fabrics', fabricsRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/inquiries', inquiriesRouter);
  app.use('/api/search', searchRouter);
  app.use('/api/admin', adminRouter);

  app.use(uploadErrorHandler);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
