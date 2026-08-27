import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { MagneticButton } from '@/components/MagneticButton';
import styles from './ContactCta.module.scss';

const HANDLE = import.meta.env['VITE_INSTAGRAM_HANDLE'] ?? 'aura_Interior';
const WHATSAPP = import.meta.env['VITE_WHATSAPP_NUMBER'] ?? '';

/** Closing CTA — meets customers on the channels they already order through. */
export function ContactCta() {
  const { t, path, locale } = useI18n();

  // Prefilled in the reader's own language.
  const greeting =
    locale === 'hy'
      ? 'Բարև, ուզում եմ պատվիրել կահույք։'
      : locale === 'ru'
        ? 'Здравствуйте, хочу заказать мебель.'
        : 'Hello, I would like to order a piece.';

  return (
    <section className={styles.band} aria-labelledby="contact-cta-heading">
      <span className={styles.glow} aria-hidden="true" />
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{t.homeSections.contactEyebrow}</p>
        <h2 id="contact-cta-heading" className={styles.title}>
          {t.homeSections.contactTitle}
        </h2>
        <p className={styles.body}>{t.homeSections.contactBody}</p>

        <div className={styles.actions}>
          <MagneticButton as={Link} to={path('/contact')} className={styles.primary}>
            {t.footer.contactUs}
          </MagneticButton>

          {WHATSAPP && (
            <a
              className={styles.secondary}
              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(greeting)}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              <svg
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.6 14.2c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-3.1-.8-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.6 0-1.3.7-1.9 1-2.1a1 1 0 0 1 .7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.3.3c-.1.1-.3.3-.1.6.1.3.7 1.2 1.5 1.9 1 .9 1.8 1.2 2 1.3.3.1.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l2 1c.2.1.4.2.4.3.1.2.1.7-.1 1.4Z" />
              </svg>
              {t.footer.whatsapp}
            </a>
          )}

          <a
            className={styles.secondary}
            href={`https://ig.me/m/${HANDLE}`}
            target="_blank"
            rel="noreferrer noopener"
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
    </section>
  );
}
