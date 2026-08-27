import { Router } from 'express';
import { requireAdmin } from '../../middleware/auth.js';
import { adminAuthRouter } from './auth.js';
import { adminProductsRouter } from './products.js';
import { adminModerationRouter } from './moderation.js';

export const adminRouter: Router = Router();

// Login and /me handle their own auth — /me is gated, /login must not be.
adminRouter.use('/', adminAuthRouter);

// Everything below this line requires a valid bearer token.
adminRouter.use(requireAdmin);
adminRouter.use('/products', adminProductsRouter);
adminRouter.use('/', adminModerationRouter);
