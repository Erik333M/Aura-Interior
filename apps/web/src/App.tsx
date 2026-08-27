import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { DEFAULT_LOCALE } from '@aura/types';
import { LocaleLayout } from '@/routes/LocaleLayout';
import { RouteError } from '@/components/RouteError';
import { Home } from '@/routes/Home';
import { Catalogue } from '@/routes/Catalogue';
import { ProductDetail } from '@/routes/ProductDetail';
import { InteriorDesign } from '@/routes/InteriorDesign';
import { About } from '@/routes/About';
import { Contact } from '@/routes/Contact';
import { NotFound } from '@/routes/NotFound';
import { AdminPage } from '@/routes/admin';
import { I18nProvider } from '@/i18n';

/**
 * Every page lives under a /:locale prefix — /hy, /ru, /en — with Armenian as
 * the default. Wiring this in Phase 1 rather than retrofitting it in Phase 6
 * means no link, route or canonical URL has to be rewritten later.
 *
 * Route-level code splitting arrives in Phase 6 alongside the performance work.
 */
const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Navigate to={`/${DEFAULT_LOCALE}`} replace />,
    },
    {
      // The admin panel sits outside the locale tree and outside Layout: it is an
      // internal tool, not a page of the site, so it gets no grain, no smooth
      // scroll and no custom cursor. It still needs the dictionary, so it is
      // wrapped in its own provider.
      path: '/admin',
      element: (
        <I18nProvider locale={DEFAULT_LOCALE}>
          <AdminPage />
        </I18nProvider>
      ),
      errorElement: <RouteError />,
    },
    {
      path: '/:locale',
      element: <LocaleLayout />,
      errorElement: <RouteError />,
      children: [
        { index: true, element: <Home /> },
        { path: 'catalogue', element: <Catalogue /> },
        { path: 'catalogue/:slug', element: <ProductDetail /> },
        { path: 'interior-design', element: <InteriorDesign /> },
        { path: 'about', element: <About /> },
        { path: 'contact', element: <Contact /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  {
    // Opt in to the v7 behaviours now so the console stays clean and the upgrade
    // is a version bump rather than a migration.
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  },
);

export function App() {
  // v7_startTransition lives on the provider, not on createBrowserRouter.
  // Verified that route transitions still animate with it on.
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}
