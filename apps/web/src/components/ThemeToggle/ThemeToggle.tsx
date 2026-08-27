import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/useTheme';
import styles from './ThemeToggle.module.scss';

export function ThemeToggle() {
  const { t } = useI18n();
  const { theme, toggle } = useTheme();
  const next = theme === 'dark' ? t.theme.light : t.theme.dark;

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      // The label names the RESULT of pressing, which is what a screen reader
      // user needs, and it changes as the state changes.
      aria-label={`${t.theme.toggle} — ${next}`}
      title={`${t.theme.toggle} — ${next}`}
    >
      <svg className={styles.icon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {theme === 'dark' ? (
          <path
            d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        ) : (
          <>
            <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.4" />
            <path
              d="M12 2.6v2.2M12 19.2v2.2M21.4 12h-2.2M4.8 12H2.6M18.6 5.4l-1.6 1.6M7 17l-1.6 1.6M18.6 18.6 17 17M7 7 5.4 5.4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
    </button>
  );
}
