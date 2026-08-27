import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';
import { useI18n } from '@/i18n';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import styles from './AnimatedCount.module.scss';

/**
 * Ticks the result count from its previous value to the new one — "20 pieces"
 * → "6 pieces". The label is re-derived on every frame rather than formatted
 * once, because Russian changes the noun as the number passes 1 and 5
 * (предмет / предмета / предметов).
 */
export function AnimatedCount({ value }: { value: number }) {
  const { pieces } = useI18n();
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const previous = useRef(value);

  useEffect(() => {
    if (reduced || previous.current === value) {
      setDisplay(value);
      previous.current = value;
      return;
    }
    const controls = animate(previous.current, value, {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    previous.current = value;
    return () => controls.stop();
  }, [value, reduced]);

  return (
    // aria-live announces the settled count; the intermediate tick values are
    // not announced because the element's text is replaced, not appended.
    <span className={styles.count} aria-live="polite" aria-atomic="true">
      {pieces(display)}
    </span>
  );
}
