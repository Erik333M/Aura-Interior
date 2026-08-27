import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import styles from './Field.module.scss';

interface Common {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  optionalLabel?: string | undefined;
}

/**
 * Label above the input, always visible — never a placeholder standing in for a
 * label. Errors render inline beneath the field they belong to and are wired
 * with aria-describedby + aria-invalid.
 */
export function Field({
  label,
  error,
  hint,
  optionalLabel,
  ...props
}: Common & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {optionalLabel && <span className={styles.optional}> {optionalLabel}</span>}
      </label>
      <input
        id={id}
        className={`${styles.control} ${error ? styles.invalid : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
            <path
              d="M8 5v4M8 11h.01"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export function TextareaField({
  label,
  error,
  hint,
  ...props
}: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        className={`${styles.control} ${styles.textarea} ${error ? styles.invalid : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {hint && !error && <p className={styles.hint}>{hint}</p>}
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

/** Bot bait. Kept out of the tab order and hidden from assistive tech. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className={styles.honeypot} aria-hidden="true">
      <label htmlFor="website-url">Website</label>
      <input
        id="website-url"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
