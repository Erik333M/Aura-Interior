import type { CSSProperties } from 'react';
import styles from './Skeleton.module.scss';

/**
 * A sized placeholder box. Callers pass the SAME dimensions the real content
 * will occupy — that is the whole point, and why the catalogue can swap
 * skeletons for products with zero layout shift.
 */
export function Skeleton({
  aspectRatio,
  height,
  width,
  radius,
  className,
}: {
  aspectRatio?: string;
  height?: string;
  width?: string;
  radius?: string;
  className?: string;
}) {
  const style: CSSProperties = {
    ...(aspectRatio ? { aspectRatio } : {}),
    ...(height ? { height } : {}),
    ...(width ? { width } : {}),
    ...(radius ? { borderRadius: radius } : {}),
  };
  return (
    <div
      className={`${styles.skeleton} ${styles.shimmer} ${className ?? ''}`}
      style={style}
      aria-hidden="true"
    />
  );
}

export function SkeletonLine({ width = '100%' }: { width?: string }) {
  return (
    <div className={`${styles.line} ${styles.shimmer}`} style={{ width }} aria-hidden="true" />
  );
}
