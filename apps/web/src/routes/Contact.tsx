import { useI18n } from '@/i18n';
import { Placeholder } from './Placeholder';

export function Contact() {
  const { t } = useI18n();
  return (
    <Placeholder
      eyebrow={t.footer.contactUs}
      title={t.nav.contact}
      note="Contact form, showroom address, map, hours, WhatsApp and Instagram DM links are built in Phase 4."
      phase="Phase 4"
    />
  );
}
