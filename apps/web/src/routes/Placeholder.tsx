import styles from './Placeholder.module.scss';

/**
 * Honest scaffolding for routes whose real content lands in a later phase.
 * Deliberately states which phase builds it, so nothing here can be mistaken
 * for a finished page.
 */
export function Placeholder({
  eyebrow,
  title,
  note,
  phase,
}: {
  eyebrow: string;
  title: string;
  note: string;
  phase: string;
}) {
  return (
    <div className={styles.wrap}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1>{title}</h1>
      <p className={styles.note}>{note}</p>
      <span className={styles.phase}>{phase}</span>
    </div>
  );
}
