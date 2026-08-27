import styles from './EmptyState.module.scss';

export function EmptyState({
  title,
  lead,
  actionLabel,
  onAction,
}: {
  title: string;
  lead: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className={styles.wrap}>
      <svg className={styles.mark} viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="21" cy="21" r="13" stroke="currentColor" strokeWidth="1.5" />
        <path d="M31 31l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 21h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <p className={styles.title}>{title}</p>
      <p className={styles.lead}>{lead}</p>
      {actionLabel && onAction && (
        <button type="button" className={styles.action} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
