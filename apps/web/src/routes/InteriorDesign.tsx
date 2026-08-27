import { useI18n } from '@/i18n';
import { Placeholder } from './Placeholder';

export function InteriorDesign() {
  const { t } = useI18n();
  return (
    <Placeholder
      eyebrow="Aura Interior"
      title={t.nav.interiorDesign}
      note="Process, past project gallery and the consultation request form are built in Phase 4."
      phase="Phase 4"
    />
  );
}
