import { useParams } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { Placeholder } from './Placeholder';

export function ProductDetail() {
  const { slug } = useParams();
  const { t } = useI18n();
  return (
    <Placeholder
      eyebrow={t.common.madeToOrder}
      title={slug ?? 'Product'}
      note="Gallery with lightbox, sticky detail column, fabric selector and the “Request this piece” enquiry modal are built in Phase 4."
      phase="Phase 4"
    />
  );
}
