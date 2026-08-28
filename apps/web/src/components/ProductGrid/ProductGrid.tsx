import { AnimatePresence, m } from 'framer-motion';
import type { Product } from '@aura/types';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import styles from './ProductGrid.module.scss';

const STAGGER = 0.055;
/** Past this many cards the stagger stops adding delay and just feels slow. */
const MAX_STAGGERED = 8;

export function ProductGrid({
  products,
  isFetching = false,
  heading,
}: {
  products: Product[];
  isFetching?: boolean;
  /** Names the region for assistive tech. Product names inside the cards are
   *  <h3>, so without an <h2> above them the heading order skips a level. */
  heading?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <>
      {heading && <h2 className="visually-hidden">{heading}</h2>}
      <ul className={`${styles.grid} ${isFetching ? styles.fetching : styles.settled}`} role="list">
        <AnimatePresence mode="popLayout" initial={false}>
          {products.map((product, i) => (
            <m.li
              key={product.id}
              className={styles.item}
              layout={!reduced}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
              whileInView={{
                opacity: 1,
                y: 0,
                transition: {
                  duration: reduced ? 0.15 : 0.55,
                  delay: reduced ? 0 : Math.min(i, MAX_STAGGERED) * STAGGER,
                  ease: [0.16, 1, 0.3, 1],
                },
              }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
              viewport={{ once: true, amount: 0.15 }}
            >
              {/* The first row is above the fold on every breakpoint — load it eagerly. */}
              <ProductCard product={product} eager={i < 4} />
            </m.li>
          ))}
        </AnimatePresence>
      </ul>
    </>
  );
}

/** Rendered only on the very first load, when there is no previous page to keep. */
export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <ul className={styles.grid} role="list" aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className={styles.item}>
          <ProductCardSkeleton />
        </li>
      ))}
    </ul>
  );
}
