import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
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

  /**
   * Bucket count follows the available width, not the API's fixed 24.
   *
   * At 390px the sidebar gives the histogram ~310px, so 24 buckets became 10.8px
   * bars — and because the catalogue spans 48,000 to 1,400,000 with most pieces
   * under 400,000, twenty of those were near-empty stubs. It read as a broken
   * barcode rather than a distribution.
   *
   * Merging adjacent buckets until each bar is at least MIN_BAR wide keeps the
   * shape of the data and makes it legible: 12 bars on a phone, the full 24 on
   * a desktop sidebar.
   */
  const MIN_BAR = 16;
  const histRef = useRef<HTMLDivElement>(null);
  const [barsPerGroup, setBarsPerGroup] = useState(1);

  useLayoutEffect(() => {
    const el = histRef.current;
    if (!el) return;
    const measure = (): void => {
      const width = el.clientWidth;
      if (width === 0) return;
      const affordable = Math.max(4, Math.floor(width / MIN_BAR));
      setBarsPerGroup(Math.max(1, Math.ceil(histogram.length / affordable)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [histogram.length]);

  // Merge adjacent buckets, summing their counts so the distribution is
  // preserved rather than sampled.
  const grouped: number[] = [];
  for (let i = 0; i < histogram.length; i += barsPerGroup) {
    grouped.push(histogram.slice(i, i + barsPerGroup).reduce((a, b) => a + b, 0));
  }

  const peak = Math.max(1, ...grouped);
  const buckets = grouped.length;

  return (
    <div className={styles.wrap}>
      <div className={styles.histogram} ref={histRef} aria-hidden="true">
        {grouped.map((count, i) => {
          const bucketStart = min + ((max - min) * i) / buckets;
          const bucketEnd = min + ((max - min) * (i + 1)) / buckets;
          const inRange = bucketEnd >= lo && bucketStart <= hi;
          return (
            <span
              key={i}
              className={`${styles.bar} ${inRange ? styles.barActive : styles.barMuted}`}
              // Square-root scale, not linear. The catalogue is heavily skewed —
              // 13 mattresses sit in the cheapest bucket against ones and twos
              // across the rest — so a linear scale drew one tower and a flat
              // row of stubs. sqrt keeps the ordering and the shape while making
              // the small buckets legible; it is the usual treatment for a
              // long-tailed distribution.
              //
              // Empty buckets keep a hairline so the baseline reads as a
              // considered line rather than a gap in the render.
              style={{
                height: count === 0 ? '3px' : `${Math.max(8, Math.sqrt(count / peak) * 100)}%`,
              }}
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
