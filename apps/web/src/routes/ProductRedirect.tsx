import { Navigate, useParams } from 'react-router-dom';
import { DEFAULT_LOCALE, isLocale } from '@aura/types';

/**
 * /:locale/product/:slug is a convenience alias for the canonical
 * /:locale/catalogue/:slug.
 *
 * A redirect, deliberately — not a second route rendering the same page. Two
 * URLs serving one product would split its ranking and contradict the canonical
 * tag the page emits. `replace` keeps it out of the back-button history too.
 */
export function ProductRedirect() {
  const { locale, slug } = useParams();
  const loc = isLocale(locale) ? locale : DEFAULT_LOCALE;
  return <Navigate to={`/${loc}/catalogue/${slug ?? ''}`} replace />;
}
