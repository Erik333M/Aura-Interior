import { useRef, useState } from 'react';
import type { Review } from '@aura/types';
import { useI18n } from '@/i18n';
import { Stars } from '@/components/Reviews';
import styles from './ReviewsCarousel.module.scss';

/**
 * Built on a native overflow-x scroller rather than a JS carousel: touch
 * swiping, momentum, keyboard scrolling and scroll-snap all come free, and the
 * arrows just call scrollBy.
 */
export function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const { t, locale } = useI18n();
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  if (reviews.length === 0) return null;

  const scrollBy = (dir: 1 | -1): void => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8) });
  };

  const onScroll = (): void => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  };

  const dateFmt = locale === 'hy' ? 'hy-AM' : locale === 'ru' ? 'ru-RU' : 'en-GB';

  return (
    <section className={styles.section} aria-labelledby="reviews-carousel-heading">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div>
            <p className={styles.eyebrow}>{t.homeSections.reviewsEyebrow}</p>
            <h2 id="reviews-carousel-heading" className={styles.title}>
              {t.homeSections.reviewsTitle}
            </h2>
          </div>
          <div className={styles.controls}>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => scrollBy(-1)}
              disabled={atStart}
              aria-label={t.catalogue.previous}
            >
              <svg viewBox="0 0 16 16" width="15" height="15" fill="none" aria-hidden="true">
                <path
                  d="M10 3L5 8l5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => scrollBy(1)}
              disabled={atEnd}
              aria-label={t.catalogue.next}
            >
              <svg viewBox="0 0 16 16" width="15" height="15" fill="none" aria-hidden="true">
                <path
                  d="M6 3l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <ul className={styles.track} ref={trackRef} onScroll={onScroll} role="list">
          {reviews.map((r) => (
            <li key={r.id} className={styles.card}>
              <Stars value={r.rating} label={`${r.rating} / 5`} />
              <p className={styles.quote}>{r.body}</p>
              <div className={styles.author}>
                <span className={styles.authorName}>{r.authorName}</span>
                <span className={styles.authorDate}>
                  {new Date(r.createdAt).toLocaleDateString(dateFmt, {
                    year: 'numeric',
                    month: 'long',
                  })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
