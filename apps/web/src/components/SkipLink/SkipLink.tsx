import { useI18n } from '@/i18n';
import styles from './SkipLink.module.scss';

export function SkipLink() {
  const { t } = useI18n();
  return (
    <a href="#main" className={styles.skip}>
      {t.nav.skipToContent}
    </a>
  );
}
