import { PRODUCT_SORTS, type ProductSort } from '@aura/types';
import { useI18n } from '@/i18n';
import styles from './SortSelect.module.scss';

/**
 * A native <select>. Deliberately not a custom listbox: the platform control
 * already gives keyboard support, type-ahead, and a touch-friendly picker on
 * mobile, none of which is worth re-implementing for four options.
 */
export function SortSelect({
  value,
  onChange,
}: {
  value: ProductSort;
  onChange: (next: ProductSort) => void;
}) {
  const { t } = useI18n();

  const LABELS: Record<ProductSort, string> = {
    featured: t.catalogue.sortFeatured,
    'price-asc': t.catalogue.sortPriceAsc,
    'price-desc': t.catalogue.sortPriceDesc,
    newest: t.catalogue.sortNewest,
  };

  return (
    <span className={styles.wrap}>
      <select
        className={styles.select}
        value={value}
        aria-label={t.catalogue.sort}
        onChange={(e) => onChange(e.target.value as ProductSort)}
      >
        {PRODUCT_SORTS.map((s) => (
          <option key={s} value={s}>
            {LABELS[s]}
          </option>
        ))}
      </select>
      <svg className={styles.chevron} viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M2.5 4.5L6 8l3.5-3.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
