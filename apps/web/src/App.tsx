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

/**
 * Every page lives under a /:locale prefix — /hy, /ru, /en — with Armenian as
 * the default. Wiring this in Phase 1 rather than retrofitting it in Phase 6
 * means no link, route or canonical URL has to be rewritten later.
 *
 * Route-level code splitting arrives in Phase 6 alongside the performance work.
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={`/${DEFAULT_LOCALE}`} replace />,
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
]);

export function App() {
  return <RouterProvider router={router} />;
}
