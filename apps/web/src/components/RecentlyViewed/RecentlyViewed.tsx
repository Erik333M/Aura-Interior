import { useQuery } from '@tanstack/react-query';
import { useI18n } from '@/i18n';
import { catalogueKeys, fetchProducts } from '@/services/catalogue';
import { recentlyViewedStore } from '@/lib/wishlist';
import { ProductCard } from '@/components/ProductCard';
import styles from './RecentlyViewed.module.scss';

/**
 * Recently viewed pieces, read from localStorage.
 *
 * The slugs are resolved against the catalogue the page has already loaded
 * rather than fetched one-by-one — a strip of five should not cost five
 * requests, and a slug that no longer exists simply drops out.
 */
export function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const { t } = useI18n();
  const slugs = recentlyViewedStore.use().filter((s) => s !== excludeSlug);

  const query = useQuery({
    queryKey: catalogueKeys.products({ pageSize: 60 }),
    queryFn: () => fetchProducts({ pageSize: 60 }),
    staleTime: 5 * 60_000,
    enabled: slugs.length > 0,
  });

  if (slugs.length === 0) return null;

  const bySlug = new Map((query.data?.items ?? []).map((p) => [p.slug, p]));
  const products = slugs
    .map((s) => bySlug.get(s))
    .filter((p) => p !== undefined)
    .slice(0, 6);

  if (products.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="recently-viewed-heading">
      <h2 id="recently-viewed-heading" className={styles.title}>
        {t.recentlyViewed.title}
      </h2>
      <ul className={styles.rail} role="list">
        {products.map((product) => (
          <li key={product.id} className={styles.item}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
