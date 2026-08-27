import { createContext } from 'react';
import type { Locale, Localized } from '@aura/types';
import type { Dictionary } from './dictionaries.js';

export interface I18nValue {
  locale: Locale;
  t: Dictionary;
  /** Resolve a trilingual value from the API into the active language. */
  tl: (value: Localized | undefined | null) => string;
  /** Prefix an app-relative path with the active locale: "/catalogue" → "/hy/catalogue". */
  path: (to: string) => string;
  /** Format an AMD price the way the brand writes it: "from 680,000 ֏". */
  price: (amd: number, withPrefix?: boolean) => string;
  formatNumber: (n: number) => string;
}

/**
 * Lives in its own module so I18nProvider.tsx exports a component and nothing
 * else — otherwise React Fast Refresh cannot hot-update the provider.
 */
export const I18nContext = createContext<I18nValue | null>(null);
