import { useQuery } from '@tanstack/react-query';
import type { RatingSummary, Review } from '@aura/types';
import { useI18n } from '@/i18n';
import { fetchRatingSummary, fetchReviews, reviewKeys } from '@/services/reviews';
import { Stars } from './Stars.js';
import { ReviewForm } from './ReviewForm.js';
import styles from './Reviews.module.scss';

function Breakdown({ summary }: { summary: RatingSummary }) {
  const { t, formatNumber } = useI18n();
  const max = Math.max(1, ...Object.values(summary.breakdown));

  return (
    <div className={styles.summary}>
      <div className={styles.average}>
        <span className={styles.averageNum}>{formatNumber(summary.average)}</span>
        <span className={styles.averageMeta}>
          <Stars value={summary.average} label={`${summary.average} / 5`} />
          <br />
          {t.reviews.basedOn} {formatNumber(summary.count)} {t.reviews.reviewsCount}
        </span>
      </div>

      <div className={styles.bars}>
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = summary.breakdown[star];
          return (
            <div key={star} className={styles.barRow}>
              <span>{star}★</span>
              <span className={styles.barTrack}>
                <span className={styles.barFill} style={{ width: `${(count / max) * 100}%` }} />
              </span>
              <span>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewItem({ review }: { review: Review }) {
  const { locale } = useI18n();
  const date = new Date(review.createdAt).toLocaleDateString(
    locale === 'hy' ? 'hy-AM' : locale === 'ru' ? 'ru-RU' : 'en-GB',
    { year: 'numeric', month: 'long' },
  );

  return (
    <li className={styles.review}>
      <div className={styles.reviewHead}>
        <span className={styles.author}>{review.authorName}</span>
        <span className={styles.date}>{date}</span>
      </div>
      <Stars value={review.rating} label={`${review.rating} / 5`} />
      <p className={styles.body}>{review.body}</p>
    </li>
  );
}

export function Reviews({ productId }: { productId: string }) {
  const { t } = useI18n();

  const list = useQuery({
    queryKey: reviewKeys.list(productId),
    queryFn: () => fetchReviews(productId),
  });
  const summary = useQuery({
    queryKey: reviewKeys.summary(productId),
    queryFn: () => fetchRatingSummary(productId),
  });

  const reviews = list.data?.items ?? [];

  return (
    <div className={styles.wrap}>
      {summary.data && summary.data.count > 0 ? (
        <Breakdown summary={summary.data} />
      ) : (
        <div className={styles.summary}>
          <p className={styles.empty}>{t.reviews.none}</p>
          <p className={styles.empty}>{t.reviews.beFirst}</p>
        </div>
      )}

      <div>
        {reviews.length > 0 && (
          <ul className={styles.list} role="list">
            {reviews.map((r) => (
              <ReviewItem key={r.id} review={r} />
            ))}
          </ul>
        )}
        <ReviewForm productId={productId} />
      </div>
    </div>
  );
}
