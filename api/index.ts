/**
 * Vercel serverless entry for the Express API.
 *
 * Vercel routes every /api/* request into this one function, and Express does
 * its own routing from there — so the same app object serves both `npm run dev`
 * locally and the deployed site, with no second set of route definitions to
 * keep in sync.
 *
 * Requires a `postgres://` DATABASE_URL: the serverless filesystem is ephemeral
 * and read-only, so the SQLite used in development cannot work here. See
 * apps/api/src/db.ts.
 */
import { createApp } from '../apps/api/src/app.js';

export default createApp();
