import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { Product } from '@aura/types';
import { useI18n } from '@/i18n';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ResponsiveImage } from '@/components/ResponsiveImage';
import { Reveal } from '@/components/Reveal';
import styles from './SignatureRows.module.scss';

function ParallaxMedia({ product, alt }: { product: Product; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Track this frame's own progress through the viewport, so each row drifts
  // independently rather than all of them sharing the page's scroll.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);

  const image = product.images[0];
  if (!image) return null;

  return (
    <div ref={ref} className={styles.media}>
      <motion.div className={styles.parallaxInner} style={reduced ? undefined : { y }}>
        <ResponsiveImage
          base={image.url}
          alt={alt}
          width={image.width}
          height={image.height}
          blurhash={image.blurhash}
          sizes="(min-width: 768px) 46vw, 92vw"
        />
      </motion.div>
    </div>
  );
}

/** Three featured pieces as alternating image/text rows with image parallax. */
export function SignatureRows({ products }: { products: Product[] }) {
  const { t, tl, price, path, formatNumber } = useI18n();

  return (
    <section className={styles.section} aria-labelledby="signature-heading">
      <Reveal className={styles.head}>
        <p className={styles.eyebrow}>{t.homeSections.signatureEyebrow}</p>
        <h2 id="signature-heading" className={styles.title}>
          {t.homeSections.signatureTitle}
        </h2>
      </Reveal>

      {products.map((product, i) => {
        const name = tl(product.name);
        return (
          <div key={product.id} className={`${styles.row} ${i % 2 === 1 ? styles.reversed : ''}`}>
            <ParallaxMedia product={product} alt={name} />

            <Reveal className={styles.body} index={1}>
              <span className={styles.index}>{formatNumber(i + 1).padStart(2, '0')}</span>
              <h3 className={styles.name}>{name}</h3>
              <p className={styles.copy}>{tl(product.description)}</p>
              <p className={styles.price}>{price(product.priceFrom)}</p>
              <Link to={path(`/catalogue/${product.slug}`)} className={styles.link}>
                {t.inquiry.cta}
              </Link>
            </Reveal>
          </div>
        );
      })}
    </section>
  );
}
