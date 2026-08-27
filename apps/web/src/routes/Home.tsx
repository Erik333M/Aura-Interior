import { useQuery } from '@tanstack/react-query';
import { useI18n } from '@/i18n';
import { catalogueKeys, fetchProducts } from '@/services/catalogue';
import styles from './Home.module.scss';

/**
 * PHASE 1 SCOPE: this is the foundation smoke page. It proves the full path
 * — API → TanStack Query → i18n → tokens → SCSS modules — actually works end to
 * end. The real Home (pinned category strip, signature-piece parallax rows,
 * "Made in Yerevan" band, reviews carousel, Instagram strip) is Phase 4.
 */
export function Home() {
  const { t, tl, price } = useI18n();

  const query = useQuery({
    queryKey: catalogueKeys.products({ pageSize: 4 }),
    queryFn: () => fetchProducts({ pageSize: 4 }),
  });

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.vignette} aria-hidden="true" />
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>{t.home.heroEyebrow}</p>
          <h1 className={styles.title}>{t.home.heroTitle}</h1>
          <p className={styles.lead}>{t.home.heroLead}</p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="featured-heading">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>{t.common.madeToOrder}</p>
          <h2 id="featured-heading">{t.nav.catalogue}</h2>
        </div>

        {query.isPending && <p className={styles.status}>{t.common.loading}</p>}
        {query.isError && <p className={styles.status}>{t.common.error}</p>}

        {query.data && (
          <ul className={styles.grid} role="list">
            {query.data.items.map((p) => (
              <li key={p.id} className={styles.card}>
                <img
                  className={styles.thumb}
                  src={`${p.images[0]?.url}-800.jpg`}
                  alt={tl(p.name)}
                  width={p.images[0]?.width}
                  height={p.images[0]?.height}
                  loading="lazy"
                  decoding="async"
                />
                <div className={styles.cardBody}>
                  <h3 className={styles.cardName}>{tl(p.name)}</h3>
                  <p className={styles.cardPrice}>{price(p.priceFrom)}</p>
                  <p className={styles.cardMeta}>
                    {t.common.leadTime}: {p.leadTimeDays} {t.common.days}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
