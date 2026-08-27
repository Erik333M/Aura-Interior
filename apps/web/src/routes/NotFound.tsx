import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';
import styles from './NotFound.module.scss';

export function NotFound() {
  const { t, path } = useI18n();
  return (
    <div className={styles.wrap}>
      <p className={styles.code}>404</p>
      <h1>{t.notFound.title}</h1>
      <p className={styles.lead}>{t.notFound.lead}</p>
      <Link to={path('/')} className={styles.cta}>
        {t.notFound.cta}
      </Link>
    </div>
  );
}
