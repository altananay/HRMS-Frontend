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

      const next = searchParams.get('next');
      const destination =
        next && next.startsWith('/') && !next.startsWith('//')
          ? next
          : (DASHBOARD_BY_USER_TYPE[user.userType] ?? '/');

      router.replace(destination);
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
