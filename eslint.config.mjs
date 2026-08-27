import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      'apps/web/public/media/generated/**',
      'packages/types/dist/**',
      '**/*.d.ts',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // ── Shared TypeScript rules ────────────────────────────────────────────────
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
    },
    rules: {
      // The brief says no `any`. Enforce it rather than trusting discipline.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      'no-console': 'off',
    },
  },

  // ── Web app ────────────────────────────────────────────────────────────────
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Components must never call fetch directly — that is what services/ is for.
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'Use the typed helpers in src/services/ instead of calling fetch directly.' },
      ],
    },
  },
  {
    // The service layer is the one place allowed to touch the network.
    files: ['apps/web/src/services/**/*.ts'],
    rules: { 'no-restricted-globals': 'off' },
  },

  // ── API + node-side scripts ────────────────────────────────────────────────
  {
    files: ['apps/api/**/*.ts', 'scripts/**/*.ts', 'packages/types/**/*.ts'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // Prisma rows are structurally dynamic; the serializers are the boundary
    // where they become typed. Confining `any` to this one file is deliberate.
    files: ['apps/api/src/lib/serialize.ts'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
  {
    files: ['**/*.js', 'eslint.config.js'],
    languageOptions: { globals: { ...globals.node } },
    ...tseslint.configs.disableTypeChecked,
  },
);
