import { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@/i18n';
import { adminKeys, fetchStats, me, readToken, writeToken } from '@/services/admin';
import { AdminLogin } from './AdminLogin';
import { AdminInquiries } from './AdminInquiries';
import { AdminReviews } from './AdminReviews';
import { AdminProducts } from './AdminProducts';
import { AdminFabrics } from './AdminFabrics';
import styles from './Admin.module.scss';

type Tab = 'inquiries' | 'reviews' | 'products' | 'fabrics';

/**
 * The admin shell. Deliberately outside the marketing site's Layout: no grain,
 * no smooth scroll, no custom cursor. It is a tool, and the motion layer would
 * only get in the way of scanning tables.
 */
export function AdminPage() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [tokenPresent, setTokenPresent] = useState(() => readToken() !== null);
  const [tab, setTab] = useState<Tab>('inquiries');

  // Validate any stored token against the API rather than trusting its presence
  // — it may have expired since the last visit.
  const session = useQuery({
    queryKey: adminKeys.me(),
    queryFn: me,
    enabled: tokenPresent,
    retry: false,
  });

  // Effects are for syncing external systems; clearing a dead token from
  // localStorage is exactly that. The auth state itself is DERIVED below rather
  // than mirrored into state, so there is no second copy to fall out of sync.
  useEffect(() => {
    if (session.isError) writeToken(null);
  }, [session.isError]);

  const authed: boolean | null = !tokenPresent
    ? false
    : session.isSuccess
      ? true
      : session.isError
        ? false
        : null;

  const stats = useQuery({
    queryKey: adminKeys.stats(),
    queryFn: fetchStats,
    enabled: authed === true,
  });

  const onSignedIn = useCallback(() => {
    setTokenPresent(true);
    void qc.invalidateQueries({ queryKey: ['admin'] });
  }, [qc]);

  const signOut = (): void => {
    writeToken(null);
    setTokenPresent(false);
    qc.removeQueries({ queryKey: ['admin'] });
  };

  if (authed === null) {
    return (
      <div className={styles.login}>
        <p className={styles.muted}>{t.common.loading}</p>
      </div>
    );
  }

  if (!authed) return <AdminLogin onSuccess={onSignedIn} />;

  const tabs: Array<{ id: Tab; label: string; badge?: number }> = [
    {
      id: 'inquiries',
      label: t.admin.inquiries,
      ...(stats.data?.newInquiries ? { badge: stats.data.newInquiries } : {}),
    },
    {
      id: 'reviews',
      label: t.admin.reviewsQueue,
      ...(stats.data?.pendingReviews ? { badge: stats.data.pendingReviews } : {}),
    },
    { id: 'products', label: t.admin.products },
    { id: 'fabrics', label: t.admin.fabrics },
  ];

  return (
    <div className={styles.shell}>
      <header className={styles.bar}>
        <div className={styles.brand}>
          <span className={styles.brandName}>Aura</span>
          <span className={styles.brandTag}>{t.admin.title}</span>
        </div>

        <nav className={styles.tabs} aria-label={t.admin.dashboard}>
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.tab} ${tab === item.id ? styles.tabActive : ''}`}
              aria-current={tab === item.id ? 'page' : undefined}
              onClick={() => setTab(item.id)}
            >
              {item.label}
              {item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
            </button>
          ))}
        </nav>

        <button type="button" className={styles.signOut} onClick={signOut}>
          {t.admin.signOut}
        </button>
      </header>

      <main className={styles.main}>
        {stats.data && (
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <div className={styles.statNum}>{stats.data.newInquiries}</div>
              <div className={styles.statLabel}>{t.admin.inquiries}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNum}>{stats.data.pendingReviews}</div>
              <div className={styles.statLabel}>{t.admin.pending}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNum}>{stats.data.products}</div>
              <div className={styles.statLabel}>{t.admin.products}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNum}>{stats.data.projects}</div>
              <div className={styles.statLabel}>{t.nav.interiorDesign}</div>
            </div>
          </div>
        )}

        <h1 className={styles.pageTitle}>{tabs.find((x) => x.id === tab)?.label}</h1>

        {tab === 'inquiries' && <AdminInquiries />}
        {tab === 'reviews' && <AdminReviews />}
        {tab === 'products' && <AdminProducts />}
        {tab === 'fabrics' && <AdminFabrics />}
      </main>
    </div>
  );
}
