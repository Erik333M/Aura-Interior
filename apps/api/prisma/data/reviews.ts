export interface SeedReview {
  slug: string;
  authorName: string;
  rating: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  body: string;
}

/** A handful of realistic approved/pending reviews so moderation has something to act on. */
/**
 * NOTE: `slug` must match a product in products.ts. A rename here is silent —
 * the seed simply skips a review whose product it cannot find, which is how all
 * ten disappeared when the ranges were renamed. The seed now fails loudly
 * instead; see prisma/seed.ts.
 */
export const reviewSeeds: readonly SeedReview[] = [
  {
    slug: 'chelsea-bed',
    authorName: 'Անի Հ.',
    rating: 5,
    status: 'APPROVED',
    body: 'Պատվիրեցինք մեր չափսերով, ստացանք ուղիղ 4 շաբաթում։ Բուկլեն շատ ավելի խիտ է, քան սպասում էինք։',
  },
  {
    slug: 'chelsea-bed',
    authorName: 'Karen M.',
    rating: 5,
    status: 'APPROVED',
    body: 'The curved headboard is exactly as shown. They came to measure and installed it themselves.',
  },
  {
    slug: 'chelsea-bed',
    authorName: 'Мария С.',
    rating: 4,
    status: 'APPROVED',
    body: 'Кровать отличная, единственное — доставка задержалась на несколько дней.',
  },
  {
    slug: 'belmont-bed',
    authorName: 'Davit G.',
    rating: 5,
    status: 'APPROVED',
    body: 'Storage base is enormous and the gas struts feel solid. Worth the lead time.',
  },
  {
    slug: 'belmont-bed',
    authorName: 'Լիլիթ Ա.',
    rating: 5,
    status: 'APPROVED',
    body: 'Ընտրեցինք թավշյա գրաֆիտ գույնը։ Սենյակը ամբողջովին փոխվեց։',
  },
  {
    slug: 'kensington-sofa',
    authorName: 'Nune P.',
    rating: 4,
    status: 'APPROVED',
    body: 'Very deep seat — check the depth against your room first. Fabric quality is excellent.',
  },
  {
    slug: 'sansi-pouf',
    authorName: 'Աram T.',
    rating: 5,
    status: 'APPROVED',
    body: 'Small piece, big difference. Ordered two in bouclé sand.',
  },
  {
    slug: 'regent-panel',
    authorName: 'Sona V.',
    rating: 5,
    status: 'APPROVED',
    body: 'They handled measuring, manufacturing and installation. The LED detail is beautiful at night.',
  },
  {
    slug: 'richmond-wardrobe',
    authorName: 'Test Pending',
    rating: 3,
    status: 'PENDING',
    body: 'This one is still awaiting moderation — it should not appear on the public site.',
  },
  {
    slug: 'elyson-bed',
    authorName: 'Spam Bot',
    rating: 1,
    status: 'REJECTED',
    body: 'Rejected review, also must never appear publicly.',
  },
] as const;
