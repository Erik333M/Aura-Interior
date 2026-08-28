import { DEFAULT_LOCALE, isLocale, type Locale } from '@aura/types';

const KEY = 'aura-locale';

/**
 * The URL is the source of truth for which language is being shown; this only
 * remembers the last explicit CHOICE, so that landing on `/` a second time
 * sends you where you were rather than back to Armenian.
 */
export function readLocale(): Locale {
  try {
    const stored = localStorage.getItem(KEY);
    if (isLocale(stored)) return stored;
  } catch {
    /* private mode */
  }
  // Fall back to the browser's preference before the site default.
  try {
    for (const tag of navigator.languages ?? []) {
      const base = tag.split('-')[0];
      if (isLocale(base)) return base;
    }
  } catch {
    /* no navigator */
  }
  return DEFAULT_LOCALE;
}

export function writeLocale(locale: Locale): void {
  try {
    localStorage.setItem(KEY, locale);
  } catch {
    /* private mode — the route prefix still carries the language */
  }
}
