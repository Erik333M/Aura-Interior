/**
 * Armenian is the default locale AND the source of truth for the dictionary
 * shape — ru.ts and en.ts are typed against it, so a missing key is a build
 * error rather than a blank string in production.
 */
export const hy = {
  meta: {
    localeName: 'Հայերեն',
    localeShort: 'ՀԱՅ',
    dir: 'ltr',
  },
  nav: {
    catalogue: 'Կատալոգ',
    interiorDesign: 'Ինտերիերի դիզայն',
    about: 'Մեր մասին',
    contact: 'Կապ',
    wishlist: 'Ընտրված',
    menu: 'Մենյու',
    close: 'Փակել',
    skipToContent: 'Անցնել բովանդակությանը',
  },
  common: {
    from: 'սկսած',
    currency: '֏',
    madeToOrder: 'Պատվերով',
    requestPiece: 'Պատվիրել այս կտորը',
    viewAll: 'Տեսնել բոլորը',
    view: 'Դիտել',
    loading: 'Բեռնվում է…',
    leadTime: 'Պատրաստման ժամկետ',
    days: 'օր',
    customSize: 'Հնարավոր է անհատական չափս',
    dimensions: 'Չափսեր',
    materials: 'Նյութեր',
    fabrics: 'Գործվածքներ',
    error: 'Ինչ-որ բան այնպես չգնաց',
    retry: 'Կրկին փորձել',
  },
  theme: {
    toggle: 'Փոխել թեման',
    dark: 'Մուգ',
    light: 'Բաց',
  },
  footer: {
    tagline: 'Պատվերով կահույքի արտադրություն Երևանում',
    madeIn: 'Պատրաստված Երևանում',
    categories: 'Կատեգորիաներ',
    company: 'Ընկերություն',
    contactUs: 'Կապ մեզ հետ',
    rights: 'Բոլոր իրավունքները պաշտպանված են',
    instagramDm: 'Գրել Instagram-ով',
    whatsapp: 'WhatsApp',
  },
  home: {
    heroEyebrow: 'EVN Furniture · Երևան',
    heroTitle: 'Կահույք, որը կարվում է ձեզ համար',
    heroLead:
      'Մենք չունենք պահեստ։ Յուրաքանչյուր կտոր պատրաստվում է պատվերով՝ ձեր գործվածքով, ձեր գույնով, ձեր չափսերով։',
    scrollCue: 'Ոլորել',
  },
  catalogue: {
    title: 'Կատալոգ',
    filters: 'Զտիչներ',
    openFilters: 'Բացել զտիչները',
    closeFilters: 'Փակել զտիչները',
    clearAll: 'Մաքրել բոլորը',
    remove: 'Հեռացնել',
    sort: 'Դասավորել',
    sortFeatured: 'Ընտրված',
    sortPriceAsc: 'Գինը՝ աճման կարգով',
    sortPriceDesc: 'Գինը՝ նվազման կարգով',
    sortNewest: 'Նորերը',
    category: 'Կատեգորիա',
    price: 'Գին',
    fabricType: 'Գործվածքի տեսակ',
    colour: 'Գույն',
    customSizing: 'Անհատական չափս',
    customSizingLabel: 'Միայն անհատական չափսով',
    minPrice: 'Նվազագույն գին',
    maxPrice: 'Առավելագույն գին',
    showResults: 'Ցույց տալ',
    noResults: 'Համընկնումներ չկան',
    noResultsLead: 'Ընտրված զտիչներով կտորներ չգտնվեցին։ Փորձեք ընդլայնել որոնումը։',
    pieces: { one: 'կտոր', few: 'կտոր', many: 'կտոր', other: 'կտոր' },
    fabricBoucle: 'Բուկլե',
    fabricVelvet: 'Թավիշ',
    fabricLinen: 'Կտավատ',
    fabricLeather: 'Կաշի',
    previous: 'Նախորդ',
    next: 'Հաջորդ',
    pageOf: 'Էջ {page} / {total}',
  },
  notFound: {
    title: 'Այս էջը չկա',
    lead: 'Հնարավոր է՝ այն տեղափոխվել է, կամ հասցեն սխալ է մուտքագրվել։',
    cta: 'Վերադառնալ գլխավոր',
  },
};

/**
 * Leaves are widened to `string` — `as const` here would pin every value to its
 * Armenian literal and make ru.ts/en.ts unassignable. The KEY structure is what
 * we want enforced: a missing or misspelled key is a build error.
 */
type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> };
export type Dictionary = Widen<typeof hy>;
