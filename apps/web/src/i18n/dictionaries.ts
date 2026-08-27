import { DEFAULT_LOCALE, type Locale } from '@aura/types';
import { hy, type Dictionary } from './locales/hy.js';
import { ru } from './locales/ru.js';
import { en } from './locales/en.js';

export const dictionaries: Record<Locale, Dictionary> = { hy, ru, en };

export function dictionaryFor(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export type { Dictionary };
