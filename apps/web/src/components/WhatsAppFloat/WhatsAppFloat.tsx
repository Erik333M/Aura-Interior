import { useI18n } from '@/i18n';
import { track } from '@/lib/analytics';
import styles from './WhatsAppFloat.module.scss';

const WHATSAPP = import.meta.env['VITE_WHATSAPP_NUMBER'] ?? '';

/**
 * Persistent WhatsApp entry point, prefilled in the reader's own language —
 * Armenian by default, since that is the site default and the business's
 * language. Orders already arrive this way; the site should not fight that.
 */
export function WhatsAppFloat() {
  const { t, locale } = useI18n();
  if (!WHATSAPP) return null;

  const message =
    locale === 'ru'
      ? 'Здравствуйте! Хочу заказать мебель у Aura Interior.'
      : locale === 'en'
        ? 'Hello! I would like to order a piece from Aura Interior.'
        : 'Բարև Ձեզ։ Ուզում եմ պատվիրել կահույք Aura Interior-ից։';

  return (
    <a
      className={styles.float}
      href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={t.float.whatsapp}
      onClick={() => track('whatsapp_clicked', { locale, placement: 'float' })}
    >
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.6 14.2c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-3.1-.8-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.6 0-1.3.7-1.9 1-2.1a1 1 0 0 1 .7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.3.3c-.1.1-.3.3-.1.6.1.3.7 1.2 1.5 1.9 1 .9 1.8 1.2 2 1.3.3.1.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l2 1c.2.1.4.2.4.3.1.2.1.7-.1 1.4Z" />
      </svg>
      <span className={styles.label}>{t.footer.whatsapp}</span>
    </a>
  );
}
