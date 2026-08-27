import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { INQUIRY_STATUSES, type InquiryStatus } from '@aura/types';
import { useI18n } from '@/i18n';
import { adminKeys, fetchAdminInquiries, setInquiryStatus } from '@/services/admin';
import styles from './Admin.module.scss';

const PILL: Record<string, string> = {
  NEW: styles.pillNew ?? '',
  CONTACTED: styles.pillNeutral ?? '',
  QUOTED: styles.pillNeutral ?? '',
  WON: styles.pillWon ?? '',
  LOST: styles.pillLost ?? '',
};

/** The inbox. Every lead the site produces lands here. */
export function AdminInquiries() {
  const { t, tl, locale } = useI18n();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: adminKeys.inquiries(),
    queryFn: () => fetchAdminInquiries(),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InquiryStatus }) =>
      setInquiryStatus(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin'] });
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
            <th>{t.inquiry.name}</th>
            <th>{t.inquiry.phone}</th>
            <th>{t.inquiry.piece}</th>
            <th>{t.inquiry.message}</th>
            <th>{t.admin.status}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.id}>
              <td>
                <div>{row.name}</div>
                {row.email && <div className={styles.muted}>{row.email}</div>}
                <div className={`${styles.muted} ${styles.num}`}>
                  {new Date(row.createdAt).toLocaleDateString(fmt, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </td>
              <td className={styles.num}>
                <a href={`tel:${row.phone.replace(/\s/g, '')}`}>{row.phone}</a>
              </td>
              <td>
                {row.product ? tl(row.product.name) : <span className={styles.muted}>—</span>}
                {row.fabric && (
                  <div className={styles.muted}>
                    <span
                      className={styles.swatchDot}
                      style={{ backgroundColor: row.fabric.hex }}
                    />
                    {tl(row.fabric.name)}
                  </div>
                )}
                {row.customDimensions && <div className={styles.muted}>{row.customDimensions}</div>}
              </td>
              <td className={styles.wrapText}>{row.message}</td>
              <td>
                <span className={`${styles.pill} ${PILL[row.status] ?? styles.pillNeutral}`}>
                  {row.status}
                </span>
              </td>
              <td>
                <select
                  className={styles.select}
                  value={row.status}
                  aria-label={`${t.admin.status}: ${row.name}`}
                  disabled={mutation.isPending}
                  onChange={(e) =>
                    mutation.mutate({ id: row.id, status: e.target.value as InquiryStatus })
                  }
                >
                  {INQUIRY_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
