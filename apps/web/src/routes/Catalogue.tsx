import { useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { FabricCategory } from '@aura/types';
import { useI18n } from '@/i18n';
import { catalogueKeys, fetchCategories, fetchFabrics, fetchProducts } from '@/services/catalogue';
import { toQuery, useProductFilters } from '@/hooks/useProductFilters';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { FilterSidebar } from '@/components/FilterSidebar';
import { ActiveFilters, type ActivePill } from '@/components/ActiveFilters';
import { ProductGrid, ProductGridSkeleton } from '@/components/ProductGrid';
import { AnimatedCount } from '@/components/AnimatedCount';
import { SortSelect } from '@/components/SortSelect';
import { EmptyState } from '@/components/EmptyState';
import { Pagination } from '@/components/Pagination';
import styles from './Catalogue.module.scss';

const PAGE_SIZE = 12;
/** Long enough to swallow a slider drag, short enough to feel immediate. */
const PRICE_DEBOUNCE_MS = 250;

export function Catalogue() {
  const { t, tl } = useI18n();
  const { filters, activeCount, set, toggle, clearAll } = useProductFilters();

  // The price slider is the one control that fires continuously, so its commit
  // to the URL is debounced. Discrete filters write immediately — a 250ms lag
  // on a checkbox would just feel broken.
  const [pendingPrice, setPendingPrice] = useState<{
    priceMin?: number;
    priceMax?: number;
  } | null>(null);
  const debouncedPrice = useDebouncedValue(pendingPrice, PRICE_DEBOUNCE_MS);

  useEffect(() => {
    if (!debouncedPrice) return;
    // replace:true — dragging a slider should not stack 40 history entries.
    set(debouncedPrice, { replace: true });
    // `set` is recreated whenever the URL changes; depending on it here would
    // re-fire this effect and fight the user's next drag.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPrice]);

  const query = toQuery(filters, PAGE_SIZE);

  const productsQuery = useQuery({
    queryKey: catalogueKeys.products(query),
    queryFn: () => fetchProducts(query),
    // Keeps the previous page mounted while the next is in flight — this is
    // what makes results cross-fade instead of blank-flashing.
    placeholderData: keepPreviousData,
  });

  const categoriesQuery = useQuery({
    queryKey: catalogueKeys.categories(),
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });

  const fabricsQuery = useQuery({
    queryKey: catalogueKeys.fabrics(),
    queryFn: fetchFabrics,
    staleTime: 5 * 60_000,
  });

  // Interior Design is a service — it has no products and must not appear as a
  // permanently-zero filter option.
  const categories = useMemo(
    () => (categoriesQuery.data ?? []).filter((c) => (c.productCount ?? 0) > 0),
    [categoriesQuery.data],
  );
  // Memoised: a fresh [] each render would invalidate the pills memo below.
  const fabrics = useMemo(() => fabricsQuery.data ?? [], [fabricsQuery.data]);
  const facets = productsQuery.data?.facets;
  const total = productsQuery.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pills = useMemo<ActivePill[]>(() => {
    // Built inside the memo so it does not become a new object every render.
    const fabricLabels: Record<FabricCategory, string> = {
      BOUCLE: t.catalogue.fabricBoucle,
      VELVET: t.catalogue.fabricVelvet,
      LINEN: t.catalogue.fabricLinen,
      LEATHER: t.catalogue.fabricLeather,
    };
    const out: ActivePill[] = [];

    for (const slug of filters.categories) {
      const c = categories.find((x) => x.slug === slug);
      out.push({
        key: `cat:${slug}`,
        label: c ? tl(c.name) : slug,
        onRemove: () => toggle('categories', slug),
      });
    }
    for (const value of filters.fabricCategories) {
      out.push({
        key: `type:${value}`,
        label: fabricLabels[value],
        onRemove: () => toggle('fabricCategories', value),
      });
    }
    for (const id of filters.fabrics) {
      const f = fabrics.find((x) => x.id === id);
      out.push({
        key: `fab:${id}`,
        label: f ? tl(f.name) : id,
        ...(f ? { hex: f.hex } : {}),
        onRemove: () => toggle('fabrics', id),
      });
    }
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      const lo = filters.priceMin ?? facets?.price.min ?? 0;
      const hi = filters.priceMax ?? facets?.price.max ?? 0;
      out.push({
        key: 'price',
        label: `${t.catalogue.price}: ${lo.toLocaleString()} – ${hi.toLocaleString()} ֏`,
        onRemove: () => {
          setPendingPrice(null);
          set({ priceMin: undefined, priceMax: undefined });
        },
      });
    }
    if (filters.customSize) {
      out.push({
        key: 'custom',
        label: t.catalogue.customSizing,
        onRemove: () => set({ customSize: false }),
      });
    }
    return out;
  }, [filters, categories, fabrics, facets, tl, t, toggle, set]);

  const handleClearAll = (): void => {
    setPendingPrice(null);
    clearAll();
  };

  const products = productsQuery.data?.items ?? [];
  const firstLoad = productsQuery.isPending;
  const showEmpty = !firstLoad && products.length === 0;

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <p className={styles.eyebrow}>{t.common.madeToOrder}</p>
        <h1>{t.catalogue.title}</h1>
        <p className={styles.lead}>{t.home.heroLead}</p>
      </header>

      <div className={styles.body}>
        <FilterSidebar
          categories={categories}
          fabrics={fabrics}
          facets={facets}
          filters={filters}
          activeCount={activeCount}
          resultCount={total}
          onToggle={toggle}
          onSet={(next) => {
            if ('priceMin' in next || 'priceMax' in next) {
              setPendingPrice({
                ...('priceMin' in next ? { priceMin: next.priceMin } : {}),
                ...('priceMax' in next ? { priceMax: next.priceMax } : {}),
              });
              return;
            }
            set(next);
          }}
          onClearAll={handleClearAll}
        />

        <div className={styles.results}>
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <span className={styles.count}>
                <AnimatedCount value={total} />
              </span>
            </div>
            <SortSelect value={filters.sort} onChange={(sort) => set({ sort })} />
          </div>

          <ActiveFilters pills={pills} onClearAll={handleClearAll} />

          {productsQuery.isError && <p className={styles.error}>{t.common.error}</p>}

          {firstLoad && <ProductGridSkeleton count={PAGE_SIZE} />}

          {showEmpty && (
            <EmptyState
              title={t.catalogue.noResults}
              lead={t.catalogue.noResultsLead}
              actionLabel={activeCount > 0 ? t.catalogue.clearAll : undefined}
              onAction={activeCount > 0 ? handleClearAll : undefined}
            />
          )}

          {!firstLoad && products.length > 0 && (
            <>
              <ProductGrid products={products} isFetching={productsQuery.isFetching} />
              <Pagination
                page={filters.page}
                pageCount={pageCount}
                onChange={(page) => {
                  set({ page });
                  window.scrollTo({ top: 0, behavior: 'auto' });
                }}
                labels={{
                  previous: t.catalogue.previous,
                  next: t.catalogue.next,
                  status: t.catalogue.pageOf
                    .replace('{page}', String(filters.page))
                    .replace('{total}', String(pageCount)),
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
