import { useQuery } from '@tanstack/react-query';
import { useI18n } from '@/i18n';
import { catalogueKeys, fetchProducts } from '@/services/catalogue';
import { PageHero } from './PageHero';
import { ResponsiveImage } from '@/components/ResponsiveImage';
import { Reveal } from '@/components/Reveal';
import { ContactCta } from '@/components/ContactCta';
import styles from './About.module.scss';

export function About() {
  const { t } = useI18n();

  // Craft detail shots stand in for workshop photography until real images land
  // in media/source/ — see the image pipeline note in the README.
  const products = useQuery({
    queryKey: catalogueKeys.products({ pageSize: 8, sort: 'featured' }),
    queryFn: () => fetchProducts({ pageSize: 8, sort: 'featured' }),
  });

  const tiles = (products.data?.items ?? []).flatMap((p) => p.images).slice(0, 4);

  return (
    <>
      <PageHero eyebrow={t.about.eyebrow} title={t.about.title} lead={t.about.lead} />

      <section className={styles.section}>
        <Reveal className={styles.copy}>
          <p className={styles.paragraph}>{t.about.body1}</p>
          <p className={styles.paragraph}>{t.about.body2}</p>
        </Reveal>

        <Reveal className={styles.media} index={1}>
          <ResponsiveImage
            base="/media/generated/about-workshop"
            alt={t.about.title}
            width={1600}
            height={900}
            sizes="(min-width: 1024px) 46vw, 92vw"
          />
        </Reveal>
      </section>

      {tiles.length > 0 && (
        <section className={styles.craft} aria-labelledby="craft-heading">
          <h2 id="craft-heading" className={styles.craftTitle}>
            {t.about.craftTitle}
          </h2>
          <ul className={styles.craftGrid} role="list">
            {tiles.map((img, i) => (
              <Reveal as="li" key={img.id} className={styles.craftTile} index={i}>
                <ResponsiveImage
                  base={img.url}
                  alt=""
                  width={img.width}
                  height={img.height}
                  blurhash={img.blurhash}
                  sizes="(min-width: 768px) 22vw, 46vw"
                />
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      <ContactCta />
    </>
  );
}
