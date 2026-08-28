import { Link } from 'react-router-dom';
import type { Category } from '@aura/types';
import { useI18n } from '@/i18n';
import { ResponsiveImage } from '@/components/ResponsiveImage';
import styles from './CategoryStrip.module.scss';

/**
 * Horizontal category rail.
 *
 * This used to be pinned and driven by vertical scroll (a 280svh section with a
 * sticky panel). It was removed on purpose: scroll-jacking makes a downward
 * gesture move content sideways, which fights what the reader asked for and
 * makes the page feel stuck. The rail now scrolls horizontally only when it is
 * scrolled horizontally — trackpad, shift+wheel, swipe, or arrow keys once
 * focused — and the page scrolls down when you scroll down.
 */
export function CategoryStrip({ categories }: { categories: Category[] }) {
  const { t, tl, path, formatNumber } = useI18n();

  return (
    <section className={styles.section} aria-labelledby="categories-heading">
      <div className={styles.head}>
        <p className={styles.eyebrow}>{t.homeSections.categoriesEyebrow}</p>
        <h2 id="categories-heading" className={styles.title}>
          {t.homeSections.categoriesTitle}
        </h2>
      </div>

      <div className={styles.track}>
        {categories.map((c) => (
          <Link
            key={c.id}
            to={`${path('/catalogue')}?categories=${c.slug}`}
            className={styles.card}
          >
            {c.heroImage && (
              <ResponsiveImage
                className={styles.image}
                base={c.heroImage}
                alt=""
                width={1600}
                height={900}
                sizes="(min-width: 768px) 380px, 78vw"
              />
            )}
            <span className={styles.overlay}>
              <span className={styles.cardTitle}>{tl(c.name)}</span>
              {c.productCount !== undefined && c.productCount > 0 && (
                <span className={styles.cardCount}>
                  {formatNumber(c.productCount)} · {t.common.madeToOrder}
                </span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
