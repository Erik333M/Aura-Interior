/**
 * Vendor-neutral analytics.
 *
 * Nothing here knows about GA, Plausible, PostHog or anything else. Events are
 * pushed to `window.dataLayer` (the one convention every tag manager reads) and
 * mirrored to a subscriber list, so a vendor can be attached later — or swapped
 * — without touching a single call site.
 */

export type AnalyticsEvent =
  | 'inquiry_submitted'
  | 'inquiry_opened'
  | 'review_submitted'
  | 'wishlist_added'
  | 'wishlist_removed'
  | 'wishlist_bulk_inquiry'
  | 'product_viewed'
  | 'filter_applied'
  | 'whatsapp_clicked'
  | 'instagram_clicked'
  | 'locale_changed';

export type EventProps = Record<string, string | number | boolean | undefined>;

interface QueuedEvent {
  event: AnalyticsEvent;
  props: EventProps;
  at: number;
}

type Subscriber = (e: QueuedEvent) => void;

const subscribers = new Set<Subscriber>();

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * Record an event. Enquiry submission is the primary conversion — everything
 * else is secondary signal.
 */
export function track(event: AnalyticsEvent, props: EventProps = {}): void {
  const payload: QueuedEvent = { event, props, at: Date.now() };

  try {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ event, ...props });
  } catch {
    /* no window (SSR/tests) — the subscriber path still runs */
  }

  for (const fn of subscribers) {
    try {
      fn(payload);
    } catch {
      /* a broken subscriber must never break the page */
    }
  }

  if (import.meta.env.DEV) {
    console.debug('[analytics]', event, props);
  }
}

/** Attach a vendor. Returns an unsubscribe function. */
export function onTrack(fn: Subscriber): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}
