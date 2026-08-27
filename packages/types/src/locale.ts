/** Supported site locales. Armenian is the default — the business is in Yerevan. */
export const LOCALES = ['hy', 'ru', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'hy';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * A string that exists in all three site languages.
 * Stored as three columns rather than a JSON blob so it stays queryable
 * and sortable when the database moves from SQLite to Postgres.
 */
export interface Localized {
  hy: string;
  ru: string;
  en: string;
}

/** Pick one language out of a Localized value, falling back to Armenian then English. */
export function localize(value: Localized, locale: Locale): string {
  return value[locale] || value.hy || value.en;
}
