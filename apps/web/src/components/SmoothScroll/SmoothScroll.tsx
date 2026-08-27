import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { registerLenis, scrollToTop } from '@/lib/smoothScroll';

/**
 * Lenis smooth scrolling, lerp 0.09.
 *
 * Never mounts under `prefers-reduced-motion: reduce` — smooth scrolling is
 * itself motion, and hijacking the scroll is one of the most nauseating things
 * a site can do to someone who asked for less of it. The page then uses plain
 * native scrolling, which is the correct fallback.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion();
  const { pathname } = useLocation();

  useEffect(() => {
    if (reduced) {
      registerLenis(null);
      return;
    }

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      // Leave touch scrolling to the OS: mobile momentum is already good, and
      // overriding it costs more than it gains.
      syncTouch: false,
    });
    registerLenis(lenis);

    let frame = 0;
    const raf = (time: number): void => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      registerLenis(null);
    };
  }, [reduced]);

  // A new route must start at the top, and instantly — smoothly scrolling up
  // through the outgoing page during a route transition looks like a bug.
  useEffect(() => {
    scrollToTop();
  }, [pathname]);

  return null;
}
