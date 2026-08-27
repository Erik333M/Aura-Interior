import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { CreateReviewInput } from '@aura/types';
import { useI18n } from '@/i18n';
import { createReview } from '@/services/inquiries';
import { ApiRequestError } from '@/services/client';
import { Field, TextareaField, Honeypot } from '@/components/Field';
import styles from './Reviews.module.scss';

export function ReviewForm({ productId }: { productId: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [body, setBody] = useState('');
  const [website, setWebsite] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (input: CreateReviewInput) => createReview(input),
    onError: (err: unknown) =>
      setFields(err instanceof ApiRequestError && err.fields ? err.fields : {}),
  });

  if (mutation.isSuccess) {
    // Never optimistically insert into the list: the review is PENDING and
    // showing it would imply it is live.
    return (
      <p className={styles.pending} role="status">
        {t.reviews.pending}
      </p>
    );
  }

  if (!open) {
    return (
      <button type="button" className={styles.writeToggle} onClick={() => setOpen(true)}>
        {t.reviews.write}
      </button>
    );
  }

  const submit = (e: FormEvent): void => {
    e.preventDefault();
    setFields({});
    mutation.mutate({
      productId,
      authorName,
      authorEmail,
      rating: rating as 1 | 2 | 3 | 4 | 5,
      body,
      ...(website ? { website } : {}),
    } as CreateReviewInput);
  };

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <fieldset className={styles.ratingPicker}>
        <legend className={styles.ratingLabel}>{t.reviews.rating}</legend>
        <div className={styles.starButtons}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={`${styles.starButton} ${n <= rating ? styles.starOn : ''}`}
              aria-pressed={n === rating}
              aria-label={`${n} ${t.reviews.stars}`}
              onClick={() => setRating(n)}
            >
              <svg
                viewBox="0 0 20 20"
                width="22"
                height="22"
                fill={n <= rating ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.2"
                aria-hidden="true"
              >
                <path
                  d="M10 2.5l2.35 4.76 5.25.76-3.8 3.7.9 5.23L10 14.48l-4.7 2.47.9-5.23-3.8-3.7 5.25-.76L10 2.5z"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}
        </div>
      </fieldset>

      <div className={styles.formRow}>
        <Field
          label={t.reviews.yourName}
          required
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          error={fields['authorName']}
        />
        <Field
          label={t.reviews.yourEmail}
          type="email"
          required
          value={authorEmail}
          onChange={(e) => setAuthorEmail(e.target.value)}
          error={fields['authorEmail']}
        />
      </div>

      <TextareaField
        label={t.reviews.yourReview}
        required
        value={body}
        onChange={(e) => setBody(e.target.value)}
        error={fields['body']}
      />

      <Honeypot value={website} onChange={setWebsite} />

      <button type="submit" className={styles.submit} disabled={mutation.isPending}>
        {mutation.isPending ? t.inquiry.sending : t.reviews.submit}
      </button>
    </form>
  );
}
