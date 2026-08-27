import { useI18n } from '@/i18n';
import { PageHero } from './PageHero';
import { InquiryForm } from '@/components/InquiryForm';
import styles from './Contact.module.scss';

const HANDLE = import.meta.env['VITE_INSTAGRAM_HANDLE'] ?? 'aura_Interior';
const WHATSAPP = import.meta.env['VITE_WHATSAPP_NUMBER'] ?? '';

export function Contact() {
  const { t, locale } = useI18n();

  const greeting =
    locale === 'hy'
      ? 'Բարև, ուզում եմ պատվիրել կահույք։'
      : locale === 'ru'
        ? 'Здравствуйте, хочу заказать мебель.'
        : 'Hello, I would like to order a piece.';

  return (
    <>
      <PageHero eyebrow={t.contact.eyebrow} title={t.contact.title} lead={t.contact.lead} />

      <div className={styles.layout}>
        <div className={styles.details}>
          <div className={styles.block}>
            <span className={styles.label}>{t.contact.showroom}</span>
            <span className={styles.value}>{t.contact.address}</span>
          </div>

          <div className={styles.block}>
            <span className={styles.label}>{t.contact.hours}</span>
            <span className={styles.value}>{t.contact.hoursValue}</span>
          </div>

          {WHATSAPP && (
            <div className={styles.block}>
              <span className={styles.label}>{t.contact.phone}</span>
              <a className={styles.link} href={`tel:+${WHATSAPP}`}>
                +{WHATSAPP}
              </a>
            </div>
          )}

          <div className={styles.block}>
            <span className={styles.label}>{t.inquiry.orReach}</span>
            <div className={styles.channels}>
              {WHATSAPP && (
                <a
                  className={styles.channel}
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(greeting)}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {t.footer.whatsapp}
                </a>
              )}
              <a
                className={styles.channel}
                href={`https://ig.me/m/${HANDLE}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                {t.footer.instagramDm}
              </a>
            </div>
          </div>

          <div className={styles.map} role="img" aria-label={t.contact.findUs}>
            <svg
              className={styles.mapPin}
              viewBox="0 0 24 24"
              width="26"
              height="26"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            <span className={styles.value}>{t.contact.address}</span>
            <span className={styles.mapNote}>{t.contact.mapNote}</span>
          </div>
        </div>

        <div className={styles.formPanel}>
          <h2 className={styles.formTitle}>{t.footer.contactUs}</h2>
          <InquiryForm />
        </div>
      </div>
    </>
  );
}
