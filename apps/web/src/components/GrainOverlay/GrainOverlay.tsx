import styles from './GrainOverlay.module.scss';

/** Decorative only — hidden from assistive tech, never intercepts pointer events. */
export function GrainOverlay() {
  return <div className={styles.grain} aria-hidden="true" />;
}
