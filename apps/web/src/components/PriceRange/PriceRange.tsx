import { useEffect, useId, useRef, useState } from 'react';
import { useI18n } from '@/i18n';
import styles from './PriceRange.module.scss';

export interface PriceRangeProps {
  /** Whole-catalogue bounds. Fixed, so the track does not move while dragging. */
  min: number;
  max: number;
  /** Current selection; undefined means "unbounded on this side". */
  valueMin?: number;
  valueMax?: number;
  /** Match distribution under every other active filter. */
  histogram: number[];
  onChange: (next: { priceMin?: number; priceMax?: number }) => void;
}

/**
 * Dual-handle AMD range with a live histogram above it.
 *
 * Built from two native <input type="range"> elements rather than pointer
 * handlers on divs: that gives real keyboard support, correct touch behaviour
 * and screen-reader announcements for free. The inputs overlap, so
 * `pointer-events` is disabled on the bars and re-enabled on the thumbs only.
 */
export function PriceRange({ min, max, valueMin, valueMax, histogram, onChange }: PriceRangeProps) {
  const { t, price } = useI18n();
  const id = useId();

  // Round to a sensible AMD increment so the handles don't emit 683,417 ֏.
  const step = Math.max(1000, Math.round((max - min) / 100 / 1000) * 1000);

  const [lo, setLo] = useState(valueMin ?? min);
  const [hi, setHi] = useState(valueMax ?? max);
  const dragging = useRef(false);

  // Follow external changes (back/forward, clear-all) but never yank the handle
  // out from under a finger that is currently dragging it.
  useEffect(() => {
    if (dragging.current) return;
    setLo(valueMin ?? min);
    setHi(valueMax ?? max);
  }, [valueMin, valueMax, min, max]);

  const commit = (nextLo: number, nextHi: number): void => {
    onChange({
      // Omit a bound entirely when it sits at the catalogue edge — that keeps
      // the URL clean and means "no filter" rather than "filtered to everything".
      priceMin: nextLo > min ? nextLo : undefined,
      priceMax: nextHi < max ? nextHi : undefined,
    });
  };

  const pct = (v: number): number => (max === min ? 0 : ((v - min) / (max - min)) * 100);
  const peak = Math.max(1, ...histogram);
  const buckets = histogram.length;

  return (
    <div className={styles.wrap}>
      <div className={styles.histogram} aria-hidden="true">
        {histogram.map((count, i) => {
          const bucketStart = min + ((max - min) * i) / buckets;
          const bucketEnd = min + ((max - min) * (i + 1)) / buckets;
          const inRange = bucketEnd >= lo && bucketStart <= hi;
          return (
            <span
              key={i}
              className={`${styles.bar} ${inRange ? styles.barActive : styles.barMuted}`}
              style={{ height: `${Math.max(4, (count / peak) * 100)}%` }}
            />
          );
        })}
      </div>

      <div className={styles.slider}>
        <span className={styles.track} aria-hidden="true" />
        <span
          className={styles.trackFill}
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
          aria-hidden="true"
        />

        <input
          id={`${id}-min`}
          className={styles.input}
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          aria-label={t.catalogue.minPrice}
          aria-valuetext={price(lo, false)}
          onPointerDown={() => (dragging.current = true)}
          onPointerUp={() => (dragging.current = false)}
          onKeyUp={() => (dragging.current = false)}
          onChange={(e) => {
            // Never let the handles cross.
            const next = Math.min(Number(e.target.value), hi - step);
            setLo(next);
            commit(next, hi);
          }}
        />
        <input
          id={`${id}-max`}
          className={styles.input}
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          aria-label={t.catalogue.maxPrice}
          aria-valuetext={price(hi, false)}
          onPointerDown={() => (dragging.current = true)}
          onPointerUp={() => (dragging.current = false)}
          onKeyUp={() => (dragging.current = false)}
          onChange={(e) => {
            const next = Math.max(Number(e.target.value), lo + step);
            setHi(next);
            commit(lo, next);
          }}
        />
      </div>

      <p className={styles.values}>
        <span className={styles.value}>{price(lo, false)}</span>
        <span aria-hidden="true">—</span>
        <span className={styles.value}>{price(hi, false)}</span>
      </p>
    </div>
  );
}
