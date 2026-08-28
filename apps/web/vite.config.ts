import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const resolvePath = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig(({ mode }) => {
  // The monorepo keeps one .env at the root, so point Vite there instead of
  // apps/web. Loaded with an empty prefix so the proxy target can be a
  // non-VITE_ variable — it must never reach the browser bundle.
  const env = loadEnv(mode, resolvePath('../../'), '');
  const apiTarget = env['API_PROXY_TARGET'] || 'http://localhost:4000';

  return {
    plugins: [react()],
    envDir: resolvePath('../../'),
    resolve: {
      alias: {
        '@': resolvePath('./src'),
        '@aura/types': resolvePath('../../packages/types/src/index.ts'),
      },
    },
    css: {
      // Every .module.scss gets the mixin API without repeating an @use line.
      // _tokens.scss is deliberately NOT injected — it emits custom properties
      // and must be pulled in exactly once, by global.scss.
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler' as const,
          loadPaths: [resolvePath('./src/styles')],
          additionalData: '@use "mixins" as *;\n',
        },
      },
      modules: {
        generateScopedName:
          mode === 'production' ? '[hash:base64:6]' : '[name]__[local]__[hash:base64:4]',
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
        // Admin-uploaded photography is served by the API, not from public/.
        '/uploads': { target: apiTarget, changeOrigin: true },
      },
    },
    // `vite preview` does not inherit server.proxy — it needs its own, and
    // without it a production-build smoke test has no API.
    preview: {
      port: 4173,
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
        '/uploads': { target: apiTarget, changeOrigin: true },
      },
    },
    build: {
      target: 'es2022',
      cssTarget: 'chrome111',
      sourcemap: true,
      rollupOptions: {
        output: {
          // Split the dependencies that never change from the app code that
          // does. A copy edit then invalidates a few KB rather than 200, and
          // the animation runtime is parsed on its own rather than blocking
          // the first paint of the app shell.
          // framer-motion is deliberately ABSENT: forcing it into a manual
          // chunk overrides LazyMotion's own dynamic import and ships the
          // animation features eagerly again, which is the whole thing
          // LazyMotion exists to avoid.
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            query: ['@tanstack/react-query'],
          },
        },
      },
    },
  };
});
