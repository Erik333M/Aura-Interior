import { useI18n } from '@/i18n';
import { Placeholder } from './Placeholder';

export function About() {
  const { t } = useI18n();
  return (
    <Placeholder
      eyebrow={t.footer.madeIn}
      title={t.nav.about}
      note="The manufacturing story, workshop photography and craft detail shots are built in Phase 4."
      phase="Phase 4"
    />
  );
}
