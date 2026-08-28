import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, m } from 'framer-motion';
import { useI18n } from '@/i18n';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { pauseScroll, resumeScroll } from '@/lib/smoothScroll';
import { Logo } from '@/components/Logo';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useWishlist } from '@/lib/wishlist';
import styles from './Header.module.scss';

export function Header() {
  const { t, path } = useI18n();
  const { pathname } = useLocation();
  const reduced = useReducedMotion();

  const saved = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);

  const links = [
    { to: path('/catalogue'), label: t.nav.catalogue },
    { to: path('/interior-design'), label: t.nav.interiorDesign },
    { to: path('/about'), label: t.nav.about },
    { to: path('/contact'), label: t.nav.contact },
  ];

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close on navigation — otherwise the sheet stays open over the new page.
  // Adjusted during render rather than in an effect: setState inside an effect
  // body causes a second render pass, and React explicitly supports this
  // "adjust state when a prop changes" pattern.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  // Escape closes, body scroll locks, and focus returns to the trigger.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    // Captured now: by cleanup time the ref may point elsewhere.
    const trigger = burgerRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // overflow:hidden stops native scrolling but not Lenis, which would keep
    // scrolling the page behind the sheet.
    pauseScroll();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      resumeScroll();
      document.removeEventListener('keydown', onKey);
      trigger?.focus();
    };
  }, [menuOpen]);

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          {/* No aria-label: the wordmark's own text ("Aura · EVN Furniture") is
              the accessible name. An aria-label that does not contain the
              visible text fails WCAG 2.5.3 (label in name). */}
          <Link to={path('/')} className={styles.brand}>
            <Logo />
          </Link>

          <nav className={styles.nav} aria-label={t.nav.menu}>
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.actions}>
            <div className={styles.desktopOnly}>
              <LocaleSwitcher />
            </div>
            <Link
              to={path('/wishlist')}
              className={`${styles.wishlist} ${saved.length > 0 ? styles.wishlistActive : ''}`}
              aria-label={`${t.nav.wishlist}${saved.length > 0 ? ` (${saved.length})` : ''}`}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path
                  d="M12 20s-7-4.6-7-9.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7 3c0 4.8-7 9.4-7 9.4Z"
                  strokeLinejoin="round"
                />
              </svg>
              {saved.length > 0 && <span className={styles.wishlistCount}>{saved.length}</span>}
            </Link>
            <ThemeToggle />
            <button
              ref={burgerRef}
              type="button"
              className={styles.burger}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={t.nav.menu}
              onClick={() => setMenuOpen(true)}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path
                  d="M3 7h18M3 12h18M3 17h18"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <m.div
            id="mobile-menu"
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.menu}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -16 }}
            transition={{ duration: reduced ? 0.12 : 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.sheetTop}>
              <Logo />
              <button
                type="button"
                className={styles.burger}
                onClick={() => setMenuOpen(false)}
                aria-label={t.nav.close}
                autoFocus
              >
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <nav className={styles.sheetNav} aria-label={t.nav.menu}>
              {links.map((l) => (
                <Link key={l.to} to={l.to} className={styles.sheetLink}>
                  {l.label}
                </Link>
              ))}
              <Link to={path('/wishlist')} className={styles.sheetLink}>
                {t.nav.wishlist}
                {saved.length > 0 ? ` (${saved.length})` : ''}
              </Link>
            </nav>

            <div className={styles.sheetFooter}>
              <LocaleSwitcher />
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
