import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import styles from './VignetteFollow.module.scss';

/** How far the lamp may drift from centre, in px. */
const DRIFT = 90;

/**
 * A radial highlight behind the hero that drifts slightly with the cursor,
 * like a studio lamp being nudged. Deliberately subtle and heavily damped — at
 * full 1:1 tracking it reads as a torch, not lighting.
 *
 * Static under reduced motion: the gradient still paints, it simply stops
 * following.
 */
export function VignetteFollow() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const el = ref.current;
    if (!el) return;

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;

    const onMove = (e: PointerEvent): void => {
      const rect = el.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2 * DRIFT;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2 * DRIFT;
    };

    const tick = (): void => {
      // Heavy easing: the lamp trails well behind the cursor.
      x += (targetX - x) * 0.045;
      y += (targetY - y) * 0.045;
      el.style.setProperty('--lamp-x', `${x.toFixed(1)}px`);
      el.style.setProperty('--lamp-y', `${y.toFixed(1)}px`);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
    };
  }, [reduced]);

  return <div ref={ref} className={styles.vignette} aria-hidden="true" />;
}
