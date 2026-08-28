import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LOCALES, type Locale } from '@aura/types';
import { useI18n } from '@/i18n';
import { applyHead, type LinkTag, type MetaTag } from '@/lib/head';

const SITE = (import.meta.env['VITE_SITE_URL'] ?? 'https://aurainterior.am').replace(/\/$/, '');

const OG_LOCALE: Record<Locale, string> = {
  hy: 'hy_AM',
  ru: 'ru_RU',
  en: 'en_US',
};

export interface SeoProps {
  title: string;
  description: string;
  /** Absolute or app-relative image base (without size/extension). */
  image?: string;
  type?: 'website' | 'article' | 'product';
  /** Extra JSON-LD documents for this page. */
  jsonLd?: unknown[];
  noindex?: boolean;
}

/**
 * Per-page metadata, canonical, and hreflang alternates.
 *
 * The hreflang set is emitted on every page: the same content exists at three
 * URLs, and without alternates Google picks one arbitrarily and treats the other
 * two as duplicates. `x-default` points at Armenian, the business's own language.
 */
export function Seo({
  title,
  description,
  image,
  type = 'website',
  jsonLd = [],
  noindex,
}: SeoProps) {
  const { locale } = useI18n();
  const { pathname } = useLocation();

  useEffect(() => {
    const url = `${SITE}${pathname}`;
    const imageUrl = image
      ? image.startsWith('http')
        ? image
        : `${SITE}${image}-1600.jpg`
      : `${SITE}/media/generated/hero-home-1600.jpg`;

    // Same path, different locale segment.
    const pathWithoutLocale = pathname.replace(/^\/(hy|ru|en)/, '');

    const meta: MetaTag[] = [
      { name: 'description', content: description },
      ...(noindex ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),

      { property: 'og:site_name', content: 'Aura Interior' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: type },
      { property: 'og:url', content: url },
      { property: 'og:image', content: imageUrl },
      { property: 'og:locale', content: OG_LOCALE[locale] },
      ...LOCALES.filter((l) => l !== locale).map((l) => ({
        property: 'og:locale:alternate',
        content: OG_LOCALE[l],
      })),

      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: imageUrl },
    ];

    const links: LinkTag[] = [
      { rel: 'canonical', href: url },
      ...LOCALES.map((l) => ({
        rel: 'alternate',
        hreflang: l,
        href: `${SITE}/${l}${pathWithoutLocale}`,
      })),
      { rel: 'alternate', hreflang: 'x-default', href: `${SITE}/hy${pathWithoutLocale}` },
    ];

    applyHead({ title, meta, links, jsonLd, lang: locale });
  }, [title, description, image, type, jsonLd, noindex, locale, pathname]);

  return null;
}
