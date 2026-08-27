import type { ReactNode } from 'react';
import styles from './FilterGroup.module.scss';

export function FilterGroup({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      {children}
    </fieldset>
  );
}

const Tick = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="11" height="11">
    <path
      d="M3.5 8.5l3 3 6-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * A filter option. `count` is how many products this option would yield given
 * every OTHER active filter; zero disables the row rather than hiding it, so
 * the shape of the catalogue stays legible.
 */
export function CheckboxRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}) {
  // Never disable something the user has already selected — they must be able
  // to switch it back off.
  const disabled = count === 0 && !checked;

  return (
    <li>
      <label
        className={`${styles.row} ${checked ? styles.rowChecked : ''} ${
          disabled ? styles.rowDisabled : ''
        }`}
      >
        <input
          className={styles.native}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
        />
        <span className={`${styles.box} ${checked ? styles.boxChecked : ''}`}>
          {checked && <Tick />}
        </span>
        <span className={styles.label}>{label}</span>
        <span className={styles.count}>{count}</span>
      </label>
    </li>
  );
}

export function ColourSwatch({
  hex,
  label,
  count,
  checked,
  onChange,
}: {
  hex: string;
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}) {
  const disabled = count === 0 && !checked;

  return (
    <li className={styles.swatchWrap}>
      <label
        className={`${styles.swatch} ${checked ? styles.swatchChecked : ''} ${
          disabled ? styles.swatchDisabled : ''
        }`}
        style={{ backgroundColor: hex }}
        // The swatch IS the label, so the accessible name has to be spelled out.
        title={`${label} (${count})`}
      >
        <input
          className={styles.native}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          aria-label={`${label} — ${count}`}
        />
        {checked && (
          <span className={styles.tick}>
            <Tick />
          </span>
        )}
      </label>
    </li>
  );
}

export function ToggleRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className={styles.toggleRow}>
      <input className={styles.native} type="checkbox" checked={checked} onChange={onChange} />
      <span className={styles.label}>
        {label} <span className={styles.count}>({count})</span>
      </span>
      <span className={`${styles.switch} ${checked ? styles.switchOn : ''}`} />
    </label>
  );
}
