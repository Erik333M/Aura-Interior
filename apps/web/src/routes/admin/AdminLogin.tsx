import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useI18n } from '@/i18n';
import { login, writeToken } from '@/services/admin';
import { ApiRequestError } from '@/services/client';
import { Field } from '@/components/Field';
import styles from './Admin.module.scss';

export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => login({ email, password }),
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

        <Field
          label={t.admin.email}
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label={t.admin.password}
          type="password"
          autoComplete="current-password"
          required
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
