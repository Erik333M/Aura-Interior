import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useI18n } from '@/i18n';
import { login, writeToken } from '@/services/admin';
import { ApiRequestError } from '@/services/client';
import { Field } from '@/components/Field';
import styles from './Admin.module.scss';

/**
 * Password-only sign-in. There is one operator, so an email field asked for a
 * value that identified nobody.
 *
 * The hidden username input is not decoration: without it password managers
 * cannot associate a saved credential with this form, and Chrome warns about
 * it. It carries the site name rather than a real account.
 */
export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useI18n();
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => login({ password }),
    onSuccess: (session) => {
      writeToken(session.token);
      onSuccess();
    },
  });

  const submit = (e: FormEvent): void => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className={styles.login}>
      <form className={styles.loginCard} onSubmit={submit} noValidate>
        <h1 className={styles.loginTitle}>Aura · {t.admin.title}</h1>

        <input
          type="text"
          name="username"
          autoComplete="username"
          value="aura-admin"
          readOnly
          hidden
          aria-hidden="true"
          tabIndex={-1}
        />

        <Field
          label={t.admin.password}
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {mutation.isError && (
          <p className={styles.error} role="alert">
            {mutation.error instanceof ApiRequestError
              ? mutation.error.message
              : t.admin.loginFailed}
          </p>
        )}

        <button type="submit" className={styles.submit} disabled={mutation.isPending}>
          {mutation.isPending ? t.inquiry.sending : t.admin.signIn}
        </button>
      </form>
    </div>
  );
}
