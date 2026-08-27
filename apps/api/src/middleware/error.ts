import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { ApiError } from '@aura/types';
import { HttpError } from '../lib/errors.js';
import { isProd } from '../env.js';

export const notFoundHandler: RequestHandler = (req, res) => {
  const body: ApiError = {
    error: { code: 'NOT_FOUND', message: `No route for ${req.method} ${req.originalUrl}` },
  };
  res.status(404).json(body);
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json(err.toBody());
    return;
  }

  // Anything reaching here is unexpected: log it in full, tell the client nothing.
  console.error('[api] unhandled error:', err);

  const body: ApiError = {
    error: {
      code: 'INTERNAL_ERROR',
      message: isProd ? 'Something went wrong.' : String(err instanceof Error ? err.stack : err),
    },
  };
  res.status(500).json(body);
};
