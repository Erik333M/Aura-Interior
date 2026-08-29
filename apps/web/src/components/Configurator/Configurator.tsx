import { useId, useMemo } from 'react';
import { FABRIC_CATEGORIES, type Fabric, type FabricCategory, type Product } from '@aura/types';
import { useI18n } from '@/i18n';
import { presetsFor, type SizePreset } from '@/lib/sizes';
import styles from './Configurator.module.scss';

export interface Configuration {
  /** Preset id, or 'custom'. */
  sizeId: string;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  fabricId: string | null;
}

export interface ConfiguratorProps {
  product: Product;
  value: Configuration;
  onChange: (next: Configuration) => void;
}

const Tick = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="14" height="14">
    <path
      d="M3.5 8.5l3 3 6-7"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * The buying decision, made explicit.
 *
 * Aura sells commissions, not stock, so "what size and what colour" IS the
 * product. Before this the page showed one fixed dimension and a free-text box,
 * which asked the customer to already know what they wanted. Now the standard
 * sizes are one tap, a custom size is three numbers, and every fabric is a
 * swatch you can see — with the whole configuration carried into the enquiry so
 * the workshop receives a specification rather than a paragraph.
 */
export function Configurator({ product, value, onChange }: ConfiguratorProps) {
  const { t, tl, price, formatNumber } = useI18n();
  const groupId = useId();

  const presets = presetsFor(product.category?.slug);
  const isCustom = value.sizeId === 'custom';

  // Fabrics grouped by type so the customer sees "velvet" as a decision rather
  // than a wall of undifferentiated circles.
  const grouped = useMemo(() => {
    const labels: Record<FabricCategory, string> = {
      BOUCLE: t.catalogue.fabricBoucle,
      VELVET: t.catalogue.fabricVelvet,
      LINEN: t.catalogue.fabricLinen,
      LEATHER: t.catalogue.fabricLeather,
    };
    return FABRIC_CATEGORIES.map((cat) => ({
      cat,
      label: labels[cat],
      items: product.fabrics.filter((f) => f.category === cat),
    })).filter((g) => g.items.length > 0);
  }, [product.fabrics, t]);

  const selectedFabric: Fabric | undefined =
    product.fabrics.find((f) => f.id === value.fabricId) ?? product.fabrics[0];

  const applyPreset = (p: SizePreset): void =>
    onChange({
      ...value,
      sizeId: p.id,
      widthCm: p.widthCm,
      depthCm: p.depthCm ?? product.dimensions.depthCm,
      heightCm: product.dimensions.heightCm,
    });

  const setDim = (key: 'widthCm' | 'depthCm' | 'heightCm', raw: string): void => {
    const n = Number.parseInt(raw, 10);
    onChange({ ...value, sizeId: 'custom', [key]: Number.isFinite(n) ? n : 0 });
  };

  // Derived rather than a mutating counter: a piece with no size choice starts
  // its colour step at 01, not 02.
  const showSizeStep = presets.length > 0 || product.customSizeAvailable;
  const sizeStepNo = '01';
  const colourStepNo = showSizeStep ? '02' : '01';

  return (
    <div className={styles.wrap}>
      {showSizeStep && (
        <fieldset className={styles.step}>
          <legend className={styles.legend}>
            <span className={styles.stepNum}>
              {t.configurator.step} {sizeStepNo}
            </span>
            <span className={styles.legendText}>{t.configurator.chooseSize}</span>
          </legend>

          {presets.length > 0 && (
            <ul className={styles.chips} role="list">
              {presets.map((p) => {
                const selected = value.sizeId === p.id;
                return (
                  <li key={p.id}>
                    <input
                      className={styles.native}
                      type="radio"
                      name={`${groupId}-size`}
                      id={`${groupId}-size-${p.id}`}
                      checked={selected}
                      onChange={() => applyPreset(p)}
                    />
                    <label
                      htmlFor={`${groupId}-size-${p.id}`}
                      className={`${styles.chip} ${selected ? styles.chipSelected : ''}`}
                    >
                      <span className={styles.chipLabel}>{p.label}</span>
                      {p.note && <span className={styles.chipNote}>{p.note}</span>}
                    </label>
                  </li>
                );
              })}

              {product.customSizeAvailable && (
                <li>
                  <input
                    className={styles.native}
                    type="radio"
                    name={`${groupId}-size`}
                    id={`${groupId}-size-custom`}
                    checked={isCustom}
                    onChange={() => onChange({ ...value, sizeId: 'custom' })}
                  />
                  <label
                    htmlFor={`${groupId}-size-custom`}
                    className={`${styles.chip} ${isCustom ? styles.chipSelected : ''}`}
                  >
                    <span className={styles.chipLabel}>{t.configurator.custom}</span>
                    <span className={styles.chipNote}>{t.common.madeToOrder}</span>
                  </label>
                </li>
              )}
            </ul>
          )}

          {/* Custom inputs appear only once custom is chosen, or when the piece
              has no presets at all and made-to-order is the only route. */}
          {product.customSizeAvailable && (isCustom || presets.length === 0) && (
            <>
              <p className={styles.hint}>{t.configurator.customHint}</p>
              <div className={styles.custom}>
                {(
                  [
                    ['widthCm', t.configurator.width],
                    ['depthCm', t.configurator.depth],
                    ['heightCm', t.configurator.height],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className={styles.dimField}>
                    <label className={styles.dimLabel} htmlFor={`${groupId}-${key}`}>
                      {label}
                    </label>
                    <span className={styles.dimInputWrap}>
                      <input
                        id={`${groupId}-${key}`}
                        className={styles.dimInput}
                        type="number"
                        inputMode="numeric"
                        min={20}
                        max={500}
                        step={1}
                        value={value[key] || ''}
                        onChange={(e) => setDim(key, e.target.value)}
                      />
                      <span className={styles.unit}>{t.configurator.cm}</span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {!product.customSizeAvailable && presets.length === 0 && (
            <p className={styles.hint}>{t.configurator.customSizeNotAvailable}</p>
          )}
        </fieldset>
      )}

      {product.fabrics.length > 0 && (
        <fieldset className={styles.step}>
          <legend className={styles.legend}>
            <span className={styles.stepNum}>
              {t.configurator.step} {colourStepNo}
            </span>
            <span className={styles.legendText}>{t.configurator.chooseColour}</span>
          </legend>
          <p className={styles.hint}>
            {product.fabrics.length} {t.configurator.swatchesNote} · {t.configurator.colourHint}
          </p>

          {grouped.map((group) => (
            <div key={group.cat} className={styles.group}>
              <span className={styles.groupName}>{group.label}</span>
              <ul className={styles.swatches} role="list">
                {group.items.map((f) => {
                  const selected = selectedFabric?.id === f.id;
                  return (
                    <li key={f.id} className={styles.swatchItem}>
                      <input
                        className={styles.native}
                        type="radio"
                        name={`${groupId}-fabric`}
                        id={`${groupId}-fabric-${f.id}`}
                        checked={selected}
                        onChange={() => onChange({ ...value, fabricId: f.id })}
                      />
                      <label
                        htmlFor={`${groupId}-fabric-${f.id}`}
                        className={`${styles.swatch} ${selected ? styles.swatchSelected : ''}`}
                        style={{ backgroundColor: f.hex }}
                      >
                        {selected && (
                          <span className={styles.tick}>
                            <Tick />
                          </span>
                        )}
                      </label>
                      <span
                        className={`${styles.swatchName} ${selected ? styles.swatchNameSelected : ''}`}
                      >
                        {tl(f.name)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </fieldset>
      )}

      <div className={styles.summary}>
        <span className={styles.summaryTitle}>{t.configurator.yourPiece}</span>
        <dl className={styles.summaryRows}>
          <div className={styles.summaryRow}>
            <dt className={styles.summaryKey}>{t.configurator.size}</dt>
            <dd className={styles.summaryValue}>
              {formatNumber(value.widthCm)} × {formatNumber(value.depthCm)} ×{' '}
              {formatNumber(value.heightCm)} {t.configurator.cm}
            </dd>
          </div>
          {selectedFabric && (
            <div className={styles.summaryRow}>
              <dt className={styles.summaryKey}>{t.configurator.fabric}</dt>
              <dd className={styles.summaryValue}>
                <span
                  className={styles.summarySwatch}
                  style={{ backgroundColor: selectedFabric.hex }}
                />
                {tl(selectedFabric.name)}
              </dd>
            </div>
          )}
          <div className={styles.summaryRow}>
            <dt className={styles.summaryKey}>{t.product.leadTime}</dt>
            <dd className={styles.summaryValue}>
              {product.leadTimeDays} {t.common.days}
            </dd>
          </div>
        </dl>

        <div className={styles.price}>
          <span className={styles.summaryKey}>{t.catalogue.price}</span>
          <span className={styles.priceValue}>{price(product.priceFrom)}</span>
        </div>
        <p className={styles.priceNote}>{t.configurator.priceNote}</p>
      </div>
    </div>
  );
}
