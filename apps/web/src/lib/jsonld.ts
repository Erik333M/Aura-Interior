import type { Locale, Localized, Product, RatingSummary } from '@aura/types';
import { localize } from '@aura/types';

const SITE = (import.meta.env['VITE_SITE_URL'] ?? 'https://aurainterior.am').replace(/\/$/, '');
const PHONE = import.meta.env['VITE_WHATSAPP_NUMBER'] ?? '';
const HANDLE = import.meta.env['VITE_INSTAGRAM_HANDLE'] ?? 'aura_Interior';

const pick = (v: Localized, locale: Locale): string => localize(v, locale);

/** Site-wide identity, emitted on the home page. */
export function organizationLd(locale: Locale): unknown {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Aura Interior',
    alternateName: 'EVN Furniture',
    url: `${SITE}/${locale}`,
    logo: `${SITE}/media/generated/hero-home-800.jpg`,
    sameAs: [`https://instagram.com/${HANDLE}`],
  };
}

/**
 * LocalBusiness for the Contact page — this is what puts the workshop in local
 * results for "կահույք Երևան" / "мебель Ереван" / "furniture Yerevan".
 */
export function localBusinessLd(locale: Locale): unknown {
  return {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    '@id': `${SITE}/#business`,
    name: 'Aura Interior',
    alternateName: 'EVN Furniture',
    url: `${SITE}/${locale}`,
    image: `${SITE}/media/generated/hero-home-1600.jpg`,
    ...(PHONE ? { telephone: `+${PHONE}` } : {}),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Yerevan',
      addressCountry: 'AM',
    },
    areaServed: { '@type': 'City', name: 'Yerevan' },
    priceRange: '֏֏֏',
    sameAs: [`https://instagram.com/${HANDLE}`],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '10:00',
        closes: '19:00',
      },
    ],
  };
}

/**
 * Product schema. AggregateRating is included ONLY when approved reviews exist —
 * emitting a rating with zero reviews is exactly the kind of thing that earns a
 * structured-data penalty.
 *
 * Availability is MadeToOrder, and the offer is a lowest-price offer rather than
 * a fixed price, because the site sells commissions, not stock.
 */
export function productLd(
  product: Product,
  locale: Locale,
  rating: RatingSummary | undefined,
): unknown {
  const url = `${SITE}/${locale}/catalogue/${product.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: pick(product.name, locale),
    description: pick(product.description, locale),
    sku: product.slug,
    url,
    image: product.images.map((i) => `${SITE}${i.url}-1600.jpg`),
    material: pick(product.defaultMaterial, locale),
    brand: { '@type': 'Brand', name: 'Aura Interior' },
    ...(product.category ? { category: pick(product.category.name, locale) } : {}),
    width: { '@type': 'QuantitativeValue', value: product.dimensions.widthCm, unitCode: 'CMT' },
    depth: { '@type': 'QuantitativeValue', value: product.dimensions.depthCm, unitCode: 'CMT' },
    height: { '@type': 'QuantitativeValue', value: product.dimensions.heightCm, unitCode: 'CMT' },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'AMD',
      price: product.priceFrom,
      availability: 'https://schema.org/MadeToOrder',
      priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
      seller: { '@type': 'Organization', name: 'Aura Interior' },
    },
    ...(rating && rating.count > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating.average,
            reviewCount: rating.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}

export function breadcrumbLd(items: Array<{ name: string; path: string }>): unknown {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE}${item.path}`,
    })),
  };
}
