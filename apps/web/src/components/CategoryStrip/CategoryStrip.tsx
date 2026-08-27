import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { Category } from '@aura/types';
import { useI18n } from '@/i18n';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ResponsiveImage } from '@/components/ResponsiveImage';
import styles from './CategoryStrip.module.scss';

/**
 * Horizontal category strip driven by vertical scroll.
 *
 * The section is 280svh tall with a sticky 100svh panel inside it; scrolling
 * through that extra height translates the track sideways. The travel distance
 * is computed from the real rendered width rather than a guess, so adding a
 * seventh category does not silently cut the last card off.
 *
 * Under reduced motion the pin is dropped entirely (see the stylesheet) and the
 * track becomes an ordinary swipeable scroller.
 */
export function CategoryStrip({ categories }: { categories: Category[] }) {
  const { t, tl, path, formatNumber } = useI18n();
  const reduced = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // How far the track must travel to bring its right edge into view. Measured
  // after layout and re-measured on resize — computing it during the first
  // render would read a null ref and pin the travel at zero forever.
  const [distance, setDistance] = useState(0);

  useLayoutEffect(() => {
    if (reduced) return;
    const track = trackRef.current;
    if (!track) return;

    const measure = (): void => {
      setDistance(Math.max(0, track.scrollWidth - window.innerWidth + 32));
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [reduced, categories.length]);

  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="categories-heading">
      <div className={styles.pin}>
        <div className={styles.head}>
          <p className={styles.eyebrow}>{t.homeSections.categoriesEyebrow}</p>
          <h2 id="categories-heading" className={styles.title}>
            {t.homeSections.categoriesTitle}
          </h2>
        </div>

        <motion.div ref={trackRef} className={styles.track} style={reduced ? undefined : { x }}>
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
                  sizes="(min-width: 768px) 420px, 78vw"
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
        </motion.div>
      </div>
    </section>
  );
}
