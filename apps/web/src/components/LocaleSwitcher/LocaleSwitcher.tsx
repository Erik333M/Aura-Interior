import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LOCALES, isLocale } from '@aura/types';
import { dictionaries } from '@/i18n/dictionaries';
import { useI18n } from '@/i18n';
import styles from './LocaleSwitcher.module.scss';

/**
 * Swaps the locale segment of the current URL rather than sending the user home,
 * so switching language keeps you on the page you were reading.
 */
export function LocaleSwitcher() {
  const { locale } = useI18n();
  const { pathname, search, hash } = useLocation();

  const segments = pathname.split('/').filter(Boolean);
  const rest = isLocale(segments[0]) ? segments.slice(1) : segments;

  return (
    <div className={styles.switcher}>
      {LOCALES.map((code, i) => {
        const to = `/${[code, ...rest].join('/')}${search}${hash}`;
        const isActive = code === locale;
        return (
          <Fragment key={code}>
            {i > 0 && <span className={styles.divider} aria-hidden="true" />}
            <Link
              to={to}
              className={`${styles.option} ${isActive ? styles.active : ''}`}
              lang={code}
              hrefLang={code}
              aria-current={isActive ? 'true' : undefined}
            >
              {dictionaries[code].meta.localeShort}
            </Link>
          </Fragment>
        );
      })}
    </div>
  );
}
