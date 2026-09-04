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
  const { pathname, search } = useLocation();

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

  /**
   * Stop the browser restoring the previous scroll position on reload.
   *
   * The default 'auto' means a refresh drops you back where you were, halfway
   * down a page whose content has just been re-fetched — and on a route the
   * browser has seen before, a fresh navigation can land mid-page too.
   */
  useEffect(() => {
    if (!('scrollRestoration' in window.history)) return;
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  // A new route must start at the top, and instantly — smoothly scrolling up
  // through the outgoing page during a route transition looks like a bug.
  // Keyed on search too: /catalogue?categories=beds is a different view of the
  // page, and leaving the reader halfway down someone else's results is
  // disorienting.
  useEffect(() => {
    scrollToTop();
  }, [pathname, search]);

  return null;
}
