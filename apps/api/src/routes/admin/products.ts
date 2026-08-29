import { Router } from 'express';
import { prisma } from '../../db.js';
import { badRequest, notFound } from '../../lib/errors.js';
import { parseOrThrow } from '../../lib/parse.js';
import { adminProductSchema } from '../../lib/validation.js';
import { toProduct } from '../../lib/serialize.js';
import { upload, processUpload } from '../../lib/images.js';
import { uploadLimiter } from '../../middleware/rateLimit.js';

export const adminProductsRouter: Router = Router();

const include = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' } },
  sizes: { orderBy: { sortOrder: 'asc' } },
  fabrics: { include: { fabric: true } },
} as const;

/** Admin listing includes service categories and unfeatured items — no filters. */
adminProductsRouter.get('/', async (_req, res, next) => {
  try {
    const rows = await prisma.product.findMany({ include, orderBy: { createdAt: 'desc' } });
    res.json({ items: rows.map(toProduct), total: rows.length, page: 1, pageSize: rows.length });
  } catch (err) {
    next(err);
  }
});

adminProductsRouter.get('/:id', async (req, res, next) => {
  try {
    const row = await prisma.product.findUnique({ where: { id: req.params.id }, include });
    if (!row) throw notFound('Product');
    res.json(toProduct(row));
  } catch (err) {
    next(err);
  }
});

adminProductsRouter.post('/', async (req, res, next) => {
  try {
    const input = parseOrThrow(adminProductSchema, req.body);
    await assertReferences(input.categoryId, input.fabricIds);

    const clash = await prisma.product.findUnique({ where: { slug: input.slug } });
    if (clash) throw badRequest('Slug already in use', { slug: 'Another piece already uses this' });

    const row = await prisma.product.create({
      data: {
        ...toColumns(input),
        fabrics: { create: input.fabricIds.map((fabricId) => ({ fabricId })) },
      },
      include,
    });
    res.status(201).json(toProduct(row));
  } catch (err) {
    next(err);
  }
});

adminProductsRouter.put('/:id', async (req, res, next) => {
  try {
    const input = parseOrThrow(adminProductSchema, req.body);
    await assertReferences(input.categoryId, input.fabricIds);

    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('Product');

    const clash = await prisma.product.findUnique({ where: { slug: input.slug } });
    if (clash && clash.id !== existing.id) {
      throw badRequest('Slug already in use', { slug: 'Another piece already uses this' });
    }

    const row = await prisma.product.update({
      where: { id: existing.id },
      data: {
        ...toColumns(input),
        // Replace the fabric set wholesale rather than diffing — the join table
        // carries no extra data worth preserving.
        fabrics: {
          deleteMany: {},
          create: input.fabricIds.map((fabricId) => ({ fabricId })),
        },
      },
      include,
    });
    res.json(toProduct(row));
  } catch (err) {
    next(err);
  }
});

adminProductsRouter.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.product.findUnique({
      where: { id: req.params.id },
      select: { id: true, _count: { select: { inquiries: true } } },
    });
    if (!existing) throw notFound('Product');

    // Inquiries are business records. The schema nulls the reference on delete
    // rather than cascading, but warn loudly in the response.
    await prisma.product.delete({ where: { id: existing.id } });
    res.json({ ok: true, detachedInquiries: existing._count.inquiries });
  } catch (err) {
    next(err);
  }
});

/** Upload one or more photographs and attach them to a product. */
adminProductsRouter.post(
  '/:id/images',
  uploadLimiter,
  upload.array('images', 8),
  async (req, res, next) => {
    try {
      // Express 5 widens `req.params` when a route has several handlers, so
      // narrow it explicitly rather than fighting the inference.
      const { id } = req.params as { id: string };

      const product = await prisma.product.findUnique({
        where: { id },
        select: { id: true, nameEn: true },
      });
      if (!product) throw notFound('Product');

      const files = (req.files as Express.Multer.File[] | undefined) ?? [];
      if (files.length === 0) {
        throw badRequest('No images uploaded', { images: 'Choose at least one file' });
      }

      // Append after whatever is already attached.
      let sortOrder = await prisma.image.count({ where: { productId: product.id } });
      const created = [];
      for (const file of files) {
        const processed = await processUpload(file.buffer);
        sortOrder += 1;
        created.push(
          await prisma.image.create({
            data: {
              productId: product.id,
              url: processed.url,
              alt: `${product.nameEn} — Aura Interior`,
              width: processed.width,
              height: processed.height,
              blurhash: processed.blurhash,
              sortOrder,
            },
          }),
        );
      }

      res.status(201).json({ images: created });
    } catch (err) {
      next(err);
    }
  },
);

adminProductsRouter.delete('/:id/images/:imageId', async (req, res, next) => {
  try {
    const image = await prisma.image.findFirst({
      where: { id: req.params.imageId, productId: req.params.id },
    });
    if (!image) throw notFound('Image');
    await prisma.image.delete({ where: { id: image.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ── helpers ──────────────────────────────────────────────────────────────────

async function assertReferences(categoryId: string, fabricIds: string[]): Promise<void> {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw badRequest('Unknown category', { categoryId: 'Choose a valid category' });

  if (fabricIds.length === 0) return;
  const found = await prisma.fabric.count({ where: { id: { in: fabricIds } } });
  if (found !== fabricIds.length) {
    throw badRequest('Unknown fabric selected', { fabricIds: 'One or more fabrics do not exist' });
  }
}

/** Flatten the API's nested shape into the schema's sibling columns. */
function toColumns(input: ReturnType<typeof adminProductSchema.parse>) {
  return {
    slug: input.slug,
    nameHy: input.name.hy,
    nameRu: input.name.ru,
    nameEn: input.name.en,
    descHy: input.description.hy,
    descRu: input.description.ru,
    descEn: input.description.en,
    materialHy: input.defaultMaterial.hy,
    materialRu: input.defaultMaterial.ru,
    materialEn: input.defaultMaterial.en,
    priceFrom: input.priceFrom,
    categoryId: input.categoryId,
    widthCm: input.dimensions.widthCm,
    depthCm: input.dimensions.depthCm,
    heightCm: input.dimensions.heightCm,
    customSizeAvailable: input.customSizeAvailable,
    leadTimeDays: input.leadTimeDays,
    featured: input.featured,
  };
}
