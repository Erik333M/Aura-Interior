import type { Dimensions } from '@aura/types';

/**
 * Standard sizes offered per category.
 *
 * These live in the frontend rather than the database on purpose: they are
 * presentation defaults, not per-product facts. Every piece is made to order,
 * so the presets exist to save the common customer typing — the custom option
 * is always available and is the actual product.
 *
 * Bed widths are mattress sizes, because that is what a customer already knows
 * and has to buy bedding for. Depth/height come from the piece's own defaults,
 * since a preset should change what the customer chose and nothing else.
 */
export interface SizePreset {
  id: string;
  /** Shown on the chip. */
  label: string;
  /** The dimension the preset actually sets; the rest stay as the product's. */
  widthCm: number;
  depthCm?: number;
  /** Extra context under the label, e.g. "Double". */
  note?: string;
}

const BED: SizePreset[] = [
  { id: '90', label: '90 × 200', widthCm: 90, depthCm: 205, note: 'single' },
  { id: '120', label: '120 × 200', widthCm: 120, depthCm: 205, note: 'small double' },
  { id: '140', label: '140 × 200', widthCm: 140, depthCm: 205, note: 'double' },
  { id: '160', label: '160 × 200', widthCm: 160, depthCm: 210, note: 'queen' },
  { id: '180', label: '180 × 200', widthCm: 180, depthCm: 215, note: 'king' },
  { id: '200', label: '200 × 220', widthCm: 200, depthCm: 220, note: 'super king' },
];

/** Mattress sizes are the supplier's stock sizes, not the bed frame's. */
const MATTRESS: SizePreset[] = [
  { id: '90', label: '90 × 190', widthCm: 90, depthCm: 190, note: 'single' },
  { id: '120', label: '120 × 190', widthCm: 120, depthCm: 190, note: 'small double' },
  { id: '140', label: '140 × 190', widthCm: 140, depthCm: 190, note: 'double' },
  { id: '160', label: '160 × 190', widthCm: 160, depthCm: 190, note: 'queen' },
  { id: '180', label: '180 × 190', widthCm: 180, depthCm: 190, note: 'king' },
  { id: '200', label: '200 × 200', widthCm: 200, depthCm: 200, note: 'super king' },
];

const SOFA: SizePreset[] = [
  { id: '2', label: '2 ', widthCm: 165, note: 'seats' },
  { id: '3', label: '3', widthCm: 220, note: 'seats' },
  { id: '4', label: '4', widthCm: 280, note: 'seats' },
  { id: 'corner', label: 'Corner', widthCm: 320 },
];

const WARDROBE: SizePreset[] = [
  { id: '150', label: '150 cm', widthCm: 150, note: '2 doors' },
  { id: '180', label: '180 cm', widthCm: 180, note: '3 doors' },
  { id: '240', label: '240 cm', widthCm: 240, note: '3 sliding' },
  { id: '320', label: '320 cm', widthCm: 320, note: 'walk-in' },
];

const PANEL: SizePreset[] = [
  { id: '160', label: '160 cm', widthCm: 160 },
  { id: '200', label: '200 cm', widthCm: 200 },
  { id: '280', label: '280 cm', widthCm: 280 },
  { id: '400', label: '400 cm', widthCm: 400, note: 'full wall' },
];

const PRESETS: Record<string, SizePreset[]> = {
  beds: BED,
  mattresses: MATTRESS,
  sofas: SOFA,
  wardrobes: WARDROBE,
  'headboards-panels': PANEL,
};

/** Poufs and ottomans ship in one size; there is nothing to choose. */
export function presetsFor(categorySlug: string | undefined): SizePreset[] {
  return categorySlug ? (PRESETS[categorySlug] ?? []) : [];
}

/** The preset matching a product's own dimensions, if one does. */
export function matchPreset(presets: SizePreset[], dims: Dimensions): SizePreset | undefined {
  return presets.find((p) => p.widthCm === dims.widthCm);
}
