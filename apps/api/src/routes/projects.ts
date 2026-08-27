import { Router } from 'express';
import { prisma } from '../db.js';
import { notFound } from '../lib/errors.js';
import { toProject } from '../lib/serialize.js';

export const projectsRouter: Router = Router();

projectsRouter.get('/', async (_req, res, next) => {
  try {
    const rows = await prisma.project.findMany({
      orderBy: [{ featured: 'desc' }, { year: 'desc' }],
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });
    res.json(rows.map(toProject));
  } catch (err) {
    next(err);
  }
});

projectsRouter.get('/:slug', async (req, res, next) => {
  try {
    const row = await prisma.project.findUnique({
      where: { slug: req.params.slug },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!row) throw notFound('Project');
    res.json(toProject(row));
  } catch (err) {
    next(err);
  }
});
