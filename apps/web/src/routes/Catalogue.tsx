import { useI18n } from '@/i18n';
import { Placeholder } from './Placeholder';

export function Catalogue() {
  const { t } = useI18n();
  return (
    <Placeholder
      eyebrow={t.common.madeToOrder}
      title={t.nav.catalogue}
      note="Filter sidebar, URL-synced facets, price histogram, colour swatches and the cross-fading product grid are built in Phase 3."
      phase="Phase 3"
    />
  );
}
