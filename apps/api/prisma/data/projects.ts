import type { SeedProject } from './types.js';

/** Completed interior design fit-outs, shown on the service page. */
export const projects: SeedProject[] = [
  {
    slug: 'arabkir-master-bedroom',
    year: 2025,
    featured: true,
    imageCount: 4,
    title: {
      hy: 'Արաբկիր՝ ծնողական ննջասենյակ',
      ru: 'Арабкир: спальня хозяев',
      en: 'Arabkir Master Bedroom',
    },
    location: { hy: 'Արաբկիր, Երևան', ru: 'Арабкир, Ереван', en: 'Arabkir, Yerevan' },
    desc: {
      hy: 'Ամբողջ պատը զբաղեցնող փափուկ պանել՝ թաքնված LED լուսավորությամբ, կոր մահճակալ և պատվերով գարդերոբ։',
      ru: 'Мягкая панель во всю стену со скрытой LED-подсветкой, кровать с изогнутым изголовьем и гардеробная на заказ.',
      en: 'A full-wall upholstered panel with concealed LED lighting, a curved bed and a bespoke walk-in wardrobe.',
    },
  },
  {
    slug: 'kentron-apartment',
    year: 2025,
    featured: true,
    imageCount: 3,
    title: { hy: 'Կենտրոն՝ բնակարան', ru: 'Кентрон: квартира', en: 'Kentron Apartment' },
    location: { hy: 'Կենտրոն, Երևան', ru: 'Кентрон, Ереван', en: 'Kentron, Yerevan' },
    desc: {
      hy: 'Հյուրասենյակ և ննջասենյակ միասնական նյութականությամբ՝ բուկլե, փայլատ սև մետաղ և ընկույզի փայտ։',
      ru: 'Гостиная и спальня в единой материальности: букле, матовый чёрный металл и орех.',
      en: 'Living room and bedroom in one material language — bouclé, matte black metal and walnut.',
    },
  },
  {
    slug: 'davtashen-guest-suite',
    year: 2024,
    featured: true,
    imageCount: 3,
    title: {
      hy: 'Դավթաշեն՝ հյուրասենյակ-սյուիտ',
      ru: 'Давташен: гостевые комнаты',
      en: 'Davtashen Guest Suite',
    },
    location: { hy: 'Դավթաշեն, Երևան', ru: 'Давташен, Ереван', en: 'Davtashen, Yerevan' },
    desc: {
      hy: 'Փոքր տարածքի լուծում՝ պահեստավորմամբ մահճակալ և հայելապատ սահող պահարան։',
      ru: 'Решение для небольшой площади: кровать с системой хранения и зеркальный шкаф-купе.',
      en: 'A small-footprint solution: a storage bed and a mirrored sliding wardrobe.',
    },
  },
  {
    slug: 'nork-marash-villa',
    year: 2024,
    featured: false,
    imageCount: 4,
    title: { hy: 'Նորք-Մարաշ՝ առանձնատուն', ru: 'Норк-Мараш: вилла', en: 'Nork-Marash Villa' },
    location: { hy: 'Նորք-Մարաշ, Երևան', ru: 'Норк-Мараш, Ереван', en: 'Nork-Marash, Yerevan' },
    desc: {
      hy: 'Երեք ննջասենյակ՝ ընդհանուր դետալային լեզվով, ամբողջությամբ արտադրված մեր արտադրամասում։',
      ru: 'Три спальни с общим языком деталей, полностью изготовленные в нашей мастерской.',
      en: 'Three bedrooms sharing one detail language, manufactured end to end in our workshop.',
    },
  },
];
