'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Grid from '@mui/material/Grid';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { Form, SubmitButton } from '@/components/form/Form';
import { RHFDateField } from '@/components/form/RHFDateField';
import { RHFPasswordField } from '@/components/form/RHFPasswordField';
import { RHFTextField } from '@/components/form/RHFTextField';
import { useApiForm } from '@/components/form/useApiForm';
import { auth } from '@/lib/http';
import { PASSWORD_MIN_LENGTH } from '@/schemas/rules';
import {
  registerJobSeekerSchema,
  toRegisterJobSeekerRequest,
  type RegisterJobSeekerInput,
  type RegisterJobSeekerValues,
} from '@/schemas/auth';

import { FormSection } from './FormSection';

export function RegisterJobSeekerForm() {
  const t = useTranslations();
  const router = useRouter();
  const schema = useMemo(() => registerJobSeekerSchema(t), [t]);

  const submit = useCallback(
    async (values: RegisterJobSeekerValues) => {
      await auth('register/jobseeker', {
        method: 'POST',
        body: toRegisterJobSeekerRequest(values),
      });

      router.replace('/profile');
      router.refresh();
    },
    [router],
  );

  const form = useApiForm<RegisterJobSeekerInput, RegisterJobSeekerValues>({
    schema,
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      nationalId: '',
      dateOfBirth: null,
    },
    onSubmit: submit,
  });

  return (
    <Form form={form}>
      <FormSection title={t('auth.register.accountSection')}>
        <RHFTextField<RegisterJobSeekerInput>
          name="email"
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          autoFocus
        />
        <RHFPasswordField<RegisterJobSeekerInput>
          name="password"
          label={t('auth.password')}
          autoComplete="new-password"
          hint={t('auth.passwordHint', { min: PASSWORD_MIN_LENGTH })}
        />
      </FormSection>

      <FormSection title={t('auth.register.personalSection')}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFTextField<RegisterJobSeekerInput>
              name="firstName"
              label={t('auth.firstName')}
              autoComplete="given-name"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFTextField<RegisterJobSeekerInput>
              name="lastName"
              label={t('auth.lastName')}
              autoComplete="family-name"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFTextField<RegisterJobSeekerInput>
              name="nationalId"
              label={t('auth.nationalId')}
              hint={t('auth.nationalIdHint')}
              inputMode="numeric"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFDateField<RegisterJobSeekerInput>
              name="dateOfBirth"
              label={t('auth.dateOfBirth')}
              maxDate={new Date()}
            />
          </Grid>
        </Grid>
      </FormSection>

      <SubmitButton busy={form.formState.isSubmitting} fullWidth sx={{ mt: 1 }}>
        {t('auth.register.submit')}
      </SubmitButton>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
        {t('auth.register.haveAccount')} <MuiLink href="/login">{t('auth.register.signIn')}</MuiLink>
      </Typography>
    </Form>
  );
}
