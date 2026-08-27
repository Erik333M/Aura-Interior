import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@/i18n';
import { adminKeys, fetchAdminReviews, setReviewStatus } from '@/services/admin';
import { Stars } from '@/components/Reviews';
import styles from './Admin.module.scss';

const PILL: Record<string, string> = {
  PENDING: styles.pillPending ?? '',
  APPROVED: styles.pillApproved ?? '',
  REJECTED: styles.pillRejected ?? '',
};

/** Moderation queue. Nothing reaches the public site without passing here. */
export function AdminReviews() {
  const { t, locale } = useI18n();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: adminKeys.reviews(),
    queryFn: () => fetchAdminReviews(),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) =>
      setReviewStatus(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin'] });
      // The public list changes too, so drop its cache.
      void qc.invalidateQueries({ queryKey: ['reviews'] });
      void qc.invalidateQueries({ queryKey: ['review-summary'] });
    },
  });

  const items = query.data?.items ?? [];
  const fmt = locale === 'hy' ? 'hy-AM' : locale === 'ru' ? 'ru-RU' : 'en-GB';

  if (query.isPending) return <p className={styles.muted}>{t.common.loading}</p>;
  if (items.length === 0) return <p className={styles.empty}>{t.admin.noItems}</p>;

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t.reviews.yourName}</th>
            <th>{t.reviews.rating}</th>
            <th>{t.inquiry.piece}</th>
            <th>{t.reviews.yourReview}</th>
            <th>{t.admin.status}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.id}>
              <td>
                <div>{row.authorName}</div>
                <div className={styles.muted}>{row.authorEmail}</div>
                <div className={`${styles.muted} ${styles.num}`}>
                  {new Date(row.createdAt).toLocaleDateString(fmt, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </td>
              <td>
                <Stars value={row.rating} label={`${row.rating} / 5`} />
              </td>
              <td className={styles.muted}>{row.product?.name ?? '—'}</td>
              <td className={styles.wrapText}>{row.body}</td>
              <td>
                <span className={`${styles.pill} ${PILL[row.status] ?? ''}`}>{row.status}</span>
              </td>
              <td>
                <div className={styles.actions}>
                  {row.status !== 'APPROVED' && (
                    <button
                      type="button"
                      className={`${styles.action} ${styles.approve}`}
                      disabled={mutation.isPending}
                      onClick={() => mutation.mutate({ id: row.id, status: 'APPROVED' })}
                    >
                      {t.admin.approve}
                    </button>
                  )}
                  {row.status !== 'REJECTED' && (
                    <button
                      type="button"
                      className={`${styles.action} ${styles.reject}`}
                      disabled={mutation.isPending}
                      onClick={() => mutation.mutate({ id: row.id, status: 'REJECTED' })}
                    >
                      {t.admin.reject}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
