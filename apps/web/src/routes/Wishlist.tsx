import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '@/i18n';
import { catalogueKeys, fetchProducts } from '@/services/catalogue';
import { useWishlist } from '@/lib/wishlist';
import { track } from '@/lib/analytics';
import { Seo } from '@/components/Seo';
import { ProductGrid, ProductGridSkeleton } from '@/components/ProductGrid';
import { EmptyState } from '@/components/EmptyState';
import { Modal } from '@/components/Modal';
import { InquiryForm } from '@/components/InquiryForm';
import styles from './Wishlist.module.scss';

export function Wishlist() {
  const { t, tl, path, formatNumber } = useI18n();
  const slugs = useWishlist();
  const [bulkOpen, setBulkOpen] = useState(false);

  const query = useQuery({
    queryKey: catalogueKeys.products({ pageSize: 60 }),
    queryFn: () => fetchProducts({ pageSize: 60 }),
    staleTime: 5 * 60_000,
    enabled: slugs.length > 0,
  });

  const products = useMemo(() => {
    const bySlug = new Map((query.data?.items ?? []).map((p) => [p.slug, p]));
    return slugs.map((s) => bySlug.get(s)).filter((p) => p !== undefined);
  }, [slugs, query.data]);

  // The bulk enquiry is one message listing every saved piece — far more useful
  // to the workshop than several separate enquiries arriving at once.
  const bulkMessage = useMemo(
    () =>
      products.length === 0
        ? ''
        : `${t.wishlist.requestAllTitle}:\n\n${products
            .map((p, i) => `${i + 1}. ${tl(p.name)} — ${p.slug}`)
            .join('\n')}`,
    [products, t, tl],
  );

  return (
    <div className={styles.page}>
      {/* A personal list has no business being indexed. */}
      <Seo title={t.seo.wishlistTitle} description={t.seo.wishlistDesc} noindex />

      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>{t.common.madeToOrder}</p>
          <h1 className={styles.title}>{t.wishlist.title}</h1>
          {slugs.length > 0 && (
            <p className={styles.count}>
              {formatNumber(slugs.length)} {t.wishlist.count}
            </p>
          )}
        </div>

        {products.length > 0 && (
          <button
            type="button"
            className={styles.requestAll}
            onClick={() => {
              track('wishlist_bulk_inquiry', { count: products.length });
              setBulkOpen(true);
            }}
          >
            {t.wishlist.requestAll}
          </button>
        )}
      </header>

      {slugs.length === 0 && <EmptyState title={t.wishlist.empty} lead={t.wishlist.emptyLead} />}

      {slugs.length > 0 && query.isPending && <ProductGridSkeleton count={slugs.length} />}

      {products.length > 0 && <ProductGrid products={products} heading={t.wishlist.title} />}

      {slugs.length > 0 && !query.isPending && products.length === 0 && (
        <EmptyState title={t.catalogue.noResults} lead={t.wishlist.emptyLead} />
      )}

      {slugs.length === 0 && (
        <p>
          <Link to={path('/catalogue')}>{t.wishlist.browse}</Link>
        </p>
      )}

      <Modal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title={t.wishlist.requestAllTitle}
        subtitle={t.inquiry.subtitle}
        closeLabel={t.inquiry.close}
      >
        <InquiryForm initialMessage={bulkMessage} />
      </Modal>
    </div>
  );
}
