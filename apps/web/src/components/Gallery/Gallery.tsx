import { useCallback, useEffect, useState } from 'react';
import type { ProductImage } from '@aura/types';
import { useI18n } from '@/i18n';
import { ResponsiveImage } from '@/components/ResponsiveImage';
import { Modal } from '@/components/Modal';
import styles from './Gallery.module.scss';

/**
 * Large image + thumbnail rail, with a click-to-zoom lightbox.
 *
 * Fully keyboard operable: thumbnails are real buttons, the lightbox traps
 * focus (via Modal), and ← / → step through images while it is open.
 */
export function Gallery({ images, alt }: { images: ProductImage[]; alt: string }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const current = images[index];
  const count = images.length;

  const go = useCallback(
    (delta: number) => setIndex((i) => Math.min(count - 1, Math.max(0, i + delta))),
    [count],
  );

  // Arrow keys drive the lightbox. Bound only while it is open so they do not
  // hijack arrow keys on the rest of the page.
  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoomed, go]);

  if (!current) return null;

  return (
    <div className={styles.gallery}>
      <div className={styles.mainWrap}>
        <button
          type="button"
          className={styles.main}
          onClick={() => setZoomed(true)}
          aria-label={`${alt} — ${t.product.zoom}`}
        >
          <ResponsiveImage
            base={current.url}
            alt={alt}
            width={current.width}
            height={current.height}
            blurhash={current.blurhash}
            sizes="(min-width: 1024px) 55vw, 100vw"
            priority
          />
        </button>
        <span className={styles.zoomHint}>
          <svg viewBox="0 0 16 16" width="11" height="11" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" />
            <path
              d="M10.5 10.5L14 14M7 5.2v3.6M5.2 7h3.6"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          {t.product.zoom}
        </span>
      </div>

      {count > 1 && (
        <ul className={styles.rail} role="list" aria-label={t.product.gallery}>
          {images.map((img, i) => (
            <li key={img.id}>
              <button
                type="button"
                className={`${styles.thumb} ${i === index ? styles.thumbActive : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`${alt} ${i + 1} / ${count}`}
                aria-current={i === index ? 'true' : undefined}
              >
                <ResponsiveImage
                  base={img.url}
                  alt=""
                  width={img.width}
                  height={img.height}
                  blurhash={img.blurhash}
                  sizes="76px"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={zoomed}
        onClose={() => setZoomed(false)}
        wide
        title={alt}
        closeLabel={t.product.closeZoom}
      >
        <div className={styles.lightbox}>
          <img
            className={styles.lightboxImage}
            src={`${current.url}-1600.jpg`}
            alt={alt}
            width={current.width}
            height={current.height}
          />
          <div className={styles.lightboxBar}>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => go(-1)}
              disabled={index === 0}
              aria-label={t.product.previous}
            >
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
                <path
                  d="M10 3L5 8l5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span className={styles.counter}>
              {index + 1} / {count}
            </span>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => go(1)}
              disabled={index === count - 1}
              aria-label={t.product.next}
            >
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
                <path
                  d="M6 3l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
