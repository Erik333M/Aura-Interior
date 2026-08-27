import type { SeedCategory } from './types.js';

/**
 * The six real categories from the brief. Interior Design is flagged isService
 * so it renders its own page and never appears in the catalogue filter list.
 */
export const categories: SeedCategory[] = [
  {
    slug: 'beds',
    sortOrder: 1,
    name: { hy: 'Մահճակալներ', ru: 'Кровати', en: 'Beds' },
    desc: {
      hy: 'Փափուկ մահճակալներ՝ ալիքաձև կարով, կոր գլխամասերով և պահեստավորման հիմքով։ Յուրաքանչյուրը կարվում է ձեր չափսերով։',
      ru: 'Мягкие кровати с каретной стяжкой, изогнутыми изголовьями и основанием с местом для хранения. Каждая изготавливается по вашим размерам.',
      en: 'Upholstered beds with channel tufting, curved headboards and storage bases. Each one is made to your dimensions.',
    },
  },
  {
    slug: 'poufs-ottomans',
    sortOrder: 2,
    name: { hy: 'Փուֆեր և Օտոմաններ', ru: 'Пуфы и Оттоманки', en: 'Poufs & Ottomans' },
    desc: {
      hy: 'Կլոր և գլանաձև փուֆեր բուկլե և թավշյա գործվածքով՝ որպես նստատեղ կամ ոտնատակ։',
      ru: 'Круглые и цилиндрические пуфы из букле и бархата — как дополнительное сиденье или подставка для ног.',
      en: 'Round and cylindrical poufs in bouclé and velvet — extra seating, or somewhere to rest your feet.',
    },
  },
  {
    slug: 'wardrobes',
    sortOrder: 3,
    name: { hy: 'Պահարաններ', ru: 'Шкафы и Гардеробные', en: 'Wardrobes & Closets' },
    desc: {
      hy: 'Կողպակավոր, բացվող և մուտքով գարդերոբներ՝ նախագծված ձեր սենյակի չափսերին ճշգրիտ։',
      ru: 'Раздвижные, распашные и гардеробные комнаты, спроектированные точно по размерам вашего помещения.',
      en: 'Sliding, hinged and walk-in wardrobes, designed to the exact dimensions of your room.',
    },
  },
  {
    slug: 'sofas',
    sortOrder: 4,
    name: { hy: 'Բազմոցներ', ru: 'Диваны', en: 'Sofas' },
    desc: {
      hy: 'Մոդուլային և խորը նստատեղով բազմոցներ բուկլե գործվածքով՝ հավաքված ձեր հյուրասենյակի համար։',
      ru: 'Модульные диваны и модели с глубокой посадкой из букле, собранные под вашу гостиную.',
      en: 'Modular and deep-seat sofas in bouclé, configured for your living room.',
    },
  },
  {
    slug: 'headboards-panels',
    sortOrder: 5,
    name: {
      hy: 'Գլխամասեր և Պատի պանելներ',
      ru: 'Изголовья и Стеновые панели',
      en: 'Headboards & Wall Panels',
    },
    desc: {
      hy: 'Փափուկ պատի պանելներ՝ որպես ինքնուրույն ճարտարապետական տարր, ոչ թե մահճակալի հավելում։',
      ru: 'Мягкие стеновые панели как самостоятельный архитектурный элемент, а не дополнение к кровати.',
      en: 'Upholstered wall panels as a standalone architectural element, not an add-on to a bed.',
    },
  },
  {
    slug: 'interior-design',
    sortOrder: 6,
    isService: true,
    name: { hy: 'Ինտերիերի դիզայն', ru: 'Дизайн интерьера', en: 'Interior Design' },
    desc: {
      hy: 'Ամբողջական ննջասենյակների նախագծում՝ լուսավորությամբ, պատի պանելներով և պատվերով կահույքով։',
      ru: 'Полное оформление спален: освещение, стеновые панели и мебель на заказ.',
      en: 'Complete bedroom fit-outs — lighting, wall panelling and made-to-order furniture.',
    },
  },
];
