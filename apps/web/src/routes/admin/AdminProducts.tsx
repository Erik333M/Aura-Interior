import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@/i18n';
import {
  adminKeys,
  deleteProduct,
  fetchAdminProducts,
  uploadProductImages,
} from '@/services/admin';
import { ApiRequestError } from '@/services/client';
import { ResponsiveImage } from '@/components/ResponsiveImage';
import styles from './Admin.module.scss';

/**
 * Product list with inline image upload and delete.
 *
 * Creating and editing full trilingual product copy is a large form; the API
 * supports it (POST/PUT /api/admin/products) but the UI here covers the two
 * operations the workshop actually performs day to day — adding photographs to
 * an existing piece, and removing a piece.
 */
export function AdminProducts() {
  const { t, tl, price } = useI18n();
  const qc = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const query = useQuery({ queryKey: adminKeys.products(), queryFn: fetchAdminProducts });

  const invalidate = (): void => {
    void qc.invalidateQueries({ queryKey: ['admin'] });
    void qc.invalidateQueries({ queryKey: ['products'] });
    void qc.invalidateQueries({ queryKey: ['product'] });
  };

  const uploadMutation = useMutation({
    mutationFn: ({ id, files }: { id: string; files: File[] }) => uploadProductImages(id, files),
    onSuccess: invalidate,
    onError: (err: unknown) =>
      setError(err instanceof ApiRequestError ? err.message : t.common.error),
    onSettled: () => setBusyId(null),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: invalidate,
    onError: (err: unknown) =>
      setError(err instanceof ApiRequestError ? err.message : t.common.error),
  });

  const items = query.data?.items ?? [];
  if (query.isPending) return <p className={styles.muted}>{t.common.loading}</p>;

  return (
    <>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th />
              <th>{t.inquiry.piece}</th>
              <th>{t.catalogue.category}</th>
              <th>{t.catalogue.price}</th>
              <th>{t.common.fabrics}</th>
              <th>{t.admin.uploadImages}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((product) => {
              const cover = product.images[0];
              return (
                <tr key={product.id}>
                  <td>
                    {cover && (
                      <span className={styles.thumbCell}>
                        <ResponsiveImage
                          base={cover.url}
                          alt=""
                          width={cover.width}
                          height={cover.height}
                          sizes="52px"
                        />
                      </span>
                    )}
                  </td>
                  <td>
                    <div>{tl(product.name)}</div>
                    <div className={styles.muted}>{product.slug}</div>
                    {product.featured && <span className={styles.pill}>featured</span>}
                  </td>
                  <td className={styles.muted}>
                    {product.category ? tl(product.category.name) : '—'}
                  </td>
                  <td className={styles.num}>{price(product.priceFrom, false)}</td>
                  <td className={styles.num}>{product.fabrics.length}</td>
                  <td>
                    <div className={styles.uploadRow}>
                      <input
                        ref={(el) => {
                          fileInputs.current[product.id] = el;
                        }}
                        className={styles.fileInput}
                        type="file"
                        accept="image/*"
                        multiple
                        aria-label={`${t.admin.uploadImages}: ${tl(product.name)}`}
                        onChange={(e) => {
                          const files = Array.from(e.target.files ?? []);
                          if (files.length === 0) return;
                          setError(null);
                          setBusyId(product.id);
                          uploadMutation.mutate({ id: product.id, files });
                          e.target.value = '';
                        }}
                      />
                      {busyId === product.id && (
                        <span className={styles.muted}>{t.inquiry.sending}</span>
                      )}
                    </div>
                    <div className={styles.muted}>
                      {product.images.length} {t.product.gallery.toLowerCase()}
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`${styles.action} ${styles.reject}`}
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (window.confirm(t.admin.confirmDelete)) {
                          setError(null);
                          deleteMutation.mutate(product.id);
                        }
                      }}
                    >
                      {t.admin.delete}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
