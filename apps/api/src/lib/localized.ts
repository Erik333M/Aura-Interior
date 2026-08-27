import type { Localized } from '@aura/types';

/**
 * The database stores trilingual copy as three sibling columns (nameHy, nameRu,
 * nameEn) so each language stays independently indexable and sortable. The API
 * hands the client a single Localized object instead, and the client picks a
 * language. These helpers are the only place that mapping lives.
 */
export function pack(hy: string, ru: string, en: string): Localized {
  return { hy, ru, en };
}

type Row = Record<string, unknown>;

/** pick(row, 'name') → { hy: row.nameHy, ru: row.nameRu, en: row.nameEn } */
export function pick<P extends string>(row: Row, prefix: P): Localized {
  const cap = prefix.charAt(0).toUpperCase() + prefix.slice(1);
  return {
    hy: String(row[`${prefix}Hy`] ?? row[`${cap}Hy`] ?? ''),
    ru: String(row[`${prefix}Ru`] ?? row[`${cap}Ru`] ?? ''),
    en: String(row[`${prefix}En`] ?? row[`${cap}En`] ?? ''),
  };
}
