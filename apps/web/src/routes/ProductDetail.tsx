import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { Fabric } from '@aura/types';
import { useI18n } from '@/i18n';
import { catalogueKeys, fetchProduct, fetchProducts } from '@/services/catalogue';
import { Gallery } from '@/components/Gallery';
import { Modal } from '@/components/Modal';
import { InquiryForm } from '@/components/InquiryForm';
import { MagneticButton } from '@/components/MagneticButton';
import { Reviews } from '@/components/Reviews';
import { ProductGrid } from '@/components/ProductGrid';
import { Skeleton } from '@/components/Skeleton';
import { NotFound } from './NotFound';
import styles from './ProductDetail.module.scss';

export function ProductDetail() {
  const { slug } = useParams();
  const { t, tl, price, path, formatNumber } = useI18n();

  const [fabricId, setFabricId] = useState<string | null>(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const query = useQuery({
    queryKey: catalogueKeys.product(slug ?? ''),
    queryFn: () => fetchProduct(slug ?? ''),
    enabled: Boolean(slug),
    retry: false,
  });

  const product = query.data;

  // Default to the first available fabric so the enquiry always carries one.
  const selectedFabric: Fabric | undefined = useMemo(() => {
    if (!product) return undefined;
    return product.fabrics.find((f) => f.id === fabricId) ?? product.fabrics[0];
  }, [product, fabricId]);

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
  const { widthCm, depthCm, heightCm } = product.dimensions;

  // Exclude the piece being viewed from its own "you may also like".
  const alsoLike = (related.data?.items ?? []).filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className={styles.page}>
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

          <p className={styles.note}>{t.product.madeToOrderNote}</p>

          {product.fabrics.length > 0 && (
            <fieldset className={styles.fabrics}>
              <legend className={styles.fabricsLegend}>{t.product.chooseFabric}</legend>
              <ul className={styles.swatchRow} role="list">
                {product.fabrics.map((f) => {
                  const checked = selectedFabric?.id === f.id;
                  return (
                    <li key={f.id}>
                      <input
                        className={styles.swatchInput}
                        type="radio"
                        name="fabric"
                        id={`fabric-${f.id}`}
                        checked={checked}
                        onChange={() => setFabricId(f.id)}
                      />
                      <label
                        htmlFor={`fabric-${f.id}`}
                        className={`${styles.swatchLabel} ${checked ? styles.swatchSelected : ''}`}
                        style={{ backgroundColor: f.hex }}
                        title={tl(f.name)}
                      >
                        <span className="visually-hidden">{tl(f.name)}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              {selectedFabric && (
                <p className={styles.selectedName}>
                  <span className={styles.selectedNameLabel}>{t.product.selectedFabric}: </span>
                  {tl(selectedFabric.name)}
                </p>
              )}
            </fieldset>
          )}

          <dl className={styles.specs}>
            <div className={styles.specRow}>
              <dt className={styles.specKey}>{t.product.dimensions}</dt>
              <dd className={styles.specValue}>
                {formatNumber(widthCm)} × {formatNumber(depthCm)} × {formatNumber(heightCm)} cm
              </dd>
            </div>
            <div className={styles.specRow}>
              <dt className={styles.specKey}>{t.product.material}</dt>
              <dd className={styles.specValue}>{tl(product.defaultMaterial)}</dd>
            </div>
            <div className={styles.specRow}>
              <dt className={styles.specKey}>{t.product.leadTime}</dt>
              <dd className={styles.specValue}>
                {product.leadTimeDays} {t.common.days}
              </dd>
            </div>
            <div className={styles.specRow}>
              <dt className={styles.specKey}>{t.product.customSize}</dt>
              <dd className={styles.specValue}>
                {product.customSizeAvailable ? t.product.customSizeYes : t.product.customSizeNo}
              </dd>
            </div>
          </dl>

          <MagneticButton
            as="button"
            type="button"
            className={styles.cta}
            onClick={() => setInquiryOpen(true)}
          >
            {t.inquiry.cta}
          </MagneticButton>
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
        />
      </Modal>
    </div>
  );
}
