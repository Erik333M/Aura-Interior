import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/i18n';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import styles from './CustomCursor.module.scss';

/** Elements that make the cursor grow and read "View". */
const HOVER_SELECTOR = 'article a, [data-cursor="view"]';

export function CustomCursor() {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (reduced) return;
    // Only for real pointers — a phone has no cursor to replace.
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMove = (e: PointerEvent): void => {
      targetX = e.clientX;
      targetY = e.clientY;
      setVisible(true);
      const el = e.target as Element | null;
      setHovering(Boolean(el?.closest?.(HOVER_SELECTOR)));
    };

    const onLeave = (): void => setVisible(false);

    // Eased follow, run off rAF rather than writing style on every pointer
    // event — the dot lags the cursor slightly, which is what makes it read as
    // a considered object instead of a stuck sprite.
    const tick = (): void => {
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;
      const dot = dotRef.current;
      if (dot) {
        dot.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div
      ref={dotRef}
      className={`${styles.cursor} ${visible ? styles.visible : ''} ${
        hovering ? styles.hovering : ''
      }`}
      aria-hidden="true"
    >
      <span className={styles.label}>{t.common.view}</span>
    </div>
  );
}
