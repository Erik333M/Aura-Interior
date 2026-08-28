import { useRef, type ElementType, type PointerEvent, type ReactNode } from 'react';
import { animate, m, useMotionValue, useSpring } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import styles from './MagneticButton.module.scss';

const PULL = 8; // px of travel at the edge of the button

/**
 * Primary CTAs drift ~8px toward the cursor and spring back on leave.
 *
 * The transform lives on a stable `motion.span` wrapper rather than on a
 * `motion.create(Tag)` component: creating the motion component inside render
 * makes a NEW component type every render, which remounts the button and
 * restarts its animation. The wrapper is inline-flex, so it hugs the element
 * and the movement is visually identical.
 *
 * Pointer-driven only — gated behind `(pointer: fine)` so it never fires from a
 * touch tap — and disabled entirely under reduced motion.
 */
export function MagneticButton({
  children,
  as: Tag = 'button',
  className,
  ...rest
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  [key: string]: unknown;
}) {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 });

  if (reduced) {
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    );
  }

  const onMove = (e: PointerEvent<HTMLSpanElement>): void => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // Normalised offset from centre (-1…1), scaled to the pull distance.
    x.set(((e.clientX - r.left) / r.width - 0.5) * 2 * PULL);
    y.set(((e.clientY - r.top) / r.height - 0.5) * 2 * PULL);
  };

  const onLeave = (): void => {
    animate(x, 0, { type: 'spring', stiffness: 220, damping: 16 });
    animate(y, 0, { type: 'spring', stiffness: 220, damping: 16 });
  };

  return (
    <m.span
      ref={wrapRef}
      className={styles.wrap}
      style={{ x: sx, y: sy }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    </m.span>
  );
}
