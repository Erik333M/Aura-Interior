import { GrainOverlay } from '@/components/GrainOverlay';
import { SkipLink } from '@/components/SkipLink';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PageTransition } from '@/components/PageTransition';
import styles from './Layout.module.scss';

/** The persistent chrome. Only the contents of <main> change between routes. */
export function Layout() {
  return (
    <div className={styles.shell}>
      <SkipLink />
      <GrainOverlay />
      <Header />
      {/* tabIndex -1 makes the skip link's target focusable */}
      <main id="main" className={styles.main} tabIndex={-1}>
        <PageTransition />
      </main>
      <Footer />
    </div>
  );
}
