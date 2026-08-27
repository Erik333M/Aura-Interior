import { Navigate, useLocation, useParams } from 'react-router-dom';
import { DEFAULT_LOCALE, isLocale } from '@aura/types';
import { I18nProvider } from '@/i18n';
import { Layout } from '@/components/Layout';

/**
 * Guards the :locale segment. Anything that is not hy/ru/en is rewritten to the
 * Armenian equivalent of the same path, preserving the rest of the URL — so
 * /catalogue redirects to /hy/catalogue rather than dumping the user on home.
 */
export function LocaleLayout() {
  const { locale } = useParams();
  const { pathname, search, hash } = useLocation();

  if (!isLocale(locale)) {
    const rest = pathname.replace(/^\/+/, '');
    return (
      <Navigate
        to={
          `/${DEFAULT_LOCALE}/${rest}${search}${hash}`.replace(/\/+$/, '') || `/${DEFAULT_LOCALE}`
        }
        replace
      />
    );
  }

  return (
    <I18nProvider locale={locale}>
      <Layout />
    </I18nProvider>
  );
}
