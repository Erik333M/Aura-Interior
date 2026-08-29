import { useId, useMemo } from 'react';
import { FABRIC_CATEGORIES, type Fabric, type FabricCategory, type Product } from '@aura/types';
import { useI18n } from '@/i18n';
import { presetsFor } from '@/lib/sizes';
import styles from './Configurator.module.scss';

export interface Configuration {
  /** A ProductSize id, a preset id, or 'custom'. */
  sizeId: string;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  fabricId: string | null;
  /** Price for the chosen size, when the product has a real price table. */
  priceForSize: number | null;
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

  const isCustom = value.sizeId === 'custom';

  /**
   * Where the supplier gave a real price table we offer THOSE sizes, priced —
   * that is the whole point: picking a size changes the price, the way any
   * marketplace behaves. Only when a product has no table do we fall back to
   * the generic category presets, which are unpriced because inventing a
   * per-size price would be a lie the customer pays for.
   */
  const priced = product.sizes.length > 0;
  const options: Array<{
    id: string;
    label: string;
    note?: string;
    widthCm: number;
    depthCm: number;
    price: number | null;
  }> = priced
    ? product.sizes.map((z) => ({
        id: z.id,
        label: `${z.widthCm} × ${z.depthCm}`,
        widthCm: z.widthCm,
        depthCm: z.depthCm,
        price: z.priceFrom,
      }))
    : presetsFor(product.category?.slug).map((preset) => ({
        id: preset.id,
        label: preset.label,
        ...(preset.note ? { note: preset.note } : {}),
        widthCm: preset.widthCm,
        depthCm: preset.depthCm ?? product.dimensions.depthCm,
        price: null,
      }));

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

  const applyOption = (o: (typeof options)[number]): void =>
    onChange({
      ...value,
      sizeId: o.id,
      widthCm: o.widthCm,
      depthCm: o.depthCm,
      heightCm: product.dimensions.heightCm,
      priceForSize: o.price,
    });

  const setDim = (key: 'widthCm' | 'depthCm' | 'heightCm', raw: string): void => {
    const n = Number.parseInt(raw, 10);
    // A custom size has no table entry, so it is quoted rather than priced.
    onChange({ ...value, sizeId: 'custom', priceForSize: null, [key]: Number.isFinite(n) ? n : 0 });
  };

  // Derived rather than a mutating counter: a piece with no size choice starts
  // its colour step at 01, not 02.
  const showSizeStep = options.length > 0 || product.customSizeAvailable;
  const showColourStep = product.fabrics.length > 0;
  // A mattress has no fabric options, so size is its only decision — numbering a
  // single step "01" implies a step 02 that never comes.
  const numbered = showSizeStep && showColourStep;
  const sizeStepNo = numbered ? '01' : null;
  const colourStepNo = numbered ? '02' : null;

  return (
    <div className={styles.wrap}>
      {showSizeStep && (
        <fieldset className={styles.step}>
          <legend className={styles.legend}>
            {sizeStepNo && (
              <span className={styles.stepNum}>
                {t.configurator.step} {sizeStepNo}
              </span>
            )}
            <span className={styles.legendText}>{t.configurator.chooseSize}</span>
          </legend>

          {options.length > 0 && (
            <ul className={styles.chips} role="list">
              {options.map((o) => {
                const selected = value.sizeId === o.id;
                return (
                  <li key={o.id}>
                    <input
                      className={styles.native}
                      type="radio"
                      name={`${groupId}-size`}
                      id={`${groupId}-size-${o.id}`}
                      checked={selected}
                      onChange={() => applyOption(o)}
                    />
                    <label
                      htmlFor={`${groupId}-size-${o.id}`}
                      className={`${styles.chip} ${selected ? styles.chipSelected : ''}`}
                    >
                      <span className={styles.chipLabel}>{o.label}</span>
                      {o.price !== null ? (
                        <span className={styles.chipPrice}>{price(o.price, false)}</span>
                      ) : (
                        o.note && <span className={styles.chipNote}>{o.note}</span>
                      )}
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
                    onChange={() => onChange({ ...value, sizeId: 'custom', priceForSize: null })}
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
          {product.customSizeAvailable && (isCustom || options.length === 0) && (
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

          {!product.customSizeAvailable && options.length === 0 && (
            <p className={styles.hint}>{t.configurator.customSizeNotAvailable}</p>
          )}
        </fieldset>
      )}

      {showColourStep && (
        <fieldset className={styles.step}>
          <legend className={styles.legend}>
            {colourStepNo && (
              <span className={styles.stepNum}>
                {t.configurator.step} {colourStepNo}
              </span>
            )}
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
          <span className={styles.priceValue}>
            {value.priceForSize !== null
              ? // A real table entry: an exact price, not a "from".
                price(value.priceForSize, false)
              : price(product.priceFrom)}
          </span>
        </div>
        <p className={styles.priceNote}>
          {value.priceForSize !== null ? t.configurator.priceForSize : t.configurator.priceNote}
        </p>
      </div>
    </div>
  );
}
