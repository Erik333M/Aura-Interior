import { Router } from 'express';
import { prisma } from '../db.js';
import { toCategory } from '../lib/serialize.js';

export const categoriesRouter: Router = Router();

categoriesRouter.get('/', async (_req, res, next) => {
  try {
    const rows = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    res.json(rows.map(toCategory));
  } catch (err) {
    next(err);
  }
});
