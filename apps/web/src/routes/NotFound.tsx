import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { Seo } from '@/components/Seo';
import styles from './NotFound.module.scss';

export function NotFound() {
  const { t, path } = useI18n();

  return (
    <>
      <Seo title={t.seo.notFoundTitle} description={t.notFound.lead} noindex />

      <div className={styles.wrap}>
        <p className={styles.code}>404</p>
        <h1>{t.notFound.title}</h1>
        <p className={styles.lead}>{t.notFound.lead}</p>

        {/* Made-to-order joke: this page, like a piece we have not built yet,
            exists only as a dashed outline until somebody commissions it. */}
        <svg
          className={styles.sketch}
          viewBox="0 0 320 120"
          fill="none"
          role="img"
          aria-label={t.notFound.sketch}
        >
          <rect
            className={styles.dash}
            x="10"
            y="46"
            width="300"
            height="52"
            rx="8"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <rect
            className={styles.dash}
            x="34"
            y="10"
            width="118"
            height="40"
            rx="10"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            className={styles.dash}
            d="M28 98v14M292 98v14"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        <p className={styles.caption}>{t.notFound.sketch}</p>

        <div className={styles.actions}>
          <Link to={path('/')} className={styles.cta}>
            {t.notFound.cta}
          </Link>
          <Link to={path('/catalogue')} className={styles.ghost}>
            {t.nav.catalogue}
          </Link>
        </div>
      </div>
    </>
  );
}
