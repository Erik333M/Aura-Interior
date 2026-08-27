import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { CreateInquiryInput, Fabric, Product } from '@aura/types';
import { useI18n } from '@/i18n';
import { createInquiry } from '@/services/inquiries';
import { ApiRequestError } from '@/services/client';
import { Field, TextareaField, Honeypot } from '@/components/Field';
import styles from './InquiryForm.module.scss';

export interface InquiryFormProps {
  /** Prefills the enquiry and shows a context strip. */
  product?: Pick<Product, 'id' | 'name'> | undefined;
  fabric?: Pick<Fabric, 'id' | 'name' | 'hex'> | undefined;
  /** Consultation requests don't need a dimensions field. */
  showDimensions?: boolean;
  onSuccess?: () => void;
}

/**
 * The conversion form. Aura has no cart — this is the checkout.
 *
 * Field-level errors come straight from the API's typed `fields` map, so server
 * validation lands next to the input that caused it rather than in a toast.
 */
export function InquiryForm({
  product,
  fabric,
  showDimensions = true,
  onSuccess,
}: InquiryFormProps) {
  const { t, tl } = useI18n();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [fields, setFields] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (input: CreateInquiryInput) => createInquiry(input),
    onSuccess: () => {
      setFields({});
      onSuccess?.();
    },
    onError: (err: unknown) => {
      // Surface per-field messages where the API gave them.
      setFields(err instanceof ApiRequestError && err.fields ? err.fields : {});
    },
  });

  const submit = (e: FormEvent): void => {
    e.preventDefault();
    setFields({});
    mutation.mutate({
      name,
      phone,
      ...(email ? { email } : {}),
      message,
      ...(product ? { productId: product.id } : {}),
      ...(fabric ? { fabricId: fabric.id } : {}),
      ...(dimensions ? { customDimensions: dimensions } : {}),
      ...(website ? { website } : {}),
    } as CreateInquiryInput);
  };

  if (mutation.isSuccess) {
    return (
      <div className={styles.success}>
        <span className={styles.tick} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h3 className={styles.successTitle}>{t.inquiry.successTitle}</h3>
        <p className={styles.successBody}>{t.inquiry.successBody}</p>
        <button type="button" className={styles.again} onClick={() => mutation.reset()}>
          {t.inquiry.another}
        </button>
      </div>
    );
  }

  const generalError =
    mutation.isError && Object.keys(fields).length === 0
      ? mutation.error instanceof ApiRequestError
        ? mutation.error.message
        : t.common.error
      : null;

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      {(product || fabric) && (
        <div className={styles.context}>
          {product && (
            <div className={styles.contextItem}>
              <span className={styles.contextLabel}>{t.inquiry.piece}</span>
              <span className={styles.contextValue}>{tl(product.name)}</span>
            </div>
          )}
          {fabric && (
            <div className={styles.contextItem}>
              <span className={styles.contextLabel}>{t.inquiry.fabric}</span>
              <span className={styles.contextValue}>
                <span className={styles.swatch} style={{ backgroundColor: fabric.hex }} />
                {tl(fabric.name)}
              </span>
            </div>
          )}
        </div>
      )}

      <div className={styles.row}>
        <Field
          label={t.inquiry.name}
          name="name"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fields['name']}
        />
        <Field
          label={t.inquiry.phone}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={fields['phone']}
        />
      </div>

      <Field
        label={t.inquiry.email}
        optionalLabel={t.inquiry.optional}
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fields['email']}
      />

      {showDimensions && (
        <Field
          label={t.inquiry.customDimensions}
          name="customDimensions"
          hint={t.inquiry.customDimensionsHint}
          value={dimensions}
          onChange={(e) => setDimensions(e.target.value)}
          error={fields['customDimensions']}
        />
      )}

      <TextareaField
        label={t.inquiry.message}
        name="message"
        required
        placeholder={t.inquiry.messagePlaceholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        error={fields['message']}
      />

      <Honeypot value={website} onChange={setWebsite} />

      {generalError && (
        <p className={styles.formError} role="alert">
          {generalError}
        </p>
      )}

      <button type="submit" className={styles.submit} disabled={mutation.isPending}>
        {mutation.isPending ? t.inquiry.sending : t.inquiry.submit}
      </button>
    </form>
  );
}
