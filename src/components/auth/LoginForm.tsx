'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { Form, SubmitButton } from '@/components/form/Form';
import { RHFPasswordField } from '@/components/form/RHFPasswordField';
import { RHFTextField } from '@/components/form/RHFTextField';
import { useApiForm } from '@/components/form/useApiForm';
import type { AuthenticatedUserResponse } from '@/contracts/responses';
import { DASHBOARD_BY_USER_TYPE } from '@/lib/dashboards';
import { auth } from '@/lib/http';
import {
  loginSchema,
  toLoginRequest,
  type LoginInput,
  type LoginValues,
} from '@/schemas/auth';

/**
 * **One sign-in form for all three roles**, because the API has one `/auth/login`.
 *
 * The pre-rewrite app had `/login` and `/companylogin` as separate screens writing to two different
 * `localStorage` keys, which meant a user who picked the wrong one was told their password was wrong.
 * The response says what kind of account it is; the destination follows from that.
 */

export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const schema = useMemo(() => loginSchema(t), [t]);

  const submit = useCallback(
    async (values: LoginValues) => {
      const { user } = await auth<{ user: AuthenticatedUserResponse }>('login', {
        method: 'POST',
        body: toLoginRequest(values),
      });

      // `next` is set by the proxy when it turns an anonymous visitor away from a protected
      // page. Only a same-origin path is honoured — an absolute URL here would make the sign-in form
      // an open redirect, which is a classic phishing primitive.
      const next = searchParams.get('next');
      const destination =
        next && next.startsWith('/') && !next.startsWith('//')
          ? next
          : (DASHBOARD_BY_USER_TYPE[user.userType] ?? '/');

      router.replace(destination);
      // The session lives in httpOnly cookies, so the server has to re-render for the header and any
      // protected page to see it.
      router.refresh();
    },
    [router, searchParams],
  );

  const form = useApiForm<LoginInput, LoginValues>({
    schema,
    defaultValues: { email: '', password: '' },
    onSubmit: submit,
  });

  return (
    <Form form={form}>
      <RHFTextField<LoginInput>
        name="email"
        label={t('auth.email')}
        type="email"
        autoComplete="email"
        autoFocus
      />

      <RHFPasswordField<LoginInput>
        name="password"
        label={t('auth.password')}
        autoComplete="current-password"
      />

      <Stack sx={{ alignItems: 'flex-end', mt: -1, mb: 2 }}>
        <MuiLink href="/forgot-password" variant="body2">
          {t('auth.login.forgot')}
        </MuiLink>
      </Stack>

      <SubmitButton busy={form.formState.isSubmitting} fullWidth>
        {t('auth.login.submit')}
      </SubmitButton>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
        {t('auth.login.noAccount')}{' '}
        <MuiLink href="/register">{t('auth.login.register')}</MuiLink>
      </Typography>
    </Form>
  );
}
