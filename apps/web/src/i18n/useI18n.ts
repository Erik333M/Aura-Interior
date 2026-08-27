import { useContext } from 'react';
import type { Locale } from '@aura/types';
import { I18nContext, type I18nValue } from './context.js';

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n() must be used inside <I18nProvider>. Check the router layout.');
  }
  return ctx;
}

export function useLocale(): Locale {
  return useI18n().locale;
}

/** Convenience for links: const to = useLocalePath(); <Link to={to('/catalogue')} /> */
export function useLocalePath(): (to: string) => string {
  return useI18n().path;
}
