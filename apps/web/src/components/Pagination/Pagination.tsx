import styles from './Pagination.module.scss';

export function Pagination({
  page,
  pageCount,
  onChange,
  labels,
}: {
  page: number;
  pageCount: number;
  onChange: (next: number) => void;
  labels: { previous: string; next: string; status: string };
}) {
  if (pageCount <= 1) return null;

  return (
    <nav className={styles.wrap} aria-label={labels.status}>
      <button
        type="button"
        className={styles.button}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <svg viewBox="0 0 12 12" width="10" height="10" fill="none" aria-hidden="true">
          <path
            d="M7.5 2.5L4 6l3.5 3.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        {labels.previous}
      </button>

      <span className={styles.status} aria-live="polite">
        {labels.status}
      </span>

      <button
        type="button"
        className={styles.button}
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
      >
        {labels.next}
        <svg viewBox="0 0 12 12" width="10" height="10" fill="none" aria-hidden="true">
          <path
            d="M4.5 2.5L8 6l-3.5 3.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </nav>
  );
}
