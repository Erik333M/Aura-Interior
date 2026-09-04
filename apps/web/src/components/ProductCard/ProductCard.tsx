import { Link } from 'react-router-dom';
import type { Product } from '@aura/types';
import { useI18n } from '@/i18n';
import { ResponsiveImage } from '@/components/ResponsiveImage';
import { WishlistButton } from '@/components/WishlistButton';
import { CardZoom } from '@/components/CardZoom';
import styles from './ProductCard.module.scss';

const SIZES = '(min-width: 1280px) 22vw, (min-width: 768px) 30vw, (min-width: 480px) 45vw, 90vw';

export function ProductCard({ product, eager = false }: { product: Product; eager?: boolean }) {
  const { t, tl, price, path } = useI18n();

  const [primary, secondary] = product.images;
  const name = tl(product.name);
  const shown = product.fabrics.slice(0, 5);
  const extra = product.fabrics.length - shown.length;

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {product.featured && <span className={styles.badge}>{t.catalogue.sortFeatured}</span>}
        <WishlistButton slug={product.slug} />
        <CardZoom product={product} />

        {primary && (
          <div className={`${styles.layer} ${styles.primary}`}>
            <ResponsiveImage
              className={styles.imageFill}
              base={primary.url}
              // Alt comes from the localized product name, not the DB's
              // language-neutral fallback, so screen readers match the page.
              alt={name}
              width={primary.width}
              height={primary.height}
              blurhash={primary.blurhash}
              sizes={SIZES}
              priority={eager}
            />
          </div>
        )}

        {/* Second angle, revealed on hover. Decorative: the primary image
            already carries the accessible name. */}
        {secondary && (
          <div className={`${styles.layer} ${styles.secondary}`} aria-hidden="true">
            <ResponsiveImage
              className={styles.imageFill}
              base={secondary.url}
              alt=""
              width={secondary.width}
              height={secondary.height}
              blurhash={secondary.blurhash}
              sizes={SIZES}
            />
          </div>
        )}
      </div>

      <div className={styles.body}>
        {product.category && <p className={styles.eyebrow}>{tl(product.category.name)}</p>}

        <h3 className={styles.name}>
          <Link className={styles.link} to={path(`/catalogue/${product.slug}`)}>
            {name}
          </Link>
        </h3>

        <div className={styles.meta}>
          <span className={styles.price}>{price(product.priceFrom)}</span>
          <span className={styles.lead}>
            {product.leadTimeDays} {t.common.days}
          </span>
        </div>

        {shown.length > 0 && (
          <p className={styles.swatches} aria-label={t.common.fabrics}>
            {shown.map((f) => (
              <span
                key={f.id}
                className={styles.swatch}
                style={{ backgroundColor: f.hex }}
                title={tl(f.name)}
              />
            ))}
            {extra > 0 && <span className={styles.more}>+{extra}</span>}
          </p>
        )}
      </div>
    </article>
  );
}

/** Same box as a real card, so swapping one for the other shifts nothing. */
export function ProductCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.media} />
      <div className={styles.body}>
        <div className={`${styles.ghost} ${styles.ghostEyebrow}`} />
        <div className={`${styles.ghost} ${styles.ghostName}`} />
        <div className={styles.meta}>
          <div className={`${styles.ghost} ${styles.ghostPrice}`} />
        </div>
      </div>
    </div>
  );
}
