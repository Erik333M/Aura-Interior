import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FABRIC_CATEGORIES,
  type Category,
  type Fabric,
  type FabricCategory,
  type ProductFacets,
} from '@aura/types';
import { useI18n } from '@/i18n';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { pauseScroll, resumeScroll } from '@/lib/smoothScroll';
import type { FilterState } from '@/hooks/useProductFilters';
import { FilterGroup, CheckboxRow, ColourSwatch, ToggleRow } from '@/components/FilterGroup';
import { PriceRange } from '@/components/PriceRange';
import styles from './FilterSidebar.module.scss';

export interface FilterSidebarProps {
  categories: Category[];
  fabrics: Fabric[];
  facets: ProductFacets | undefined;
  filters: FilterState;
  activeCount: number;
  resultCount: number;
  onToggle: (key: 'categories' | 'fabricCategories' | 'fabrics', value: string) => void;
  onSet: (next: Partial<FilterState>) => void;
  onClearAll: () => void;
}

export function FilterSidebar(props: FilterSidebarProps) {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Escape closes, the page behind cannot scroll, and focus goes into the
  // drawer on open and back to the trigger on close.
  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    pauseScroll();
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      resumeScroll();
      document.removeEventListener('keydown', onKey);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="filter-drawer"
      >
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
          <path
            d="M1.5 4h13M4 8h8M6.5 12h3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        {t.catalogue.filters}
        {props.activeCount > 0 && <span className={styles.badge}>{props.activeCount}</span>}
      </button>

      <aside className={styles.aside} aria-label={t.catalogue.filters}>
        <Controls {...props} />
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className={styles.scrim}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              id="filter-drawer"
              className={styles.drawer}
              role="dialog"
              aria-modal="true"
              aria-label={t.catalogue.filters}
              initial={reduced ? { opacity: 0 } : { x: '-100%' }}
              animate={reduced ? { opacity: 1 } : { x: 0 }}
              exit={reduced ? { opacity: 0 } : { x: '-100%' }}
              transition={{ duration: reduced ? 0.15 : 0.34, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.drawerHead}>
                <p className={styles.drawerTitle}>{t.catalogue.filters}</p>
                <button
                  ref={closeRef}
                  type="button"
                  className={styles.close}
                  onClick={() => setOpen(false)}
                  aria-label={t.catalogue.closeFilters}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <div className={styles.drawerBody}>
                <Controls {...props} />
              </div>

              <div className={styles.drawerFoot}>
                {props.activeCount > 0 && (
                  <button type="button" className={styles.reset} onClick={props.onClearAll}>
                    {t.catalogue.clearAll}
                  </button>
                )}
                <button type="button" className={styles.apply} onClick={() => setOpen(false)}>
                  {t.catalogue.showResults} · {props.resultCount}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/** The filter controls themselves, rendered identically in the aside and drawer. */
function Controls({
  categories,
  fabrics,
  facets,
  filters,
  onToggle,
  onSet,
}: FilterSidebarProps): ReactNode {
  const { t, tl } = useI18n();

  const FABRIC_LABELS: Record<FabricCategory, string> = {
    BOUCLE: t.catalogue.fabricBoucle,
    VELVET: t.catalogue.fabricVelvet,
    LINEN: t.catalogue.fabricLinen,
    LEATHER: t.catalogue.fabricLeather,
  };

  const categoryCount = (slug: string): number =>
    facets?.categories.find((c) => c.slug === slug)?.count ?? 0;
  const fabricCount = (id: string): number => facets?.fabrics.find((f) => f.id === id)?.count ?? 0;
  const typeCount = (value: FabricCategory): number =>
    facets?.fabricCategories.find((f) => f.value === value)?.count ?? 0;

  return (
    <div className={styles.panel}>
      <FilterGroup legend={t.catalogue.category}>
        <ul className={styles.options} role="list">
          {categories.map((c) => (
            <CheckboxRow
              key={c.id}
              label={tl(c.name)}
              count={categoryCount(c.slug)}
              checked={filters.categories.includes(c.slug)}
              onChange={() => onToggle('categories', c.slug)}
            />
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup legend={t.catalogue.price}>
        {facets && facets.price.max > facets.price.min && (
          <PriceRange
            min={facets.price.min}
            max={facets.price.max}
            valueMin={filters.priceMin}
            valueMax={filters.priceMax}
            histogram={facets.price.histogram}
            onChange={(next) => onSet(next)}
          />
        )}
      </FilterGroup>

      <FilterGroup legend={t.catalogue.fabricType}>
        <ul className={styles.options} role="list">
          {FABRIC_CATEGORIES.map((value) => (
            <CheckboxRow
              key={value}
              label={FABRIC_LABELS[value]}
              count={typeCount(value)}
              checked={filters.fabricCategories.includes(value)}
              onChange={() => onToggle('fabricCategories', value)}
            />
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup legend={t.catalogue.colour}>
        <ul className={styles.swatchList} role="list">
          {fabrics.map((f) => (
            <ColourSwatch
              key={f.id}
              hex={f.hex}
              label={tl(f.name)}
              count={fabricCount(f.id)}
              checked={filters.fabrics.includes(f.id)}
              onChange={() => onToggle('fabrics', f.id)}
            />
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup legend={t.catalogue.customSizing}>
        <ToggleRow
          label={t.catalogue.customSizingLabel}
          count={facets?.customSizeAvailable ?? 0}
          checked={filters.customSize}
          onChange={() => onSet({ customSize: !filters.customSize })}
        />
      </FilterGroup>
    </div>
  );
}
