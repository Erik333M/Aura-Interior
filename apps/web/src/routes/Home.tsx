import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '@/i18n';
import { catalogueKeys, fetchProducts } from '@/services/catalogue';
import { Reveal } from '@/components/Reveal';
import { SplitText } from '@/components/SplitText';
import { VignetteFollow } from '@/components/VignetteFollow';
import { MagneticButton } from '@/components/MagneticButton';
import { ProductGrid, ProductGridSkeleton } from '@/components/ProductGrid';
import styles from './Home.module.scss';

/**
 * PHASE 5 SCOPE: the hero now carries the full motion treatment — line-split
 * headline, one-shot gold sweep, drifting studio lamp, magnetic CTA.
 *
 * The rest of the Home page (pinned category strip, signature-piece parallax
 * rows, "Made in Yerevan" band, reviews carousel, Instagram strip) is Phase 4
 * and still unbuilt.
 */
export function Home() {
  const { t, path } = useI18n();

  const query = useQuery({
    queryKey: catalogueKeys.products({ pageSize: 4 }),
    queryFn: () => fetchProducts({ pageSize: 4 }),
  });

  return (
    <>
      <section className={styles.hero}>
        <VignetteFollow />

        <div className={styles.heroInner}>
          <Reveal as="p" className={styles.eyebrow} index={0} immediate>
            {t.home.heroEyebrow}
          </Reveal>

          <SplitText as="h1" className={styles.title} text={t.home.heroTitle} immediate />

          <Reveal as="p" className={styles.lead} index={3} immediate>
            {t.home.heroLead}
          </Reveal>

          <Reveal index={5} immediate>
            <MagneticButton as={Link} to={path('/catalogue')} className={styles.cta}>
              {t.nav.catalogue}
            </MagneticButton>
          </Reveal>
        </div>

        <p className={styles.scrollCue} aria-hidden="true">
          <span className={styles.cueLine} />
          {t.home.scrollCue}
        </p>
      </section>

      <section className={styles.section} aria-labelledby="featured-heading">
        <div className={styles.sectionHead}>
          <Reveal as="p" className={styles.eyebrow} index={0}>
            {t.common.madeToOrder}
          </Reveal>
          <SplitText as="h2" id="featured-heading" text={t.catalogue.title} />
        </div>

        {query.isPending && <ProductGridSkeleton count={4} />}
        {query.isError && <p className={styles.status}>{t.common.error}</p>}
        {query.data && <ProductGrid products={query.data.items} />}
      </section>
    </>
  );
}
