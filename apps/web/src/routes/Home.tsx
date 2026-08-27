import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { useI18n } from '@/i18n';
import { catalogueKeys, fetchCategories, fetchProducts, fetchProjects } from '@/services/catalogue';
import { fetchReviews, reviewKeys } from '@/services/reviews';
import { Reveal } from '@/components/Reveal';
import { SplitText } from '@/components/SplitText';
import { VignetteFollow } from '@/components/VignetteFollow';
import { MagneticButton } from '@/components/MagneticButton';
import { CategoryStrip } from '@/components/CategoryStrip';
import { SignatureRows } from '@/components/SignatureRows';
import { MadeInYerevan } from '@/components/MadeInYerevan';
import { ProjectShowcase } from '@/components/ProjectShowcase';
import { ReviewsCarousel } from '@/components/ReviewsCarousel';
import { InstagramStrip } from '@/components/InstagramStrip';
import { ContactCta } from '@/components/ContactCta';
import styles from './Home.module.scss';

export function Home() {
  const { t, path } = useI18n();

  // One batch so the page settles in a single pass rather than cascading
  // several independent loading states down the fold.
  const [featured, categories, projects, reviews] = useQueries({
    queries: [
      {
        queryKey: catalogueKeys.products({ sort: 'featured', pageSize: 8 }),
        queryFn: () => fetchProducts({ sort: 'featured', pageSize: 8 }),
      },
      { queryKey: catalogueKeys.categories(), queryFn: fetchCategories, staleTime: 5 * 60_000 },
      { queryKey: catalogueKeys.projects(), queryFn: fetchProjects, staleTime: 5 * 60_000 },
      { queryKey: reviewKeys.list(undefined), queryFn: () => fetchReviews() },
    ],
  });

  const products = featured.data?.items ?? [];
  // Interior Design is a service — it has its own page, not a catalogue tile.
  const productCategories = (categories.data ?? []).filter((c) => (c.productCount ?? 0) > 0);
  const signature = products.filter((p) => p.featured).slice(0, 3);

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

      {productCategories.length > 0 && <CategoryStrip categories={productCategories} />}

      {signature.length > 0 && <SignatureRows products={signature} />}

      <MadeInYerevan productCount={featured.data?.total ?? 0} />

      <ProjectShowcase projects={(projects.data ?? []).slice(0, 3)} />

      <ReviewsCarousel reviews={(reviews.data?.items ?? []).slice(0, 8)} />

      <InstagramStrip fallback={products.slice(0, 6)} />

      <ContactCta />
    </>
  );
}
