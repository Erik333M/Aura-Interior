export interface SeedReview {
  slug: string;
  authorName: string;
  rating: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  body: string;
}

/** A handful of realistic approved/pending reviews so moderation has something to act on. */
export const reviewSeeds: readonly SeedReview[] = [
  {
    slug: 'arev-bed',
    authorName: 'Անի Հ.',
    rating: 5,
    status: 'APPROVED',
    body: 'Պատվիրեցինք մեր չափսերով, ստացանք ուղիղ 4 շաբաթում։ Բուկլեն շատ ավելի խիտ է, քան սպասում էինք։',
  },
  {
    slug: 'arev-bed',
    authorName: 'Karen M.',
    rating: 5,
    status: 'APPROVED',
    body: 'The curved headboard is exactly as shown. They came to measure and installed it themselves.',
  },
  {
    slug: 'arev-bed',
    authorName: 'Мария С.',
    rating: 4,
    status: 'APPROVED',
    body: 'Кровать отличная, единственное — доставка задержалась на несколько дней.',
  },
  {
    slug: 'sevan-bed',
    authorName: 'Davit G.',
    rating: 5,
    status: 'APPROVED',
    body: 'Storage base is enormous and the gas struts feel solid. Worth the lead time.',
  },
  {
    slug: 'sevan-bed',
    authorName: 'Լիլիթ Ա.',
    rating: 5,
    status: 'APPROVED',
    body: 'Ընտրեցինք թավշյա գրաֆիտ գույնը։ Սենյակը ամբողջովին փոխվեց։',
  },
  {
    slug: 'garni-sofa',
    authorName: 'Nune P.',
    rating: 4,
    status: 'APPROVED',
    body: 'Very deep seat — check the depth against your room first. Fabric quality is excellent.',
  },
  {
    slug: 'vardi-pouf',
    authorName: 'Աram T.',
    rating: 5,
    status: 'APPROVED',
    body: 'Small piece, big difference. Ordered two in bouclé sand.',
  },
  {
    slug: 'zvartnots-panel',
    authorName: 'Sona V.',
    rating: 5,
    status: 'APPROVED',
    body: 'They handled measuring, manufacturing and installation. The LED detail is beautiful at night.',
  },
  {
    slug: 'masis-wardrobe',
    authorName: 'Test Pending',
    rating: 3,
    status: 'PENDING',
    body: 'This one is still awaiting moderation — it should not appear on the public site.',
  },
  {
    slug: 'nairi-bed',
    authorName: 'Spam Bot',
    rating: 1,
    status: 'REJECTED',
    body: 'Rejected review, also must never appear publicly.',
  },
] as const;
