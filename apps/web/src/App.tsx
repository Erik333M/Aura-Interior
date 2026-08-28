import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { DEFAULT_LOCALE } from '@aura/types';
import { I18nProvider } from '@/i18n';
import { LocaleLayout } from '@/routes/LocaleLayout';
import { RouteError } from '@/components/RouteError';
import { readLocale } from '@/lib/locale';
import { Home } from '@/routes/Home';

/**
 * Route-level code splitting.
 *
 * Home is imported eagerly — it is the landing page for almost all traffic, and
 * lazy-loading it would add a round trip to the one render that matters most for
 * Largest Contentful Paint. Everything else splits, including the admin panel,
 * which no public visitor should ever download.
 */
const Catalogue = lazy(() => import('@/routes/Catalogue').then((m) => ({ default: m.Catalogue })));
const ProductDetail = lazy(() =>
  import('@/routes/ProductDetail').then((m) => ({ default: m.ProductDetail })),
);
const InteriorDesign = lazy(() =>
  import('@/routes/InteriorDesign').then((m) => ({ default: m.InteriorDesign })),
);
const About = lazy(() => import('@/routes/About').then((m) => ({ default: m.About })));
const Contact = lazy(() => import('@/routes/Contact').then((m) => ({ default: m.Contact })));
const Wishlist = lazy(() => import('@/routes/Wishlist').then((m) => ({ default: m.Wishlist })));
const NotFound = lazy(() => import('@/routes/NotFound').then((m) => ({ default: m.NotFound })));
const AdminPage = lazy(() => import('@/routes/admin').then((m) => ({ default: m.AdminPage })));

/** Sends a bare `/` to the last language the visitor actually chose. */
function LocaleRedirect() {
  return <Navigate to={`/${readLocale()}`} replace />;
}

function AdminShell() {
  return (
    <I18nProvider locale={DEFAULT_LOCALE}>
      <Suspense fallback={null}>
        <AdminPage />
      </Suspense>
    </I18nProvider>
  );
}

/**
 * Every page lives under a /:locale prefix — /hy, /ru, /en — with Armenian as
 * the default. Wiring this in Phase 1 rather than retrofitting it in Phase 6
 * means no link, route or canonical URL had to be rewritten later.
 */
const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <LocaleRedirect />,
    },
    {
      // The admin panel sits outside the locale tree and outside Layout: it is
      // an internal tool, not a page of the site, so it gets no grain, no
      // smooth scroll and no custom cursor.
      path: '/admin',
      element: <AdminShell />,
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
        { path: 'wishlist', element: <Wishlist /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  {
    // Opt in to the v7 behaviours now so the console stays clean and the
    // upgrade is a version bump rather than a migration.
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
