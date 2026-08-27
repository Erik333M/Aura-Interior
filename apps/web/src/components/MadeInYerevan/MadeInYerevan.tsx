import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { Reveal } from '@/components/Reveal';
import styles from './MadeInYerevan.module.scss';

/**
 * The differentiator band. Made-to-order is the whole business model, so this
 * gets its own full-width treatment rather than a paragraph in the footer.
 */
export function MadeInYerevan({ productCount }: { productCount: number }) {
  const { t, path, formatNumber } = useI18n();

  const stats: Array<{ value: string; label: string }> = [
    { value: '8', label: t.homeSections.madeInStat1 },
    {
      value: `${formatNumber(Math.max(productCount, 20) * 45)}+`,
      label: t.homeSections.madeInStat2,
    },
    { value: '30', label: t.homeSections.madeInStat3 },
  ];

  return (
    <section className={styles.band} aria-labelledby="made-in-heading">
      <span className={styles.glow} aria-hidden="true" />
      <div className={styles.inner}>
        <Reveal className={styles.copy}>
          <p className={styles.eyebrow}>{t.homeSections.madeInEyebrow}</p>
          <h2 id="made-in-heading" className={styles.title}>
            {t.homeSections.madeInTitle}
          </h2>
          <p className={styles.body}>{t.homeSections.madeInBody}</p>
          <Link to={path('/about')} className={styles.link}>
            {t.nav.about}
          </Link>
        </Reveal>

        <Reveal className={styles.stats} index={1}>
          {stats.map((s) => (
            <div key={s.label} className={styles.stat}>
              <span className={styles.statNum}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
