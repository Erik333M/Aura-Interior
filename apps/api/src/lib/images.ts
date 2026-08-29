import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import sharp from 'sharp';
import type { UploadedImage } from '@aura/types';

/**
 * Admin image pipeline: upload → sharp → AVIF + WebP + JPEG at 400/800/1600px
 * plus a blur placeholder.
 *
 * Deliberately produces the SAME filenames and manifest shape as
 * scripts/generate-placeholders.ts, so an uploaded photo and a generated
 * placeholder are indistinguishable to the client's ResponsiveImage.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.resolve(HERE, '../../uploads');

const WIDTHS = [400, 800, 1600] as const;
/** See scripts/generate-placeholders.ts — effort above 1 buys kB and costs seconds. */
const AVIF_EFFORT = 1;
const MAX_WIDTH = Math.max(...WIDTHS);
/** Product photography is portrait — furniture stands up. */
const DEFAULT_RATIO = 4 / 5;

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/tiff']);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      cb(new Error(`Unsupported image type: ${file.mimetype}`));
      return;
    }
    cb(null, true);
  },
});

export async function processUpload(
  buffer: Buffer,
  ratio: number = DEFAULT_RATIO,
): Promise<UploadedImage> {
  await mkdir(UPLOAD_DIR, { recursive: true });

  const key = randomUUID();
  const height = Math.round(MAX_WIDTH / ratio);

  // `position: 'attention'` crops toward the most visually salient region,
  // which for furniture photography is the piece rather than the backdrop.
  const master = await sharp(buffer)
    .rotate() // honour EXIF orientation before any cropping
    .resize(MAX_WIDTH, height, { fit: 'cover', position: 'attention' })
    .toBuffer();

  await Promise.all(
    WIDTHS.flatMap((w) => {
      const h = Math.round(w / ratio);
      const resized = () => sharp(master).resize(w, h, { fit: 'cover' });
      return [
        resized()
          .avif({ quality: 55, effort: AVIF_EFFORT })
          .toFile(path.join(UPLOAD_DIR, `${key}-${w}.avif`)),
        resized()
          .webp({ quality: 72 })
          .toFile(path.join(UPLOAD_DIR, `${key}-${w}.webp`)),
        resized()
          .jpeg({ quality: 78, mozjpeg: true })
          .toFile(path.join(UPLOAD_DIR, `${key}-${w}.jpg`)),
      ];
    }),
  );

  const blur = await sharp(master)
    .resize(20, Math.max(1, Math.round(20 / ratio)), { fit: 'cover' })
    .blur(1.2)
    .jpeg({ quality: 40 })
    .toBuffer();

  return {
    url: `/uploads/${key}`,
    width: MAX_WIDTH,
    height,
    blurhash: `data:image/jpeg;base64,${blur.toString('base64')}`,
  };
}
