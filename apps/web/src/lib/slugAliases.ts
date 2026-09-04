/**
 * Old product slugs mapped to their current ones.
 *
 * The ranges were renamed from Armenian place names to Latin ones. Anything
 * already shared, bookmarked, messaged on Instagram or picked up by a crawler
 * still points at the old URL, and a 404 on a real product is a lost customer.
 * These redirect permanently to the current slug rather than dying.
 *
 * Keep an entry here whenever a slug changes. It costs nothing and the
 * alternative is a dead link somebody paid to acquire.
 */
export const SLUG_ALIASES: Readonly<Record<string, string>> = {
  // Beds
  'arev-bed': 'chelsea-bed',
  'nairi-bed': 'elyson-bed',
  'sevan-bed': 'belmont-bed',
  'lusine-bed': 'marlowe-bed',
  'ararat-bed': 'devereux-bed',
  'tsirani-bed': 'savoy-bed',

  // Mattresses
  'sipan-mattress': 'bellagio-mattress',
  'aragats-mattress': 'verona-mattress',
  'shirak-mattress': 'siena-mattress',
  'syunik-mattress': 'portofino-mattress',
  'vayk-mattress': 'amalfi-mattress',
  'lori-mattress': 'cortina-mattress',
  'tavush-mattress': 'ravenna-mattress',
  'kotayk-mattress': 'bergamo-mattress',
  'armavir-mattress': 'livorno-mattress',
  'artashat-mattress': 'modena-mattress',
  'goris-mattress': 'treviso-mattress',
  'jermuk-mattress': 'lucca-mattress',
  'sisian-mattress': 'positano-mattress',

  // Sofas
  'garni-sofa': 'kensington-sofa',
  'noravank-sofa': 'hampton-sofa',
  'dilijan-sofa': 'berkeley-sofa',
  'amberd-sofa': 'sloane-sofa',

  // Wardrobes
  'zangak-wardrobe': 'cambridge-wardrobe',
  'masis-wardrobe': 'richmond-wardrobe',
  'areni-wardrobe': 'ashford-wardrobe',
  'tatev-wardrobe': 'waverly-wardrobe',

  // Headboards & panels
  'erebuni-headboard': 'mayfair-headboard',
  'zvartnots-panel': 'regent-panel',

  // Poufs
  'kamar-pouf': 'cherry-pouf',
  'vardi-pouf': 'sansi-pouf',
  'gugark-pouf': 'pearl-pouf',
  'karin-pouf': 'aster-pouf',
  'gugark-ottoman': 'pearl-pouf',
  'karin-ottoman': 'aster-pouf',
};

/** Category slugs that changed too. */
export const CATEGORY_ALIASES: Readonly<Record<string, string>> = {
  'poufs-ottomans': 'soft-seating',
};
