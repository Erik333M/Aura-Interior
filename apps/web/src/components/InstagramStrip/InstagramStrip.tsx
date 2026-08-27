import type { Product } from '@aura/types';
import { useI18n } from '@/i18n';
import { ResponsiveImage } from '@/components/ResponsiveImage';
import styles from './InstagramStrip.module.scss';

const HANDLE = import.meta.env['VITE_INSTAGRAM_HANDLE'] ?? 'aura_Interior';
const PROFILE = `https://instagram.com/${HANDLE}`;

/**
 * Instagram strip — six tiles linking to the profile.
 *
 * IMPORTANT: these are NOT live posts. Pulling the latest six requires an
 * Instagram Graph API access token tied to a Business account, which cannot be
 * committed and has to be refreshed on a schedule. The layout, aspect ratio and
 * count all match what the real feed will render, so wiring it up later is a
 * data swap in this one component: fetch the media edge, map to { permalink,
 * imageUrl }, and drop the product fallback below.
 */
export function InstagramStrip({ fallback }: { fallback: Product[] }) {
  const { t } = useI18n();

  const tiles = fallback
    .flatMap((p) => p.images.map((img) => ({ key: img.id, url: img.url, alt: '' })))
    .slice(0, 6);

  if (tiles.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="instagram-heading">
      <div className={styles.head}>
        <div>
          <p className={styles.eyebrow}>{t.homeSections.instagramEyebrow}</p>
          <h2 id="instagram-heading" className={styles.title}>
            {t.homeSections.instagramTitle}
          </h2>
        </div>
        <a className={styles.handle} href={PROFILE} target="_blank" rel="noreferrer noopener">
          @{HANDLE}
          <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
            <path
              d="M6 3h7v7M13 3L4 12"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>

      <ul className={styles.grid} role="list">
        {tiles.map((tile) => (
          <li key={tile.key}>
            <a
              className={styles.tile}
              href={PROFILE}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={t.homeSections.instagramFollow}
            >
              <ResponsiveImage
                base={tile.url}
                alt=""
                width={1600}
                height={1600}
                sizes="(min-width: 1024px) 16vw, (min-width: 480px) 32vw, 48vw"
              />
              <span className={styles.icon} aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
