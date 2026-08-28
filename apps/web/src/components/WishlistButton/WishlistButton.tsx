import { useState } from 'react';
import { useI18n } from '@/i18n';
import { toggleWishlist, useWishlist } from '@/lib/wishlist';
import styles from './WishlistButton.module.scss';

export function WishlistButton({
  slug,
  variant = 'overlay',
}: {
  slug: string;
  variant?: 'overlay' | 'inline';
}) {
  const { t } = useI18n();
  const saved = useWishlist().includes(slug);
  const [popping, setPopping] = useState(false);

  return (
    <button
      type="button"
      className={`${styles.button} ${saved ? styles.saved : ''} ${
        variant === 'inline' ? styles.inline : ''
      }`}
      // The label names the ACTION, and flips with state — a screen reader user
      // needs to know what pressing does, not what the icon looks like.
      aria-label={saved ? t.wishlist.remove : t.wishlist.add}
      aria-pressed={saved}
      title={saved ? t.wishlist.remove : t.wishlist.add}
      onClick={(e) => {
        // The whole card is a link; saving must not navigate.
        e.preventDefault();
        e.stopPropagation();
        const added = toggleWishlist(slug);
        if (added) {
          setPopping(true);
          window.setTimeout(() => setPopping(false), 450);
        }
      }}
    >
      <svg
        className={`${styles.heart} ${popping ? styles.pop : ''}`}
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <path
          d="M12 20s-7-4.6-7-9.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7 3c0 4.8-7 9.4-7 9.4Z"
          strokeLinejoin="round"
        />
      </svg>
      {variant === 'inline' && <span>{saved ? t.wishlist.remove : t.wishlist.add}</span>}
    </button>
  );
}
