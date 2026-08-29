import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { Fabric } from '@aura/types';
import { useI18n } from '@/i18n';
import { catalogueKeys, fetchProduct, fetchProducts } from '@/services/catalogue';
import { Gallery } from '@/components/Gallery';
import { Configurator, type Configuration } from '@/components/Configurator';
import { describeConfiguration } from '@/lib/describeConfiguration';
import { presetsFor, matchPreset } from '@/lib/sizes';
import { Modal } from '@/components/Modal';
import { InquiryForm } from '@/components/InquiryForm';
import { MagneticButton } from '@/components/MagneticButton';
import { Reviews } from '@/components/Reviews';
import { ProductGrid } from '@/components/ProductGrid';
import { Skeleton } from '@/components/Skeleton';
import { WishlistButton } from '@/components/WishlistButton';
import { RecentlyViewed } from '@/components/RecentlyViewed';
import { Seo } from '@/components/Seo';
import { recentlyViewedStore } from '@/lib/wishlist';
import { track } from '@/lib/analytics';
import { breadcrumbLd, productLd } from '@/lib/jsonld';
import { NotFound } from './NotFound';
import styles from './ProductDetail.module.scss';

const INSTAGRAM = import.meta.env['VITE_INSTAGRAM_HANDLE'] ?? 'aura_Interior';

export function ProductDetail() {
  const { slug } = useParams();
  const { t, tl, price, path, locale } = useI18n();

  const [config, setConfig] = useState<Configuration | null>(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const query = useQuery({
    queryKey: catalogueKeys.product(slug ?? ''),
    queryFn: () => fetchProduct(slug ?? ''),
    enabled: Boolean(slug),
    retry: false,
  });

  const product = query.data;

  // Record the view for the "recently viewed" strip on other product pages.
  useEffect(() => {
    if (!product) return;
    recentlyViewedStore.push(product.slug);
    track('product_viewed', { slug: product.slug, price: product.priceFrom });
  }, [product]);

  // Seed the configuration from the product's own defaults, matching a standard
  // size where one fits, so the page opens on a valid, buildable spec rather
  // than an empty form.
  const configuration: Configuration | null = useMemo(() => {
    if (!product) return null;
    if (config) return config;
    const preset = matchPreset(presetsFor(product.category?.slug), product.dimensions);
    return {
      sizeId: preset?.id ?? 'custom',
      widthCm: product.dimensions.widthCm,
      depthCm: product.dimensions.depthCm,
      heightCm: product.dimensions.heightCm,
      fabricId: product.fabrics[0]?.id ?? null,
    };
  }, [product, config]);

  const selectedFabric: Fabric | undefined = useMemo(() => {
    if (!product) return undefined;
    return product.fabrics.find((f) => f.id === configuration?.fabricId) ?? product.fabrics[0];
  }, [product, configuration]);

  const related = useQuery({
    queryKey: catalogueKeys.products({
      categories: product?.category ? [product.category.slug] : [],
      pageSize: 5,
    }),
    queryFn: () =>
      fetchProducts({
        categories: product?.category ? [product.category.slug] : [],
        pageSize: 5,
      }),
    enabled: Boolean(product?.category),
  });

  if (query.isError) return <NotFound />;

  if (query.isPending) {
    return (
      <div className={styles.page}>
        <div className={styles.layout}>
          <Skeleton aspectRatio="4 / 5" />
          <div>
            <Skeleton height="52px" width="70%" />
          </div>
        </div>
      </div>
    );
  }
  if (!product) return <NotFound />;

  const name = tl(product.name);

  // Exclude the piece being viewed from its own "you may also like".
  const alsoLike = (related.data?.items ?? []).filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className={styles.page}>
      <Seo
        title={`${name} — ${price(product.priceFrom)} | Aura Interior`}
        description={`${tl(product.description)} ${t.seo.productDescSuffix}`}
        type="product"
        {...(product.images[0] ? { image: product.images[0].url } : {})}
        jsonLd={[
          productLd(product, locale, product.rating),
          breadcrumbLd([
            { name: t.nav.catalogue, path: path('/catalogue') },
            ...(product.category
              ? [
                  {
                    name: tl(product.category.name),
                    path: `${path('/catalogue')}?categories=${product.category.slug}`,
                  },
                ]
              : []),
            { name, path: path(`/catalogue/${product.slug}`) },
          ]),
        ]}
      />

      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link to={path('/catalogue')} className={styles.crumbLink}>
          {t.nav.catalogue}
        </Link>
        <span aria-hidden="true">/</span>
        {product.category && (
          <>
            <Link
              to={`${path('/catalogue')}?categories=${product.category.slug}`}
              className={styles.crumbLink}
            >
              {tl(product.category.name)}
            </Link>
            <span aria-hidden="true">/</span>
          </>
        )}
        <span aria-current="page">{name}</span>
      </nav>

      <div className={styles.layout}>
        <Gallery images={product.images} alt={name} />

        <div className={styles.detail}>
          {product.category && <p className={styles.eyebrow}>{tl(product.category.name)}</p>}
          <h1 className={styles.title}>{name}</h1>

          <div className={styles.priceRow}>
            <span className={styles.price}>{price(product.priceFrom)}</span>
            <span className={styles.madeToOrder}>{t.common.madeToOrder}</span>
          </div>

          <p className={styles.description}>{tl(product.description)}</p>

          {/* A mattress has no fabric or colour choice — promising one here
              would contradict the configurator directly below it. */}
          <p className={styles.note}>
            {product.fabrics.length > 0
              ? t.product.madeToOrderNote
              : t.product.madeToOrderNoteSizeOnly}
          </p>

          {configuration && (
            <Configurator product={product} value={configuration} onChange={setConfig} />
          )}

          <dl className={styles.specs}>
            <div className={styles.specRow}>
              <dt className={styles.specKey}>{t.product.material}</dt>
              <dd className={styles.specValue}>{tl(product.defaultMaterial)}</dd>
            </div>
            <div className={styles.specRow}>
              <dt className={styles.specKey}>{t.product.customSize}</dt>
              <dd className={styles.specValue}>
                {product.customSizeAvailable ? t.product.customSizeYes : t.product.customSizeNo}
              </dd>
            </div>
          </dl>

          <div className={styles.ctaRow}>
            <MagneticButton
              as="button"
              type="button"
              className={styles.cta}
              onClick={() => {
                track('inquiry_opened', { slug: product.slug });
                setInquiryOpen(true);
              }}
            >
              {t.inquiry.cta}
            </MagneticButton>
            <WishlistButton slug={product.slug} variant="inline" />
          </div>

          {/* Instagram DM on every product — customers already order this way,
              and arriving with the piece named saves them typing it. */}
          <a
            className={styles.dmLink}
            href={`https://ig.me/m/${INSTAGRAM}`}
            target="_blank"
            rel="noreferrer noopener"
            onClick={() => track('instagram_clicked', { slug: product.slug })}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
            </svg>
            {t.footer.instagramDm}
          </a>
        </div>
      </div>

      <section className={styles.section} aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className={styles.sectionTitle}>
          {t.reviews.title}
        </h2>
        <Reviews productId={product.id} />
      </section>

      {alsoLike.length > 0 && (
        <section className={styles.section} aria-labelledby="also-heading">
          <h2 id="also-heading" className={styles.sectionTitle}>
            {t.product.alsoLike}
          </h2>
          <ProductGrid products={alsoLike} />
        </section>
      )}

      <RecentlyViewed excludeSlug={product.slug} />

      <Modal
        open={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        title={t.inquiry.title}
        subtitle={t.inquiry.subtitle}
        closeLabel={t.inquiry.close}
      >
        <InquiryForm
          product={{ id: product.id, name: product.name }}
          {...(selectedFabric ? { fabric: selectedFabric } : {})}
          {...(configuration
            ? {
                initialDimensions: `${configuration.widthCm} × ${configuration.depthCm} × ${configuration.heightCm} ${t.configurator.cm}`,
                initialMessage: describeConfiguration(
                  configuration,
                  selectedFabric ? tl(selectedFabric.name) : undefined,
                  {
                    size: t.configurator.size,
                    fabric: t.configurator.fabric,
                    cm: t.configurator.cm,
                  },
                ),
              }
            : {})}
        />
      </Modal>
    </div>
  );
}
