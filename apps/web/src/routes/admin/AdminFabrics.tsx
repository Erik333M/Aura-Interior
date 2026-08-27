import { useQuery } from '@tanstack/react-query';
import { useI18n } from '@/i18n';
import { catalogueKeys, fetchFabrics } from '@/services/catalogue';
import styles from './Admin.module.scss';

/**
 * Fabric library. Read-only for now: fabrics are a slow-moving reference set
 * seeded from prisma/data/fabrics.ts, and there is no admin write endpoint for
 * them yet. Listing them still matters — it is how the workshop checks which
 * hex values the colour filter is actually rendering.
 */
export function AdminFabrics() {
  const { t, tl } = useI18n();
  const query = useQuery({
    queryKey: catalogueKeys.fabrics(),
    queryFn: fetchFabrics,
    staleTime: 5 * 60_000,
  });

  const items = query.data ?? [];
  if (query.isPending) return <p className={styles.muted}>{t.common.loading}</p>;

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t.catalogue.colour}</th>
            <th>{t.inquiry.fabric}</th>
            <th>{t.catalogue.fabricType}</th>
            <th>Hex</th>
          </tr>
        </thead>
        <tbody>
          {items.map((f) => (
            <tr key={f.id}>
              <td>
                <span className={styles.swatchDot} style={{ backgroundColor: f.hex }} />
              </td>
              <td>{tl(f.name)}</td>
              <td className={styles.muted}>{f.category}</td>
              <td className={`${styles.muted} ${styles.num}`}>{f.hex}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
