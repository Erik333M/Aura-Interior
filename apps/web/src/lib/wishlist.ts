import { createLocalStore } from './localStore.js';
import { track } from './analytics.js';

/** Product slugs, newest first. Slugs rather than ids so a saved link survives
 *  a database reseed. */
export const wishlistStore = createLocalStore<string[]>('aura-wishlist', []);

export function toggleWishlist(slug: string): boolean {
  const added = wishlistStore.toggle(slug);
  track(added ? 'wishlist_added' : 'wishlist_removed', { slug });
  return added;
}

export function useWishlist(): string[] {
  return wishlistStore.use();
}

/** Last 8 viewed pieces, newest first, excluding the one being viewed. */
export const recentlyViewedStore = createLocalStore<string[]>('aura-recently-viewed', [], 9);
