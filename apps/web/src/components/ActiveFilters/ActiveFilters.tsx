import { AnimatePresence, m } from 'framer-motion';
import { useI18n } from '@/i18n';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import styles from './ActiveFilters.module.scss';

export interface ActivePill {
  /** Stable identity so AnimatePresence can animate the right pill out. */
  key: string;
  label: string;
  /** Present for colour pills — renders the swatch instead of a bare label. */
  hex?: string;
  onRemove: () => void;
}

export function ActiveFilters({
  pills,
  onClearAll,
}: {
  pills: ActivePill[];
  onClearAll: () => void;
}) {
  const { t } = useI18n();
  const reduced = useReducedMotion();

  if (pills.length === 0) return null;

  return (
    <ul className={styles.wrap} role="list">
      <AnimatePresence initial={false} mode="popLayout">
        {pills.map((pill) => (
          <m.li
            key={pill.key}
            layout={!reduced}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: reduced ? 0.12 : 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <button type="button" className={styles.pill} onClick={pill.onRemove}>
              {pill.hex && (
                <span
                  className={styles.dot}
                  style={{ backgroundColor: pill.hex }}
                  aria-hidden="true"
                />
              )}
              <span>{pill.label}</span>
              {/* The visible label already names the filter, so the button's
                  accessible name spells out the action performed on it. */}
              <span className={styles.x} aria-hidden="true">
                <svg viewBox="0 0 16 16" width="9" height="9" fill="none">
                  <path
                    d="M3 3l10 10M13 3L3 13"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="visually-hidden">{`${t.catalogue.remove}: ${pill.label}`}</span>
            </button>
          </m.li>
        ))}
      </AnimatePresence>

      {pills.length > 1 && (
        <li>
          <button type="button" className={styles.clear} onClick={onClearAll}>
            {t.catalogue.clearAll}
          </button>
        </li>
      )}
    </ul>
  );
}
