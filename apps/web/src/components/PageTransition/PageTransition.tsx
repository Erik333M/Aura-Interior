import { Suspense, type ReactNode } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import styles from './PageTransition.module.scss';

/**
 * Route-level exit/enter transition.
 *
 * Two details matter here:
 *  1. `useOutlet()` is captured per-render and keyed by pathname, so the
 *     outgoing page keeps rendering its OWN element while it animates out.
 *     Rendering <Outlet /> directly would swap the content instantly and the
 *     exit animation would play over the new page.
 *  2. There is deliberately no white/light flash — the page fades and lifts
 *     against the dark ground. On a dark site a white flash is jarring.
 */
export function PageTransition({ children }: { children?: ReactNode }) {
  const location = useLocation();
  const outlet = useOutlet();
  const reduced = useReducedMotion();

  const variants = reduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
      };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={location.pathname}
        className={styles.page}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration: reduced ? 0.15 : 0.4,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {/* Inside the motion element on purpose: a Suspense boundary above it
            would unmount the whole transition while a route chunk downloads,
            producing exactly the blank flash the transition exists to avoid. */}
        <Suspense fallback={<div className={styles.pending} />}>{children ?? outlet}</Suspense>
      </m.div>
    </AnimatePresence>
  );
}
