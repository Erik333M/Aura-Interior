import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import type { Product } from '@aura/types';
import { useI18n } from '@/i18n';
import { Modal } from '@/components/Modal';
import { track } from '@/lib/analytics';
import styles from './CardZoom.module.scss';

/**
 * Quick-look zoom from a catalogue card.
 *
 * The point is to let someone judge the fabric and the stitching without
 * losing their place in a filtered grid — the pattern every marketplace uses,
 * and the one thing a photograph of upholstery actually needs. Opening the
 * product page for that costs the customer their scroll position and their
 * filters.
 *
 * Click the image to go to 2x, and the transform origin follows the pointer so
 * the part you aimed at is the part you get.
 */
export function CardZoom({ product }: { product: Product }) {
  const { t, tl, price } = useI18n();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const stageRef = useRef<HTMLDivElement>(null);

  const images = product.images;
  const current = images[index];
  const name = tl(product.name);

  const go = useCallback(
    (delta: number) => {
      setZoomed(false);
      setIndex((i) => Math.min(images.length - 1, Math.max(0, i + delta)));
    },
    [images.length],
  );

  // Arrows step through the gallery only while the viewer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, go]);

  const toggleZoom = (e: MouseEvent<HTMLDivElement>): void => {
    const el = stageRef.current;
    if (el && !zoomed) {
      const r = el.getBoundingClientRect();
      setOrigin(
        `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`,
      );
    }
    setZoomed((z) => !z);
  };

  if (images.length === 0) return null;

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-label={`${t.product.zoom}: ${name}`}
        title={`${t.product.zoom}: ${name}`}
        onClick={(e) => {
          // The whole card is a link; a quick look must not navigate.
          e.preventDefault();
          e.stopPropagation();
          setIndex(0);
          setZoomed(false);
          track('product_viewed', { slug: product.slug, via: 'card_zoom' });
          setOpen(true);
        }}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="4.6" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M10.6 10.6L14 14M7 5.2v3.6M5.2 7h3.6"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        wide
        title={name}
        closeLabel={t.product.closeZoom}
      >
        <div className={styles.viewer}>
          {current && (
            <div
              ref={stageRef}
              className={`${styles.stage} ${zoomed ? styles.stageZoomed : ''}`}
              onClick={toggleZoom}
            >
              <img
                className={`${styles.image} ${zoomed ? styles.imageZoomed : ''}`}
                style={{ transformOrigin: origin }}
                src={`${current.url}-1600.jpg`}
                alt={name}
                width={current.width}
                height={current.height}
              />
            </div>
          )}

          <div className={styles.bar}>
            <button
              type="button"
              className={styles.nav}
              onClick={() => go(-1)}
              disabled={index === 0}
              aria-label={t.product.previous}
            >
              <svg viewBox="0 0 16 16" width="15" height="15" fill="none" aria-hidden="true">
                <path
                  d="M10 3L5 8l5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <span className={styles.meta}>
              <span className={styles.name}>{name}</span>
              <span className={styles.price}>{price(product.priceFrom)}</span>
            </span>

            <button
              type="button"
              className={styles.nav}
              onClick={() => go(1)}
              disabled={index === images.length - 1}
              aria-label={t.product.next}
            >
              <svg viewBox="0 0 16 16" width="15" height="15" fill="none" aria-hidden="true">
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

          <span className={styles.hint}>
            {zoomed ? t.product.closeZoom : t.product.zoom} · {index + 1} / {images.length}
          </span>
        </div>
      </Modal>
    </>
  );
}
