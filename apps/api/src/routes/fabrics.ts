import { Router } from 'express';
import { prisma } from '../db.js';
import { toFabric } from '../lib/serialize.js';

export const fabricsRouter: Router = Router();

fabricsRouter.get('/', async (_req, res, next) => {
  try {
    const rows = await prisma.fabric.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(rows.map(toFabric));
  } catch (err) {
    next(err);
  }
});
