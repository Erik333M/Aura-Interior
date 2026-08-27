import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const resolvePath = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig(({ mode }) => {
  // The monorepo keeps one .env at the root, so point Vite there instead of apps/web.
  const env = loadEnv(mode, resolvePath('../../'), 'VITE_');

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
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:4000',
          changeOrigin: true,
        },
      },
    },
    build: {
      target: 'es2022',
      cssTarget: 'chrome111',
      sourcemap: true,
    },
  };
});
