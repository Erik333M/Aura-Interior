import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LazyMotion } from 'framer-motion';
import { App } from './App';
import './styles/global.scss';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // The catalogue changes when the workshop updates it, not second to second.
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const container = document.getElementById('root');
if (!container) throw new Error('#root not found in index.html');

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {/*
        LazyMotion loads the animation feature set AFTER first paint, which
        takes ~34kB off the critical path. Every animated element therefore
        uses `m.*` rather than `motion.*`; `strict` makes that a runtime error
        instead of a silent 34kB regression the next time someone reaches for
        `motion.div`.

        `features` MUST be a function returning a dynamic import — passing the
        imported `domMax` value directly still pulls it into the entry bundle,
        which measured as the main chunk growing 34kB → 87kB.

        domMax rather than domAnimation because the catalogue grid and the
        filter pills use `layout` animations, which domAnimation omits.
      */}
      <LazyMotion features={() => import('framer-motion').then((mod) => mod.domMax)} strict>
        <App />
      </LazyMotion>
    </QueryClientProvider>
  </StrictMode>,
);
