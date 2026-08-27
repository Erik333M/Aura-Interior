import styles from './Reviews.module.scss';

const Star = ({ filled }: { filled: boolean }) => (
  <svg
    viewBox="0 0 20 20"
    width="14"
    height="14"
    aria-hidden="true"
    className={filled ? undefined : styles.starEmpty}
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="1.3"
  >
    <path
      d="M10 2.5l2.35 4.76 5.25.76-3.8 3.7.9 5.23L10 14.48l-4.7 2.47.9-5.23-3.8-3.7 5.25-.76L10 2.5z"
      strokeLinejoin="round"
    />
  </svg>
);

/** Rating as stars. The number is also given as text for screen readers. */
export function Stars({ value, label }: { value: number; label: string }) {
  return (
    <span className={styles.stars} role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} filled={n <= Math.round(value)} />
      ))}
    </span>
  );
}
