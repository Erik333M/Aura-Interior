import type { SeedProduct } from './types.js';

/**
 * Twenty pieces across the five product categories.
 *
 * Model names are Armenian proper nouns (mountains, monasteries, towns) and
 * stay identical in all three languages — that is how furniture brands actually
 * name ranges, and it keeps the trilingual layout honest: only the descriptive
 * copy changes length between locales.
 *
 * Prices are AMD starting points ("from N ֏"), never fixed SKU prices.
 */
/**
 * Retail multiple applied to Paylak's wholesale mattress cost.
 * PLACEHOLDER — set this to Aura's real margin before launch.
 */
/**
 * Retail = (supplier cost + SUPPLIER_SURCHARGE) * MATTRESS_MARKUP, rounded to
 * the nearest 1,000 AMD.
 *
 * The old flat x2 was a placeholder that did two things wrong: 2.0 is well
 * above a normal furniture retail multiple, and it ignored the surcharge the
 * supplier said to expect on every quoted cost. 1.45 is a realistic wholesale
 * -> retail multiple for this market.
 *
 * STILL AN ESTIMATE. Confirm both numbers with Paylak before quoting.
 */
export const MATTRESS_MARKUP = 1.45;

/** The supplier said to expect roughly 15-20k AMD on top of every quoted cost. */
export const SUPPLIER_SURCHARGE = 18_000;

/** Retail price for a given wholesale cost, rounded to a sane shelf number. */
export function retailFromCost(cost: number): number {
  return Math.round(((cost + SUPPLIER_SURCHARGE) * MATTRESS_MARKUP) / 1000) * 1000;
}

export const products: SeedProduct[] = [
  // ───────────────────────── Beds — 450,000–1,400,000 ֏ ─────────────────────
  {
    slug: 'chelsea-bed',
    categorySlug: 'beds',
    priceFrom: 680_000,
    widthCm: 180,
    depthCm: 215,
    heightCm: 120,
    customSizeAvailable: true,
    leadTimeDays: 30,
    featured: true,
    fabricSlugs: ['boucle-cream', 'boucle-sand', 'velvet-taupe', 'linen-oat', 'velvet-graphite'],
    name: { hy: 'Chelsea', ru: 'Chelsea', en: 'Chelsea' },
    material: {
      hy: 'Բուկլե, կարծր փայտի կմախք',
      ru: 'Букле, каркас из массива',
      en: 'Bouclé over a hardwood frame',
    },
    desc: {
      hy: 'Կոր գլխամաս՝ ամբողջ լայնքով ալիքաձև կարով։ Հիմքը՝ կարծր փայտից, ոտքերը՝ թաքնված, որպեսզի մահճակալը կարծես լողա հատակի վրա։',
      ru: 'Изогнутое изголовье с каретной стяжкой во всю ширину. Каркас из массива, ножки скрыты — кровать словно парит над полом.',
      en: 'A curved headboard channel-tufted across its full width. Hardwood frame, recessed legs, so the bed appears to float above the floor.',
    },
  },
  {
    slug: 'elyson-bed',
    categorySlug: 'beds',
    priceFrom: 540_000,
    widthCm: 160,
    depthCm: 210,
    heightCm: 110,
    customSizeAvailable: true,
    leadTimeDays: 28,
    featured: false,
    fabricSlugs: ['boucle-cream', 'linen-oat', 'linen-stone', 'velvet-taupe'],
    name: { hy: 'Elyson', ru: 'Elyson', en: 'Elyson' },
    material: {
      hy: 'Կտավատ, կարծր փայտի կմախք',
      ru: 'Лён, каркас из массива',
      en: 'Linen over a hardwood frame',
    },
    desc: {
      hy: 'Ուղղանկյուն, զուսպ գլխամաս՝ առանց ավելորդ դետալի։ Ամենահանգիստ տարբերակը փոքր ննջասենյակի համար։',
      ru: 'Прямоугольное сдержанное изголовье без лишних деталей. Самый спокойный вариант для небольшой спальни.',
      en: 'A rectangular, restrained headboard with nothing extra on it. The quietest option for a small bedroom.',
    },
  },
  {
    slug: 'belmont-bed',
    categorySlug: 'beds',
    priceFrom: 890_000,
    widthCm: 200,
    depthCm: 220,
    heightCm: 135,
    customSizeAvailable: true,
    leadTimeDays: 35,
    featured: true,
    fabricSlugs: ['boucle-cream', 'boucle-ash', 'velvet-graphite', 'velvet-olive', 'leather-onyx'],
    name: { hy: 'Belmont', ru: 'Belmont', en: 'Belmont' },
    material: {
      hy: 'Բուկլե, ամբողջական պահեստավորման հիմք',
      ru: 'Букле, основание с хранением',
      en: 'Bouclé with a full storage base',
    },
    desc: {
      hy: 'Բարձր գլխամաս՝ կողային «թևերով», որոնք փաթաթվում են մահճակալի շուրջ։ Հիմքը բացվում է գազային ամորտիզատորներով։',
      ru: 'Высокое изголовье с боковыми «крыльями», обнимающими кровать. Основание поднимается на газлифтах.',
      en: 'A tall headboard with side wings that wrap around the bed. The base lifts on gas struts for full-footprint storage.',
    },
  },
  {
    slug: 'marlowe-bed',
    categorySlug: 'beds',
    priceFrom: 450_000,
    widthCm: 140,
    depthCm: 205,
    heightCm: 100,
    customSizeAvailable: true,
    leadTimeDays: 21,
    featured: false,
    fabricSlugs: ['boucle-sand', 'linen-oat', 'linen-charcoal', 'velvet-taupe'],
    name: { hy: 'Marlowe', ru: 'Marlowe', en: 'Marlowe' },
    material: {
      hy: 'Կտավատ, մետաղական ոտքեր',
      ru: 'Лён, металлические ножки',
      en: 'Linen with blackened metal legs',
    },
    desc: {
      hy: 'Կոմպակտ մահճակալ՝ կլորացված անկյուններով և բարակ սև մետաղյա ոտքերով։ Հարմար է հյուրասենյակի կամ դեռահասի սենյակի համար։',
      ru: 'Компактная кровать со скруглёнными углами на тонких чёрных ножках. Подходит для гостевой или подростковой комнаты.',
      en: 'A compact bed with softened corners on slim blackened legs. Suits a guest room or a teenager’s room.',
    },
  },
  {
    slug: 'devereux-bed',
    categorySlug: 'beds',
    priceFrom: 1_400_000,
    widthCm: 200,
    depthCm: 230,
    heightCm: 150,
    customSizeAvailable: true,
    leadTimeDays: 45,
    featured: true,
    fabricSlugs: [
      'boucle-cream',
      'velvet-graphite',
      'velvet-rosewood',
      'leather-cognac',
      'leather-onyx',
    ],
    name: { hy: 'Devereux', ru: 'Devereux', en: 'Devereux' },
    material: {
      hy: 'Թավիշ կամ կաշի, ընկույզի դետալներ',
      ru: 'Бархат или кожа, вставки из ореха',
      en: 'Velvet or leather with walnut inlay',
    },
    desc: {
      hy: 'Մեր ամենամեծ մոդելը՝ պատի ամբողջ լայնքով գլխամասով, ինտեգրված գիշերային սեղանիկներով և թաքնված լուսավորությամբ։',
      ru: 'Наша самая крупная модель: изголовье во всю ширину стены, встроенные прикроватные тумбы и скрытая подсветка.',
      en: 'Our largest model — a headboard spanning the full wall, integrated bedside tables and concealed lighting.',
    },
  },
  {
    slug: 'savoy-bed',
    categorySlug: 'beds',
    priceFrom: 760_000,
    widthCm: 180,
    depthCm: 215,
    heightCm: 125,
    customSizeAvailable: true,
    leadTimeDays: 30,
    featured: false,
    fabricSlugs: ['boucle-sand', 'velvet-rosewood', 'velvet-taupe', 'linen-oat'],
    name: { hy: 'Savoy', ru: 'Savoy', en: 'Savoy' },
    material: {
      hy: 'Թավիշ, կարծր փայտի կմախք',
      ru: 'Бархат, каркас из массива',
      en: 'Velvet over a hardwood frame',
    },
    desc: {
      hy: 'Կամարաձև գլխամաս՝ ուղղահայաց ալիքներով, որոնք բարձրանում են դեպի կենտրոն։ Փափուկ, բայց հստակ ուրվագիծ։',
      ru: 'Арочное изголовье с вертикальными каналами, поднимающимися к центру. Мягкий, но чёткий силуэт.',
      en: 'An arched headboard with vertical channels rising toward the centre. Soft, but with a defined silhouette.',
    },
  },

  // ─────────────────────────── Poufs (soft seating) ──────────────────────────
  // Single price point across the range — see SOFT_SEATING_PRICE.
  {
    slug: 'kamar-pouf',
    categorySlug: 'soft-seating',
    priceFrom: 8_000,
    widthCm: 45,
    depthCm: 45,
    heightCm: 42,
    customSizeAvailable: false,
    leadTimeDays: 14,
    featured: false,
    fabricSlugs: ['boucle-cream', 'boucle-sand', 'boucle-ash', 'velvet-taupe'],
    name: { hy: 'Կամար', ru: 'Камар', en: 'Kamar' },
    material: {
      hy: 'Բուկլե, բարձր խտության փրփուր',
      ru: 'Букле, пена высокой плотности',
      en: 'Bouclé over high-density foam',
    },
    desc: {
      hy: 'Փոքր գլանաձև փուֆ՝ ամենօրյա օգտագործման համար։ Բավական թեթև է մի ձեռքով տեղափոխելու համար։',
      ru: 'Небольшой цилиндрический пуф для повседневного использования. Достаточно лёгкий, чтобы переставить одной рукой.',
      en: 'A small cylindrical pouf for everyday use. Light enough to move with one hand.',
    },
  },
  {
    slug: 'vardi-pouf',
    categorySlug: 'soft-seating',
    priceFrom: 8_000,
    widthCm: 60,
    depthCm: 60,
    heightCm: 40,
    customSizeAvailable: false,
    leadTimeDays: 14,
    featured: true,
    fabricSlugs: ['boucle-cream', 'boucle-sand', 'velvet-rosewood', 'velvet-olive'],
    name: { hy: 'Վարդի', ru: 'Варди', en: 'Vardi' },
    material: {
      hy: 'Բուկլե, ամրացված հիմք',
      ru: 'Букле, усиленное основание',
      en: 'Bouclé on a reinforced base',
    },
    desc: {
      hy: 'Կլոր փուֆ՝ կենտրոնական կարով, որը գործվածքը հավաքում է վարդի պես։ Ամենաշատ պատվիրվող փոքր կտորը։',
      ru: 'Круглый пуф с центральной стяжкой, собирающей ткань подобно розе. Самая заказываемая небольшая позиция.',
      en: 'A round pouf with a centre tuft that gathers the fabric like a rose. Our most-ordered small piece.',
    },
  },
  {
    slug: 'gugark-pouf',
    categorySlug: 'soft-seating',
    priceFrom: 8_000,
    widthCm: 100,
    depthCm: 50,
    heightCm: 42,
    customSizeAvailable: true,
    leadTimeDays: 18,
    featured: false,
    fabricSlugs: ['boucle-ash', 'linen-stone', 'velvet-graphite', 'leather-cognac'],
    name: { hy: 'Գուգարք', ru: 'Гугарк', en: 'Gugark' },
    material: {
      hy: 'Կտավատ կամ կաշի, փայտե կմախք',
      ru: 'Лён или кожа, деревянный каркас',
      en: 'Linen or leather on a timber frame',
    },
    desc: {
      hy: 'Ուղղանկյուն փուֆ՝ մահճակալի ոտքի մոտ դնելու համար։ Կարող է պատրաստվել ներսում պահեստավորմամբ։',
      ru: 'Прямоугольный пуф для установки в изножье кровати. Может быть изготовлена с внутренним отсеком для хранения.',
      en: 'A rectangular pouf made to sit at the foot of a bed. Can be built with an interior storage compartment.',
    },
  },
  {
    slug: 'karin-pouf',
    categorySlug: 'soft-seating',
    priceFrom: 8_000,
    widthCm: 120,
    depthCm: 60,
    heightCm: 44,
    customSizeAvailable: true,
    leadTimeDays: 21,
    featured: false,
    fabricSlugs: ['boucle-cream', 'velvet-taupe', 'velvet-graphite', 'leather-onyx'],
    name: { hy: 'Կարին', ru: 'Карин', en: 'Karin' },
    material: {
      hy: 'Բուկլե, պահեստավորմամբ հիմք',
      ru: 'Букле, основание с хранением',
      en: 'Bouclé with a storage base',
    },
    desc: {
      hy: 'Երկար փուֆ՝ բացվող կափարիչով և ամբողջ երկարությամբ պահեստավորմամբ։ Հաճախ պատվիրվում է Սևան մահճակալի հետ։',
      ru: 'Длинный пуф с откидной крышкой и хранением по всей длине. Часто заказывают вместе с кроватью Севан.',
      en: 'A long pouf with a lifting lid and storage along its full length. Often ordered alongside the Sevan bed.',
    },
  },

  // ────────────────────── Wardrobes — 350,000–900,000 ֏ ─────────────────────
  {
    slug: 'zangak-wardrobe',
    categorySlug: 'wardrobes',
    priceFrom: 350_000,
    widthCm: 150,
    depthCm: 60,
    heightCm: 240,
    customSizeAvailable: true,
    leadTimeDays: 30,
    featured: false,
    fabricSlugs: ['linen-oat', 'linen-stone'],
    name: { hy: 'Զանգակ', ru: 'Зангак', en: 'Zangak' },
    material: {
      hy: 'MDF՝ փայլատ ծածկույթով, փափուկ ճակատներ',
      ru: 'МДФ с матовым покрытием, мягкие фасады',
      en: 'Matte-lacquered MDF with upholstered fronts',
    },
    desc: {
      hy: 'Երկդռնանի բացվող պահարան՝ փափուկ ճակատներով և փայլատ սև բռնակներով։ Ներսը՝ ձեր պահանջով։',
      ru: 'Двухдверный распашной шкаф с мягкими фасадами и матовой чёрной фурнитурой. Наполнение — по вашему запросу.',
      en: 'A two-door hinged wardrobe with upholstered fronts and matte black hardware. Interior configured to your brief.',
    },
  },
  {
    slug: 'masis-wardrobe',
    categorySlug: 'wardrobes',
    priceFrom: 620_000,
    widthCm: 240,
    depthCm: 65,
    heightCm: 250,
    customSizeAvailable: true,
    leadTimeDays: 35,
    featured: true,
    fabricSlugs: ['linen-oat', 'linen-charcoal', 'boucle-ash'],
    name: { hy: 'Մասիս', ru: 'Масис', en: 'Masis' },
    material: {
      hy: 'Սահող ճակատներ՝ հայելիով և փափուկ պանելով',
      ru: 'Раздвижные фасады с зеркалом и мягкой панелью',
      en: 'Sliding fronts in mirror and upholstered panel',
    },
    desc: {
      hy: 'Երեք սահող ճակատ՝ մեկը հայելի, երկուսը՝ փափուկ։ Ուղեկցվում է ամբողջ բարձրության ներքին լուսավորությամբ։',
      ru: 'Три раздвижных фасада: один зеркальный, два мягких. Внутренняя подсветка по всей высоте.',
      en: 'Three sliding fronts — one mirrored, two upholstered — with full-height interior lighting.',
    },
  },
  {
    slug: 'areni-wardrobe',
    categorySlug: 'wardrobes',
    priceFrom: 480_000,
    widthCm: 180,
    depthCm: 60,
    heightCm: 240,
    customSizeAvailable: true,
    leadTimeDays: 30,
    featured: false,
    fabricSlugs: ['linen-stone', 'linen-charcoal'],
    name: { hy: 'Արենի', ru: 'Арени', en: 'Areni' },
    material: {
      hy: 'Ընկույզի երեսպատում, փայլատ ապակի',
      ru: 'Ореховый шпон, матовое стекло',
      en: 'Walnut veneer with matte glass',
    },
    desc: {
      hy: 'Բացվող պահարան՝ ընկույզի երեսպատմամբ և փայլատ ապակե ներդիրներով։ Տաք տարբերակը մուգ ինտերիերի համար։',
      ru: 'Распашной шкаф с ореховым шпоном и вставками из матового стекла. Тёплый вариант для тёмного интерьера.',
      en: 'A hinged wardrobe in walnut veneer with matte glass inserts. The warm option for a dark interior.',
    },
  },
  {
    slug: 'tatev-wardrobe',
    categorySlug: 'wardrobes',
    priceFrom: 900_000,
    widthCm: 320,
    depthCm: 70,
    heightCm: 260,
    customSizeAvailable: true,
    leadTimeDays: 45,
    featured: true,
    fabricSlugs: ['boucle-ash', 'linen-charcoal', 'velvet-graphite'],
    name: { hy: 'Տաթև', ru: 'Татев', en: 'Tatev' },
    material: {
      hy: 'Մուտքով գարդերոբ՝ ալյումինե պրոֆիլ, ապակի',
      ru: 'Гардеробная: алюминиевый профиль, стекло',
      en: 'Walk-in system in aluminium profile and glass',
    },
    desc: {
      hy: 'Մուտքով գարդերոբի ամբողջական համակարգ՝ բաց դարակներով, ապակե դռներով և ինտեգրված լուսավորությամբ։ Չափվում է տեղում։',
      ru: 'Полная система гардеробной: открытые полки, стеклянные двери и встроенное освещение. Замер на объекте.',
      en: 'A complete walk-in system — open shelving, glass doors and integrated lighting. Measured on site.',
    },
  },

  // ───────────────────────── Sofas — 620,000–1,100,000 ֏ ────────────────────
  {
    slug: 'garni-sofa',
    categorySlug: 'sofas',
    priceFrom: 780_000,
    widthCm: 240,
    depthCm: 100,
    heightCm: 78,
    customSizeAvailable: true,
    leadTimeDays: 35,
    featured: true,
    fabricSlugs: ['boucle-cream', 'boucle-sand', 'boucle-ash', 'velvet-taupe', 'linen-oat'],
    name: { hy: 'Գառնի', ru: 'Гарни', en: 'Garni' },
    material: {
      hy: 'Բուկլե, փետուրով լցոնված բարձեր',
      ru: 'Букле, подушки с пуховым наполнением',
      en: 'Bouclé with feather-filled cushions',
    },
    desc: {
      hy: 'Երեքտեղանոց բազմոց՝ խորը նստատեղով և ցածր թիկնակով։ Բարձերը շարժական են, կարելի է վերալիցքավորել։',
      ru: 'Трёхместный диван с глубокой посадкой и низкой спинкой. Подушки съёмные, наполнение обновляется.',
      en: 'A three-seat sofa with a deep seat and low back. The cushions are removable and can be refilled.',
    },
  },
  {
    slug: 'noravank-sofa',
    categorySlug: 'sofas',
    priceFrom: 1_100_000,
    widthCm: 320,
    depthCm: 180,
    heightCm: 72,
    customSizeAvailable: true,
    leadTimeDays: 45,
    featured: true,
    fabricSlugs: ['boucle-cream', 'boucle-ash', 'velvet-graphite', 'linen-stone'],
    name: { hy: 'Նորավանք', ru: 'Нораванк', en: 'Noravank' },
    material: {
      hy: 'Մոդուլային բուկլե համակարգ',
      ru: 'Модульная система из букле',
      en: 'Modular bouclé system',
    },
    desc: {
      hy: 'Մոդուլային անկյունային բազմոց՝ հավաքվում է ձեր հյուրասենյակի ձևով։ Մոդուլները կարելի է ավելացնել հետագայում։',
      ru: 'Модульный угловой диван, который собирается под форму вашей гостиной. Модули можно докупить позже.',
      en: 'A modular corner sofa configured to the shape of your living room. Further modules can be added later.',
    },
  },
  {
    slug: 'dilijan-sofa',
    categorySlug: 'sofas',
    priceFrom: 620_000,
    widthCm: 200,
    depthCm: 92,
    heightCm: 80,
    customSizeAvailable: true,
    leadTimeDays: 30,
    featured: false,
    fabricSlugs: ['linen-oat', 'linen-stone', 'velvet-olive', 'boucle-sand'],
    name: { hy: 'Դիլիջան', ru: 'Дилижан', en: 'Dilijan' },
    material: {
      hy: 'Կտավատ, հաճարենու ոտքեր',
      ru: 'Лён, буковые ножки',
      en: 'Linen with beech legs',
    },
    desc: {
      hy: 'Երկտեղանոց բազմոց՝ ուղիղ գծերով և տեսանելի փայտե ոտքերով։ Ամենափոքր տարածքի տարբերակը։',
      ru: 'Двухместный диван с прямыми линиями и открытыми деревянными ножками. Вариант для небольшой площади.',
      en: 'A two-seat sofa with straight lines and exposed timber legs. The option for a smaller footprint.',
    },
  },
  {
    slug: 'amberd-sofa',
    categorySlug: 'sofas',
    priceFrom: 950_000,
    widthCm: 280,
    depthCm: 105,
    heightCm: 75,
    customSizeAvailable: true,
    leadTimeDays: 40,
    featured: false,
    fabricSlugs: ['velvet-graphite', 'velvet-rosewood', 'leather-cognac', 'leather-onyx'],
    name: { hy: 'Ամբերդ', ru: 'Амберд', en: 'Amberd' },
    material: {
      hy: 'Թավիշ կամ կաշի, մետաղական հիմք',
      ru: 'Бархат или кожа, металлическое основание',
      en: 'Velvet or leather on a metal base',
    },
    desc: {
      hy: 'Ցածր, երկար բազմոց՝ ալիքաձև թիկնակով և փայլատ սև մետաղյա հիմքով։ Ամենաճարտարապետական մոդելը։',
      ru: 'Низкий длинный диван с каналами на спинке и матовым чёрным металлическим основанием. Самая архитектурная модель.',
      en: 'A low, long sofa with a channelled back on a matte black metal base. The most architectural model we make.',
    },
  },

  // ────────────── Headboards & Wall Panels — 180,000–520,000 ֏ ──────────────
  {
    slug: 'erebuni-headboard',
    categorySlug: 'headboards-panels',
    priceFrom: 180_000,
    widthCm: 160,
    depthCm: 8,
    heightCm: 120,
    customSizeAvailable: true,
    leadTimeDays: 21,
    featured: false,
    fabricSlugs: ['boucle-cream', 'boucle-sand', 'velvet-taupe', 'linen-oat', 'velvet-graphite'],
    name: { hy: 'Էրեբունի', ru: 'Эребуни', en: 'Erebuni' },
    material: {
      hy: 'Փափուկ պանել՝ պատին ամրացվող',
      ru: 'Мягкая панель с настенным креплением',
      en: 'Upholstered panel, wall-mounted',
    },
    desc: {
      hy: 'Առանձին գլխամաս՝ ամրացվում է անմիջապես պատին, առանց մահճակալի։ Ալիքների լայնությունը՝ ձեր ընտրությամբ։',
      ru: 'Отдельное изголовье, крепится прямо на стену, без кровати. Ширину каналов выбираете вы.',
      en: 'A standalone headboard fixed directly to the wall, with no bed attached. You choose the channel width.',
    },
  },
  {
    slug: 'zvartnots-panel',
    categorySlug: 'headboards-panels',
    priceFrom: 520_000,
    widthCm: 400,
    depthCm: 10,
    heightCm: 280,
    customSizeAvailable: true,
    leadTimeDays: 40,
    featured: true,
    fabricSlugs: [
      'boucle-cream',
      'boucle-ash',
      'velvet-graphite',
      'linen-charcoal',
      'velvet-olive',
    ],
    name: { hy: 'Զվարթնոց', ru: 'Звартноц', en: 'Zvartnots' },
    material: {
      hy: 'Փափուկ պատի համակարգ՝ LED լուսավորությամբ',
      ru: 'Система стеновых панелей с LED-подсветкой',
      en: 'Upholstered wall system with LED lighting',
    },
    desc: {
      hy: 'Ամբողջ պատը ծածկող փափուկ պանելների համակարգ՝ թաքնված LED գծերով կարերի միջև։ Չափվում և տեղադրվում է մեր կողմից։',
      ru: 'Система мягких панелей во всю стену со скрытыми LED-линиями между швами. Замер и монтаж — с нашей стороны.',
      en: 'A full-wall upholstered panel system with concealed LED lines running between the seams. We measure and install.',
    },
  },

  // ───────────────────────── Mattresses ─────────────────────────────────────
  //
  // Thirteen models sourced from Paylak, quoted 17 Aug 2026 (Telegram).
  //
  // PRICING — READ BEFORE LAUNCH. The "SUPPLIER COST" comment on each entry is
  // what the mattress costs Aura, not what it sells for. `priceFrom` is that
  // cost times MATTRESS_MARKUP. The 2 default is a placeholder, not a
  // researched margin — set it to your real retail multiple. The supplier also
  // said to expect roughly 15–20k AMD on top of every quoted cost.
  //
  // heightCm is a plausible spec, not a measured one — confirm with Paylak.
  // Full per-size cost tables: ~/Desktop/aura-interiors-inventory.xlsx.

  {
    // SUPPLIER COST (AMD, mattress only): 90x190 = 140.000 · 160x190 = 215.000 · 170x190 = 230.000 · 190x200 = 260.000
    // Parsed into sizeCosts below — retail is cost * MATTRESS_MARKUP.
    sizeCosts: [
      { widthCm: 90, depthCm: 190, cost: 140000 },
      { widthCm: 160, depthCm: 190, cost: 215000 },
      { widthCm: 170, depthCm: 190, cost: 230000 },
      { widthCm: 190, depthCm: 200, cost: 260000 },
    ],
    slug: 'bellagio-mattress',
    categorySlug: 'mattresses',
    priceFrom: retailFromCost(140_000),
    widthCm: 90,
    depthCm: 190,
    heightCm: 24,
    customSizeAvailable: true,
    leadTimeDays: 14,
    featured: true,
    fabricSlugs: [],
    name: { hy: 'Bellagio', ru: 'Bellagio', en: 'Bellagio' },
    material: {
      hy: 'Գրպանավոր զսպանակներ, օրթոպեդիկ',
      ru: 'Независимые пружины, ортопедический',
      en: 'Pocket springs, orthopedic',
    },
    desc: {
      hy: 'Օրթոպեդիկ ներքնակ՝ անկախ գրպանավոր զսպանակներով, որոնք առանձին են արձագանքում մարմնի յուրաքանչյուր հատվածին։ Առկա է 4 չափսով։',
      ru: 'Ортопедический матрас на независимых пружинах в чехлах — каждая зона реагирует отдельно. Доступен в 4 размерах.',
      en: 'An orthopedic mattress on independently pocketed springs, so each zone responds on its own. Available in 4 sizes.',
    },
  },
  {
    // SUPPLIER COST (AMD, mattress only): 90x190 = 90.000 · 160x190 = 130.000 · 180x190 = 140.000 · 190x200 = 165.000 · 200x200 = 175.000
    // Parsed into sizeCosts below — retail is cost * MATTRESS_MARKUP.
    sizeCosts: [
      { widthCm: 90, depthCm: 190, cost: 90000 },
      { widthCm: 160, depthCm: 190, cost: 130000 },
      { widthCm: 180, depthCm: 190, cost: 140000 },
      { widthCm: 190, depthCm: 200, cost: 165000 },
      { widthCm: 200, depthCm: 200, cost: 175000 },
    ],
    slug: 'verona-mattress',
    categorySlug: 'mattresses',
    priceFrom: retailFromCost(90_000),
    widthCm: 90,
    depthCm: 190,
    heightCm: 24,
    customSizeAvailable: true,
    leadTimeDays: 14,
    featured: false,
    fabricSlugs: [],
    name: { hy: 'Verona', ru: 'Verona', en: 'Verona' },
    material: {
      hy: 'Գրպանավոր զսպանակներ, օրթոպեդիկ',
      ru: 'Независимые пружины, ортопедический',
      en: 'Pocket springs, orthopedic',
    },
    desc: {
      hy: 'Օրթոպեդիկ ներքնակ՝ անկախ գրպանավոր զսպանակներով, որոնք առանձին են արձագանքում մարմնի յուրաքանչյուր հատվածին։ Առկա է 5 չափսով։',
      ru: 'Ортопедический матрас на независимых пружинах в чехлах — каждая зона реагирует отдельно. Доступен в 5 размерах.',
      en: 'An orthopedic mattress on independently pocketed springs, so each zone responds on its own. Available in 5 sizes.',
    },
  },
  {
    // SUPPLIER COST (AMD, mattress only): 90x190 = 105.000 · 160x190 = 140.000 · 180x190 = 160.000 · 200x200 = 180.000
    // Parsed into sizeCosts below — retail is cost * MATTRESS_MARKUP.
    sizeCosts: [
      { widthCm: 90, depthCm: 190, cost: 105000 },
      { widthCm: 160, depthCm: 190, cost: 140000 },
      { widthCm: 180, depthCm: 190, cost: 160000 },
      { widthCm: 200, depthCm: 200, cost: 180000 },
    ],
    slug: 'siena-mattress',
    categorySlug: 'mattresses',
    priceFrom: retailFromCost(105_000),
    widthCm: 90,
    depthCm: 190,
    heightCm: 24,
    customSizeAvailable: true,
    leadTimeDays: 14,
    featured: false,
    fabricSlugs: [],
    name: { hy: 'Siena', ru: 'Siena', en: 'Siena' },
    material: {
      hy: 'Գրպանավոր զսպանակներ, օրթոպեդիկ',
      ru: 'Независимые пружины, ортопедический',
      en: 'Pocket springs, orthopedic',
    },
    desc: {
      hy: 'Օրթոպեդիկ ներքնակ՝ անկախ գրպանավոր զսպանակներով, որոնք առանձին են արձագանքում մարմնի յուրաքանչյուր հատվածին։ Առկա է 4 չափսով։',
      ru: 'Ортопедический матрас на независимых пружинах в чехлах — каждая зона реагирует отдельно. Доступен в 4 размерах.',
      en: 'An orthopedic mattress on independently pocketed springs, so each zone responds on its own. Available in 4 sizes.',
    },
  },
  {
    // SUPPLIER COST (AMD, mattress only): 90x190 = 90.000 · 160x190 = 135.000 · 180x190 = 150.000 · 200x200 = 165.000
    // Parsed into sizeCosts below — retail is cost * MATTRESS_MARKUP.
    sizeCosts: [
      { widthCm: 90, depthCm: 190, cost: 90000 },
      { widthCm: 160, depthCm: 190, cost: 135000 },
      { widthCm: 180, depthCm: 190, cost: 150000 },
      { widthCm: 200, depthCm: 200, cost: 165000 },
    ],
    slug: 'portofino-mattress',
    categorySlug: 'mattresses',
    priceFrom: retailFromCost(90_000),
    widthCm: 90,
    depthCm: 190,
    heightCm: 24,
    customSizeAvailable: true,
    leadTimeDays: 14,
    featured: false,
    fabricSlugs: [],
    name: { hy: 'Portofino', ru: 'Portofino', en: 'Portofino' },
    material: {
      hy: 'Գրպանավոր զսպանակներ, օրթոպեդիկ',
      ru: 'Независимые пружины, ортопедический',
      en: 'Pocket springs, orthopedic',
    },
    desc: {
      hy: 'Օրթոպեդիկ ներքնակ՝ անկախ գրպանավոր զսպանակներով, որոնք առանձին են արձագանքում մարմնի յուրաքանչյուր հատվածին։ Առկա է 4 չափսով։',
      ru: 'Ортопедический матрас на независимых пружинах в чехлах — каждая зона реагирует отдельно. Доступен в 4 размерах.',
      en: 'An orthopedic mattress on independently pocketed springs, so each zone responds on its own. Available in 4 sizes.',
    },
  },
  {
    // SUPPLIER COST (AMD, mattress only): 90x190 = 190.000 · 160x190 = 299.000 · 180x190 = 340.000 · 190x200 = 360.000 · 200x200 = 370.000
    // Parsed into sizeCosts below — retail is cost * MATTRESS_MARKUP.
    sizeCosts: [
      { widthCm: 90, depthCm: 190, cost: 190000 },
      { widthCm: 160, depthCm: 190, cost: 299000 },
      { widthCm: 180, depthCm: 190, cost: 340000 },
      { widthCm: 190, depthCm: 200, cost: 360000 },
      { widthCm: 200, depthCm: 200, cost: 370000 },
    ],
    slug: 'amalfi-mattress',
    categorySlug: 'mattresses',
    priceFrom: retailFromCost(190_000),
    widthCm: 90,
    depthCm: 190,
    heightCm: 24,
    customSizeAvailable: true,
    leadTimeDays: 14,
    featured: true,
    fabricSlugs: [],
    name: { hy: 'Amalfi', ru: 'Amalfi', en: 'Amalfi' },
    material: {
      hy: 'Գրպանավոր զսպանակներ, օրթոպեդիկ',
      ru: 'Независимые пружины, ортопедический',
      en: 'Pocket springs, orthopedic',
    },
    desc: {
      hy: 'Օրթոպեդիկ ներքնակ՝ անկախ գրպանավոր զսպանակներով, որոնք առանձին են արձագանքում մարմնի յուրաքանչյուր հատվածին։ Առկա է 5 չափսով։',
      ru: 'Ортопедический матрас на независимых пружинах в чехлах — каждая зона реагирует отдельно. Доступен в 5 размерах.',
      en: 'An orthopedic mattress on independently pocketed springs, so each zone responds on its own. Available in 5 sizes.',
    },
  },
  {
    // SUPPLIER COST (AMD, mattress only): 90x190 = 40.000 · 140x190 = 55.000 · 160x190 = 65.000 · 180x190 = 75.000 · 190x200 = 80.000 · 200x200 = 90.000
    // Parsed into sizeCosts below — retail is cost * MATTRESS_MARKUP.
    sizeCosts: [
      { widthCm: 90, depthCm: 190, cost: 40000 },
      { widthCm: 140, depthCm: 190, cost: 55000 },
      { widthCm: 160, depthCm: 190, cost: 65000 },
      { widthCm: 180, depthCm: 190, cost: 75000 },
      { widthCm: 190, depthCm: 200, cost: 80000 },
      { widthCm: 200, depthCm: 200, cost: 90000 },
    ],
    slug: 'cortina-mattress',
    categorySlug: 'mattresses',
    priceFrom: retailFromCost(40_000),
    widthCm: 90,
    depthCm: 190,
    heightCm: 18,
    customSizeAvailable: true,
    leadTimeDays: 10,
    featured: false,
    fabricSlugs: [],
    name: { hy: 'Cortina', ru: 'Cortina', en: 'Cortina' },
    material: {
      hy: 'Բոնել զսպանակներ, ստանդարտ',
      ru: 'Пружины боннель, стандартный',
      en: 'Bonnell springs, standard',
    },
    desc: {
      hy: 'Ստանդարտ զսպանակավոր ներքնակ՝ ամենօրյա օգտագործման համար։ Առկա է 6 չափսով։',
      ru: 'Стандартный пружинный матрас для повседневного использования. Доступен в 6 размерах.',
      en: 'A standard sprung mattress for everyday use. Available in 6 sizes.',
    },
  },
  {
    // SUPPLIER COST (AMD, mattress only): 90x190 = 42.000 · 140x190 = 63.000 · 160x190 = 72.000 · 180x190 = 75.000 · 190x200 = 90.000 · 200x200 = 100.000
    // Parsed into sizeCosts below — retail is cost * MATTRESS_MARKUP.
    sizeCosts: [
      { widthCm: 90, depthCm: 190, cost: 42000 },
      { widthCm: 140, depthCm: 190, cost: 63000 },
      { widthCm: 160, depthCm: 190, cost: 72000 },
      { widthCm: 180, depthCm: 190, cost: 75000 },
      { widthCm: 190, depthCm: 200, cost: 90000 },
      { widthCm: 200, depthCm: 200, cost: 100000 },
    ],
    slug: 'ravenna-mattress',
    categorySlug: 'mattresses',
    priceFrom: retailFromCost(42_000),
    widthCm: 90,
    depthCm: 190,
    heightCm: 18,
    customSizeAvailable: true,
    leadTimeDays: 10,
    featured: false,
    fabricSlugs: [],
    name: { hy: 'Ravenna', ru: 'Ravenna', en: 'Ravenna' },
    material: {
      hy: 'Բոնել զսպանակներ, ստանդարտ',
      ru: 'Пружины боннель, стандартный',
      en: 'Bonnell springs, standard',
    },
    desc: {
      hy: 'Ստանդարտ զսպանակավոր ներքնակ՝ ամենօրյա օգտագործման համար։ Առկա է 6 չափսով։',
      ru: 'Стандартный пружинный матрас для повседневного использования. Доступен в 6 размерах.',
      en: 'A standard sprung mattress for everyday use. Available in 6 sizes.',
    },
  },
  {
    // SUPPLIER COST (AMD, mattress only): 90x190 = 60.000 · 140x190 = 90.000 · 160x190 = 100.000 · 180x190 = 110.000 · 200x200 = 120.000
    // Parsed into sizeCosts below — retail is cost * MATTRESS_MARKUP.
    sizeCosts: [
      { widthCm: 90, depthCm: 190, cost: 60000 },
      { widthCm: 140, depthCm: 190, cost: 90000 },
      { widthCm: 160, depthCm: 190, cost: 100000 },
      { widthCm: 180, depthCm: 190, cost: 110000 },
      { widthCm: 200, depthCm: 200, cost: 120000 },
    ],
    slug: 'bergamo-mattress',
    categorySlug: 'mattresses',
    priceFrom: retailFromCost(60_000),
    widthCm: 90,
    depthCm: 190,
    heightCm: 18,
    customSizeAvailable: true,
    leadTimeDays: 10,
    featured: false,
    fabricSlugs: [],
    name: { hy: 'Bergamo', ru: 'Bergamo', en: 'Bergamo' },
    material: {
      hy: 'Բոնել զսպանակներ, ստանդարտ',
      ru: 'Пружины боннель, стандартный',
      en: 'Bonnell springs, standard',
    },
    desc: {
      hy: 'Ստանդարտ զսպանակավոր ներքնակ՝ ամենօրյա օգտագործման համար։ Առկա է 5 չափսով։',
      ru: 'Стандартный пружинный матрас для повседневного использования. Доступен в 5 размерах.',
      en: 'A standard sprung mattress for everyday use. Available in 5 sizes.',
    },
  },
  {
    // SUPPLIER COST (AMD, mattress only): 90x190 = 50.000 · 120x140 = 60.000 · 140x190 = 70.000 · 160x190 = 80.000 · 180x190 = 90.000 · 200x200 = 100.000
    // Parsed into sizeCosts below — retail is cost * MATTRESS_MARKUP.
    sizeCosts: [
      { widthCm: 90, depthCm: 190, cost: 50000 },
      { widthCm: 120, depthCm: 140, cost: 60000 },
      { widthCm: 140, depthCm: 190, cost: 70000 },
      { widthCm: 160, depthCm: 190, cost: 80000 },
      { widthCm: 180, depthCm: 190, cost: 90000 },
      { widthCm: 200, depthCm: 200, cost: 100000 },
    ],
    slug: 'livorno-mattress',
    categorySlug: 'mattresses',
    priceFrom: retailFromCost(50_000),
    widthCm: 90,
    depthCm: 190,
    heightCm: 18,
    customSizeAvailable: true,
    leadTimeDays: 10,
    featured: false,
    fabricSlugs: [],
    name: { hy: 'Livorno', ru: 'Livorno', en: 'Livorno' },
    material: {
      hy: 'Բոնել զսպանակներ, ստանդարտ',
      ru: 'Пружины боннель, стандартный',
      en: 'Bonnell springs, standard',
    },
    desc: {
      hy: 'Ստանդարտ զսպանակավոր ներքնակ՝ ամենօրյա օգտագործման համար։ Առկա է 6 չափսով։',
      ru: 'Стандартный пружинный матрас для повседневного использования. Доступен в 6 размерах.',
      en: 'A standard sprung mattress for everyday use. Available in 6 sizes.',
    },
  },
  {
    // SUPPLIER COST (AMD, mattress only): 90x190 = 30.000 · 120x190 = 35.000 · 140x190 = 40.000 · 160x190 = 45.000 · 180x190 = 50.000 · 190x190 = 55.000 · 200x200 = 60.000
    // Parsed into sizeCosts below — retail is cost * MATTRESS_MARKUP.
    sizeCosts: [
      { widthCm: 90, depthCm: 190, cost: 30000 },
      { widthCm: 120, depthCm: 190, cost: 35000 },
      { widthCm: 140, depthCm: 190, cost: 40000 },
      { widthCm: 160, depthCm: 190, cost: 45000 },
      { widthCm: 180, depthCm: 190, cost: 50000 },
      { widthCm: 190, depthCm: 190, cost: 55000 },
      { widthCm: 200, depthCm: 200, cost: 60000 },
    ],
    slug: 'modena-mattress',
    categorySlug: 'mattresses',
    priceFrom: retailFromCost(30_000),
    widthCm: 90,
    depthCm: 190,
    heightCm: 18,
    customSizeAvailable: true,
    leadTimeDays: 10,
    featured: true,
    fabricSlugs: [],
    name: { hy: 'Modena', ru: 'Modena', en: 'Modena' },
    material: {
      hy: 'Բոնել զսպանակներ, ստանդարտ',
      ru: 'Пружины боннель, стандартный',
      en: 'Bonnell springs, standard',
    },
    desc: {
      hy: 'Ստանդարտ զսպանակավոր ներքնակ՝ ամենօրյա օգտագործման համար։ Առկա է 7 չափսով։',
      ru: 'Стандартный пружинный матрас для повседневного использования. Доступен в 7 размерах.',
      en: 'A standard sprung mattress for everyday use. Available in 7 sizes.',
    },
  },
  {
    // SUPPLIER COST (AMD, mattress only): 90x190 = 65.000 · 120x190 = 90.000 · 140x190 = 100.000 · 160x190 = 110.000 · 180x190 = 120.000 · 200x200 = 140.000
    // Parsed into sizeCosts below — retail is cost * MATTRESS_MARKUP.
    sizeCosts: [
      { widthCm: 90, depthCm: 190, cost: 65000 },
      { widthCm: 120, depthCm: 190, cost: 90000 },
      { widthCm: 140, depthCm: 190, cost: 100000 },
      { widthCm: 160, depthCm: 190, cost: 110000 },
      { widthCm: 180, depthCm: 190, cost: 120000 },
      { widthCm: 200, depthCm: 200, cost: 140000 },
    ],
    slug: 'treviso-mattress',
    categorySlug: 'mattresses',
    priceFrom: retailFromCost(65_000),
    widthCm: 90,
    depthCm: 190,
    heightCm: 18,
    customSizeAvailable: true,
    leadTimeDays: 10,
    featured: false,
    fabricSlugs: [],
    name: { hy: 'Treviso', ru: 'Treviso', en: 'Treviso' },
    material: {
      hy: 'Բոնել զսպանակներ, ստանդարտ',
      ru: 'Пружины боннель, стандартный',
      en: 'Bonnell springs, standard',
    },
    desc: {
      hy: 'Ստանդարտ զսպանակավոր ներքնակ՝ ամենօրյա օգտագործման համար։ Առկա է 6 չափսով։',
      ru: 'Стандартный пружинный матрас для повседневного использования. Доступен в 6 размерах.',
      en: 'A standard sprung mattress for everyday use. Available in 6 sizes.',
    },
  },
  {
    // SUPPLIER COST (AMD, mattress only): 90x190 = 78.000 · 120x190 = 95.000 · 140x190 = 105.000 · 160x190 = 125.000 · 180x190 = 135.000 · 200x200 = 150.000
    // Parsed into sizeCosts below — retail is cost * MATTRESS_MARKUP.
    sizeCosts: [
      { widthCm: 90, depthCm: 190, cost: 78000 },
      { widthCm: 120, depthCm: 190, cost: 95000 },
      { widthCm: 140, depthCm: 190, cost: 105000 },
      { widthCm: 160, depthCm: 190, cost: 125000 },
      { widthCm: 180, depthCm: 190, cost: 135000 },
      { widthCm: 200, depthCm: 200, cost: 150000 },
    ],
    slug: 'lucca-mattress',
    categorySlug: 'mattresses',
    priceFrom: retailFromCost(78_000),
    widthCm: 90,
    depthCm: 190,
    heightCm: 18,
    customSizeAvailable: true,
    leadTimeDays: 10,
    featured: false,
    fabricSlugs: [],
    name: { hy: 'Lucca', ru: 'Lucca', en: 'Lucca' },
    material: {
      hy: 'Բոնել զսպանակներ, ստանդարտ',
      ru: 'Пружины боннель, стандартный',
      en: 'Bonnell springs, standard',
    },
    desc: {
      hy: 'Ստանդարտ զսպանակավոր ներքնակ՝ ամենօրյա օգտագործման համար։ Առկա է 6 չափսով։',
      ru: 'Стандартный пружинный матрас для повседневного использования. Доступен в 6 размерах.',
      en: 'A standard sprung mattress for everyday use. Available in 6 sizes.',
    },
  },
  {
    // SUPPLIER COST (AMD, mattress only): 90x190 = 53.000 · 120x190 = 64.000 · 140x190 = 74.000 · 160x190 = 85.000 · 180x190 = 90.000 · 190x200 = 100.000 · 200x200 = 110.000
    // Parsed into sizeCosts below — retail is cost * MATTRESS_MARKUP.
    sizeCosts: [
      { widthCm: 90, depthCm: 190, cost: 53000 },
      { widthCm: 120, depthCm: 190, cost: 64000 },
      { widthCm: 140, depthCm: 190, cost: 74000 },
      { widthCm: 160, depthCm: 190, cost: 85000 },
      { widthCm: 180, depthCm: 190, cost: 90000 },
      { widthCm: 190, depthCm: 200, cost: 100000 },
      { widthCm: 200, depthCm: 200, cost: 110000 },
    ],
    slug: 'positano-mattress',
    categorySlug: 'mattresses',
    priceFrom: retailFromCost(53_000),
    widthCm: 90,
    depthCm: 190,
    heightCm: 24,
    customSizeAvailable: true,
    leadTimeDays: 14,
    featured: false,
    fabricSlugs: [],
    name: { hy: 'Positano', ru: 'Positano', en: 'Positano' },
    material: {
      hy: 'Գրպանավոր զսպանակներ, օրթոպեդիկ',
      ru: 'Независимые пружины, ортопедический',
      en: 'Pocket springs, orthopedic',
    },
    desc: {
      hy: 'Օրթոպեդիկ ներքնակ՝ անկախ գրպանավոր զսպանակներով, որոնք առանձին են արձագանքում մարմնի յուրաքանչյուր հատվածին։ Առկա է 7 չափսով։',
      ru: 'Ортопедический матрас на независимых пружинах в чехлах — каждая зона реагирует отдельно. Доступен в 7 размерах.',
      en: 'An orthopedic mattress on independently pocketed springs, so each zone responds on its own. Available in 7 sizes.',
    },
  },
];
