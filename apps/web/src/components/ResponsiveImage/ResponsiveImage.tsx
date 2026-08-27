import { useState, type CSSProperties } from 'react';
import styles from './ResponsiveImage.module.scss';

const WIDTHS = [400, 800, 1600] as const;

export interface ResponsiveImageProps {
  /** Path without size or extension, e.g. "/media/generated/product-arev-bed-1". */
  base: string;
  alt: string;
  width: number;
  height: number;
  /** Base64 data-URI shown underneath while the real image decodes. */
  blurhash?: string;
  /** The `sizes` attribute — tell the browser how wide this renders. */
  sizes?: string;
  /** Hero images should not be lazy or low priority. */
  priority?: boolean;
  className?: string;
}

const srcset = (base: string, ext: string): string =>
  WIDTHS.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ');

/**
 * One <picture> with AVIF → WebP → JPEG fallbacks at three widths, a blur
 * placeholder underneath, and an aspect-ratio box so nothing reflows when the
 * bytes land. Every catalogue image goes through this.
 */
export function ResponsiveImage({
  base,
  alt,
  width,
  height,
  blurhash,
  sizes = '100vw',
  priority = false,
  className,
}: ResponsiveImageProps) {
  const [loaded, setLoaded] = useState(false);

  const frameStyle: CSSProperties = {
    aspectRatio: `${width} / ${height}`,
    ...(blurhash && !loaded ? { backgroundImage: `url("${blurhash}")` } : {}),
  };

  return (
    <div className={`${styles.frame} ${className ?? ''}`} style={frameStyle}>
      <picture>
        <source type="image/avif" srcSet={srcset(base, 'avif')} sizes={sizes} />
        <source type="image/webp" srcSet={srcset(base, 'webp')} sizes={sizes} />
        <img
          className={`${styles.img} ${loaded ? styles.loaded : ''}`}
          src={`${base}-800.jpg`}
          srcSet={srcset(base, 'jpg')}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          // React 18 does not know the camelCase `fetchPriority` prop (added in
          // 19) and passes it straight through, which warns and emits nothing.
          // Spreading the lowercase attribute is what actually reaches the DOM.
          {...({ fetchpriority: priority ? 'high' : 'auto' } as Record<string, string>)}
          decoding={priority ? 'sync' : 'async'}
          onLoad={() => setLoaded(true)}
          // A cached image can finish before React attaches onLoad.
          ref={(el) => {
            if (el?.complete) setLoaded(true);
          }}
        />
      </picture>
    </div>
  );
}
