import type { ReactNode } from 'react';
import { Reveal } from '@/components/Reveal';
import { SplitText } from '@/components/SplitText';
import styles from './PageHero.module.scss';

/** Shared masthead for the secondary pages and the catalogue category header. */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <header className={styles.hero}>
      <span className={styles.glow} aria-hidden="true" />
      <div className={styles.inner}>
        <Reveal as="p" className={styles.eyebrow} immediate>
          {eyebrow}
        </Reveal>
        <SplitText as="h1" className={styles.title} text={title} immediate />
        {lead && (
          <Reveal as="p" className={styles.lead} index={2} immediate>
            {lead}
          </Reveal>
        )}
        {children}
      </div>
    </header>
  );
}
