import { useQuery } from '@tanstack/react-query';
import { useI18n } from '@/i18n';
import { Seo } from '@/components/Seo';
import { catalogueKeys, fetchProjects } from '@/services/catalogue';
import { PageHero } from './PageHero';
import { ResponsiveImage } from '@/components/ResponsiveImage';
import { Reveal } from '@/components/Reveal';
import { InquiryForm } from '@/components/InquiryForm';
import { Skeleton } from '@/components/Skeleton';
import styles from './InteriorDesign.module.scss';

export function InteriorDesign() {
  const { t, tl } = useI18n();

  const projects = useQuery({
    queryKey: catalogueKeys.projects(),
    queryFn: fetchProjects,
    staleTime: 5 * 60_000,
  });

  const steps = [
    { title: t.interior.step1Title, body: t.interior.step1Body },
    { title: t.interior.step2Title, body: t.interior.step2Body },
    { title: t.interior.step3Title, body: t.interior.step3Body },
    { title: t.interior.step4Title, body: t.interior.step4Body },
  ];

  return (
    <>
      <Seo title={t.seo.interiorTitle} description={t.seo.interiorDesc} />
      <PageHero eyebrow={t.interior.eyebrow} title={t.interior.title} lead={t.interior.lead} />

      <section className={styles.section} aria-labelledby="process-heading">
        <h2 id="process-heading" className={styles.title}>
          {t.interior.processTitle}
        </h2>
        <ol className={styles.steps}>
          {steps.map((step, i) => (
            <Reveal as="li" key={step.title} className={styles.step} index={i}>
              <span className={styles.stepNum}>{String(i + 1).padStart(2, '0')}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepBody}>{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="projects-gallery-heading">
        <h2 id="projects-gallery-heading" className={styles.title}>
          {t.interior.projectsTitle}
        </h2>

        {projects.isPending && <Skeleton aspectRatio="3 / 2" />}

        <ul className={styles.gallery} role="list">
          {(projects.data ?? []).map((project, i) => {
            const [cover, ...rest] = project.images;
            return (
              <Reveal as="li" key={project.id} className={styles.project} index={i % 2}>
                {cover && (
                  <span className={styles.projectMedia}>
                    <ResponsiveImage
                      base={cover.url}
                      alt={tl(project.title)}
                      width={cover.width}
                      height={cover.height}
                      blurhash={cover.blurhash}
                      sizes="(min-width: 768px) 46vw, 92vw"
                    />
                  </span>
                )}
                <div className={styles.projectMeta}>
                  <h3 className={styles.projectTitle}>{tl(project.title)}</h3>
                  <span className={styles.projectLocation}>
                    {tl(project.location)} · {project.year}
                  </span>
                </div>
                <p className={styles.projectBody}>{tl(project.description)}</p>
                {rest.length > 0 && (
                  <ul className={styles.thumbs} role="list">
                    {rest.map((img) => (
                      <li key={img.id} className={styles.thumb}>
                        <ResponsiveImage
                          base={img.url}
                          alt=""
                          width={img.width}
                          height={img.height}
                          blurhash={img.blurhash}
                          sizes="64px"
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </Reveal>
            );
          })}
        </ul>
      </section>

      <section className={styles.consult} aria-labelledby="consult-heading">
        <div className={styles.consultInner}>
          <div className={styles.consultCopy}>
            <h2 id="consult-heading" className={styles.consultTitle}>
              {t.interior.consultTitle}
            </h2>
            <p className={styles.consultBody}>{t.interior.consultBody}</p>
          </div>
          {/* A fit-out enquiry has no single piece and no fabric, and the
              dimensions field would be meaningless for a whole room. */}
          <InquiryForm showDimensions={false} />
        </div>
      </section>
    </>
  );
}
