import { useEffect, useRef, useState, type MutableRefObject } from 'react';

/**
 * Scroll reveal over IntersectionObserver.
 *
 * One shared observer per (threshold, rootMargin) pair rather than one per
 * element: a catalogue page can mount 40+ revealing nodes, and 40 observers is
 * 40 sets of callbacks competing on the same scroll.
 *
 * The hook only flips a boolean — the actual rise-and-fade lives in CSS
 * (`_mixins.scss` → `reveal`). That is deliberate: it means the reduced-motion
 * variant is enforced by the cascade, not by every caller remembering to check.
 */

type Entry = { el: Element; onShow: () => void };

const registries = new Map<
  string,
  { observer: IntersectionObserver; entries: Map<Element, Entry> }
>();

function registryFor(threshold: number, rootMargin: string) {
  const key = `${threshold}|${rootMargin}`;
  let reg = registries.get(key);
  if (!reg) {
    const entries = new Map<Element, Entry>();
    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          if (!record.isIntersecting) continue;
          const entry = entries.get(record.target);
          if (!entry) continue;
          entry.onShow();
          // Trigger once: stop watching the moment it has been seen.
          observer.unobserve(record.target);
          entries.delete(record.target);
        }
      },
      { threshold, rootMargin },
    );
    reg = { observer, entries };
    registries.set(key, reg);
  }
  return reg;
}

export interface UseRevealOptions {
  threshold?: number;
  rootMargin?: string;
  /** Skip observation and reveal immediately (e.g. above-the-fold content). */
  immediate?: boolean;
}

export function useReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
  rootMargin = '0px 0px -8% 0px',
  immediate = false,
}: UseRevealOptions = {}): { ref: MutableRefObject<T | null>; revealed: boolean } {
  // `T | null` rather than `useRef<T>(null)` so the ref is mutable — SplitText
  // needs to merge this with its own measuring ref on the same node.
  const ref = useRef<T | null>(null);
  // Lazy initial state rather than setState-in-effect: `immediate` content is
  // already visible, and an engine without IntersectionObserver must not hide
  // content it can never reveal.
  const [revealed, setRevealed] = useState(
    () => immediate || typeof IntersectionObserver === 'undefined',
  );

  useEffect(() => {
    if (revealed) return;
    const el = ref.current;
    if (!el) return;

    const { observer, entries } = registryFor(threshold, rootMargin);
    entries.set(el, { el, onShow: () => setRevealed(true) });
    // IntersectionObserver fires on first observation, so an element already
    // on screen at mount reveals without needing a manual rect check.
    observer.observe(el);

    return () => {
      observer.unobserve(el);
      entries.delete(el);
    };
  }, [threshold, rootMargin, revealed]);

  return { ref, revealed };
}
