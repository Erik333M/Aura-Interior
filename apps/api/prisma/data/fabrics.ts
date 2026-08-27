import type { SeedFabric } from './types.js';

/**
 * The fabric library — twelve swatches in the brand's cream / taupe / grey /
 * charcoal range. Hex values double as the colour-filter swatches in the
 * catalogue sidebar, so they must be the real upholstery colours.
 */
export const fabrics: SeedFabric[] = [
  // ── Bouclé ────────────────────────────────────────────────────────────────
  {
    slug: 'boucle-cream',
    hex: '#EFE8DC',
    category: 'BOUCLE',
    sortOrder: 1,
    name: { hy: 'Բուկլե Կրեմ', ru: 'Букле Крем', en: 'Bouclé Cream' },
  },
  {
    slug: 'boucle-sand',
    hex: '#DCCFBB',
    category: 'BOUCLE',
    sortOrder: 2,
    name: { hy: 'Բուկլե Ավազ', ru: 'Букле Песок', en: 'Bouclé Sand' },
  },
  {
    slug: 'boucle-ash',
    hex: '#B4B0AA',
    category: 'BOUCLE',
    sortOrder: 3,
    name: { hy: 'Բուկլե Մոխրագույն', ru: 'Букле Пепел', en: 'Bouclé Ash' },
  },

  // ── Velvet ────────────────────────────────────────────────────────────────
  {
    slug: 'velvet-taupe',
    hex: '#B9AFA2',
    category: 'VELVET',
    sortOrder: 4,
    name: { hy: 'Թավշյա Տաուպ', ru: 'Бархат Тауп', en: 'Velvet Taupe' },
  },
  {
    slug: 'velvet-graphite',
    hex: '#3A3A3F',
    category: 'VELVET',
    sortOrder: 5,
    name: { hy: 'Թավշյա Գրաֆիտ', ru: 'Бархат Графит', en: 'Velvet Graphite' },
  },
  {
    slug: 'velvet-olive',
    hex: '#6B6B57',
    category: 'VELVET',
    sortOrder: 6,
    name: { hy: 'Թավշյա Ձիթապտուղ', ru: 'Бархат Олива', en: 'Velvet Olive' },
  },
  {
    slug: 'velvet-rosewood',
    hex: '#7C5B57',
    category: 'VELVET',
    sortOrder: 7,
    name: { hy: 'Թավշյա Վարդափայտ', ru: 'Бархат Розовое дерево', en: 'Velvet Rosewood' },
  },

  // ── Linen ─────────────────────────────────────────────────────────────────
  {
    slug: 'linen-oat',
    hex: '#E3DACA',
    category: 'LINEN',
    sortOrder: 8,
    name: { hy: 'Կտավատ Վարսակ', ru: 'Лён Овсяный', en: 'Linen Oat' },
  },
  {
    slug: 'linen-stone',
    hex: '#8E8A83',
    category: 'LINEN',
    sortOrder: 9,
    name: { hy: 'Կտավատ Քար', ru: 'Лён Камень', en: 'Linen Stone' },
  },
  {
    slug: 'linen-charcoal',
    hex: '#4A4A4E',
    category: 'LINEN',
    sortOrder: 10,
    name: { hy: 'Կտավատ Ածուխ', ru: 'Лён Уголь', en: 'Linen Charcoal' },
  },

  // ── Leather ───────────────────────────────────────────────────────────────
  {
    slug: 'leather-cognac',
    hex: '#8A5A3B',
    category: 'LEATHER',
    sortOrder: 11,
    name: { hy: 'Կաշի Կոնյակ', ru: 'Кожа Коньяк', en: 'Leather Cognac' },
  },
  {
    slug: 'leather-onyx',
    hex: '#1F1F22',
    category: 'LEATHER',
    sortOrder: 12,
    name: { hy: 'Կաշի Օնիքս', ru: 'Кожа Оникс', en: 'Leather Onyx' },
  },
];
