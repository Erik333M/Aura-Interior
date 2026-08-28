import { useSyncExternalStore } from 'react';

/**
 * A tiny localStorage-backed store with React subscriptions.
 *
 * Built on useSyncExternalStore rather than context so the header counter and
 * the wishlist page share one source of truth without a provider wrapping the
 * tree, and so a change in one tab is reflected in another via the `storage`
 * event.
 */
export function createLocalStore<T>(key: string, initial: T, limit?: number) {
  let cache: T = read();
  const listeners = new Set<() => void>();

  function read(): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      // Private mode, quota, or corrupt JSON — fall back rather than throw.
      return initial;
    }
  }

  function emit(): void {
    for (const fn of listeners) fn();
  }

  function write(next: T): void {
    cache = next;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* the value still lives in memory for this session */
    }
    emit();
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key !== key) return;
      cache = read();
      emit();
    });
  }

  return {
    get: (): T => cache,
    set: write,
    subscribe(fn: () => void): () => void {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    /** For array stores: prepend, dedupe, and cap at `limit`. */
    push(value: string): void {
      const list = (cache as unknown as string[]).filter((v) => v !== value);
      list.unshift(value);
      write((limit ? list.slice(0, limit) : list) as unknown as T);
    },
    toggle(value: string): boolean {
      const list = cache as unknown as string[];
      const has = list.includes(value);
      write((has ? list.filter((v) => v !== value) : [value, ...list]) as unknown as T);
      return !has;
    },
    use(): T {
      // getServerSnapshot returns the same constant so hydration never mismatches.
      return useSyncExternalStore(
        (fn) => this.subscribe(fn),
        () => cache,
        () => initial,
      );
    },
  };
}
