import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * THE single source of truth for whether motion runs.
 *
 * Every animated surface — page transitions, scroll reveals, the gold shimmer,
 * Lenis smooth scroll, the custom cursor, magnetic buttons — reads this hook.
 * Routing it all through one place is what makes the reduced-motion guarantee
 * checkable instead of aspirational.
 *
 * Framer Motion ships its own useReducedMotion; this wrapper exists so that
 * non-Motion code (Lenis, the cursor, canvas work) shares the same answer.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (!window.matchMedia) return;
    const mql = window.matchMedia(QUERY);
    const onChange = (e: MediaQueryListEvent): void => setReduced(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
