import styles from './Logo.module.scss';

/**
 * The gold circular mark from the brand's Instagram, rebuilt as inline SVG so
 * it inherits currentColor and stays crisp at any size.
 */
export function Logo({ showWordmark = true }: { showWordmark?: boolean }) {
  return (
    <span className={styles.logo}>
      <svg
        className={styles.mark}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="24" cy="24" r="23" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <circle cx="24" cy="24" r="19" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        {/* An 'A' as an arch — the piece of architecture the brand keeps photographing. */}
        <path
          d="M15.5 32.5 24 15l8.5 17.5"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M19.5 27h9" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>

      {showWordmark && (
        <span className={styles.wordmark}>
          <span className={styles.name}>Aura</span>
          <span className={styles.sub}>EVN Furniture</span>
        </span>
      )}
    </span>
  );
}
