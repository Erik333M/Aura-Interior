import { useEffect, useMemo, type ReactNode } from 'react';
import { localize, type Locale } from '@aura/types';
import { dictionaryFor } from './dictionaries.js';
import { I18nContext, type I18nValue } from './context.js';

const INTL_LOCALE: Record<Locale, string> = {
  hy: 'hy-AM',
  ru: 'ru-RU',
  en: 'en-US',
};

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  // Keep the document in sync so :lang() selectors, screen readers and the
  // browser's own hyphenation all behave correctly.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nValue>(() => {
    const t = dictionaryFor(locale);
    const nf = new Intl.NumberFormat(INTL_LOCALE[locale]);
    const pr = new Intl.PluralRules(INTL_LOCALE[locale]);

    return {
      locale,
      t,
      tl: (v) => (v ? localize(v, locale) : ''),
      path: (to) => {
        const clean = to.startsWith('/') ? to : `/${to}`;
        return clean === '/' ? `/${locale}` : `/${locale}${clean}`;
      },
      price: (amd, withPrefix = true) =>
        `${withPrefix ? `${t.common.from} ` : ''}${nf.format(amd)} ${t.common.currency}`,
      formatNumber: (n) => nf.format(n),
      pieces: (n) => {
        const forms = t.catalogue.pieces;
        const rule = pr.select(n) as keyof typeof forms;
        return `${nf.format(n)} ${forms[rule] ?? forms.other}`;
      },
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
