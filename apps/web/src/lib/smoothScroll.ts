import type Lenis from 'lenis';

/**
 * Module-level handle on the single Lenis instance.
 *
 * Anything that opens a scroll-locking overlay (the mobile nav sheet, the
 * filter drawer) must pause smooth scrolling too — `overflow: hidden` on body
 * stops native scrolling but not Lenis, which would otherwise keep scrolling
 * the page behind the overlay.
 */
let instance: Lenis | null = null;
let pauseDepth = 0;

export function registerLenis(next: Lenis | null): void {
  instance = next;
  pauseDepth = 0;
}

export function getLenis(): Lenis | null {
  return instance;
}

/** Reference-counted, so two overlays open at once cannot un-pause each other. */
export function pauseScroll(): void {
  pauseDepth += 1;
  if (pauseDepth === 1) instance?.stop();
}

export function resumeScroll(): void {
  pauseDepth = Math.max(0, pauseDepth - 1);
  if (pauseDepth === 0) instance?.start();
}

/** Jump to the top without a smooth animation — used on route change. */
export function scrollToTop(): void {
  if (instance) {
    instance.scrollTo(0, { immediate: true });
  } else {
    window.scrollTo(0, 0);
  }
}
