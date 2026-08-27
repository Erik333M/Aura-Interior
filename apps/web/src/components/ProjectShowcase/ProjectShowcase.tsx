import { Link } from 'react-router-dom';
import type { Project } from '@aura/types';
import { useI18n } from '@/i18n';
import { ResponsiveImage } from '@/components/ResponsiveImage';
import { Reveal } from '@/components/Reveal';
import styles from './ProjectShowcase.module.scss';

export function ProjectShowcase({ projects }: { projects: Project[] }) {
  const { t, tl, path } = useI18n();
  if (projects.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="projects-heading">
      <div className={styles.head}>
        <div>
          <p className={styles.eyebrow}>{t.homeSections.projectsEyebrow}</p>
          <h2 id="projects-heading" className={styles.title}>
            {t.homeSections.projectsTitle}
          </h2>
        </div>
        <Link to={path('/interior-design')} className={styles.more}>
          {t.common.viewAll}
        </Link>
      </div>

      <ul className={styles.grid} role="list">
        {projects.map((project, i) => {
          const image = project.images[0];
          return (
            <Reveal as="li" key={project.id} index={i}>
              <Link to={path('/interior-design')} className={styles.card}>
                {image && (
                  <span className={styles.media}>
                    <ResponsiveImage
                      base={image.url}
                      alt={tl(project.title)}
                      width={image.width}
                      height={image.height}
                      blurhash={image.blurhash}
                      sizes="(min-width: 768px) 30vw, 92vw"
                    />
                  </span>
                )}
                <span className={styles.year}>{project.year}</span>
                <span className={styles.name}>{tl(project.title)}</span>
                <span className={styles.location}>{tl(project.location)}</span>
              </Link>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
