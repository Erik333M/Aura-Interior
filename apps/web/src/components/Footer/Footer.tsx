import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { Logo } from '@/components/Logo';
import styles from './Footer.module.scss';

const INSTAGRAM = import.meta.env['VITE_INSTAGRAM_HANDLE'] ?? 'aura_Interior';
const WHATSAPP = import.meta.env['VITE_WHATSAPP_NUMBER'] ?? '';

export function Footer() {
  const { t, path } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <Logo />
          <p className={styles.tagline}>{t.footer.tagline}</p>
        </div>

        <nav aria-labelledby="footer-company">
          <h2 id="footer-company" className={styles.colTitle}>
            {t.footer.company}
          </h2>
          <ul className={styles.list} role="list">
            <li>
              <Link to={path('/catalogue')} className={styles.link}>
                {t.nav.catalogue}
              </Link>
            </li>
            <li>
              <Link to={path('/interior-design')} className={styles.link}>
                {t.nav.interiorDesign}
              </Link>
            </li>
            <li>
              <Link to={path('/about')} className={styles.link}>
                {t.nav.about}
              </Link>
            </li>
            <li>
              <Link to={path('/contact')} className={styles.link}>
                {t.nav.contact}
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className={styles.colTitle}>{t.footer.contactUs}</h2>
          <ul className={styles.list} role="list">
            <li>
              <a
                className={styles.link}
                href={`https://instagram.com/${INSTAGRAM}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                {t.footer.instagramDm}
              </a>
            </li>
            {WHATSAPP && (
              <li>
                <a
                  className={styles.link}
                  href={`https://wa.me/${WHATSAPP}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {t.footer.whatsapp}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className={styles.baseline}>
        <span className={styles.madeIn}>{t.footer.madeIn}</span>
        <span>
          © {year} Aura Interior · {t.footer.rights}
        </span>
      </div>
    </footer>
  );
}
