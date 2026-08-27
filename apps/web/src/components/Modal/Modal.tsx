import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { pauseScroll, resumeScroll } from '@/lib/smoothScroll';
import styles from './Modal.module.scss';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  /** Lightbox-style: full-bleed panel with no chrome. */
  wide?: boolean;
  closeLabel: string;
}

/**
 * Rendered through a portal so it is never clipped by an ancestor's
 * `overflow: hidden`, and so its stacking order does not depend on where in the
 * tree it was declared.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  wide = false,
  closeLabel,
}: ModalProps) {
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // overflow:hidden stops native scrolling but not Lenis.
    pauseScroll();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      resumeScroll();
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className={styles.scrim}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.12 : 0.2 }}
            onClick={onClose}
          />
          <div className={styles.wrap}>
            <motion.div
              ref={panelRef}
              className={`${styles.panel} ${wide ? styles.wide : ''}`}
              role="dialog"
              aria-modal="true"
              aria-label={title}
              tabIndex={-1}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 6 }}
              transition={{ duration: reduced ? 0.12 : 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              {(title || !wide) && (
                <div className={styles.head}>
                  <div>
                    {title && <h2 className={styles.title}>{title}</h2>}
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                  </div>
                  <button
                    type="button"
                    className={styles.close}
                    onClick={onClose}
                    aria-label={closeLabel}
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                      <path
                        d="M6 6l12 12M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              )}
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
