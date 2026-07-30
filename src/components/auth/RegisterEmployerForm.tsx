'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Grid from '@mui/material/Grid';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { Form, SubmitButton } from '@/components/form/Form';
import { RHFPasswordField } from '@/components/form/RHFPasswordField';
import { RHFTagsField } from '@/components/form/RHFTagsField';
import { RHFTextField } from '@/components/form/RHFTextField';
import { useApiForm } from '@/components/form/useApiForm';
import { auth } from '@/lib/http';
import { PASSWORD_MIN_LENGTH } from '@/schemas/rules';
import {
  registerEmployerSchema,
  toRegisterEmployerRequest,
  type RegisterEmployerInput,
  type RegisterEmployerValues,
} from '@/schemas/auth';

import { FormSection } from './FormSection';

export function RegisterEmployerForm() {
  const t = useTranslations();
  const router = useRouter();
  const schema = useMemo(() => registerEmployerSchema(t), [t]);

  const submit = useCallback(
    async (values: RegisterEmployerValues) => {
      await auth('register/employer', { method: 'POST', body: toRegisterEmployerRequest(values) });

      router.replace('/company');
      router.refresh();
    },
    [router],
  );

  const form = useApiForm<RegisterEmployerInput, RegisterEmployerValues>({
    schema,
    defaultValues: {
      email: '',
      password: '',
      companyName: '',
      companyPhone: '',
      webSite: '',
      description: '',
      numberOfEmployees: '',
      sectors: [],
    },
    onSubmit: submit,
  });

  return (
    <Form form={form}>
      <FormSection title={t('auth.register.accountSection')}>
        <RHFTextField<RegisterEmployerInput>
          name="email"
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          autoFocus
        />
        <RHFPasswordField<RegisterEmployerInput>
          name="password"
          label={t('auth.password')}
          autoComplete="new-password"
          hint={t('auth.passwordHint', { min: PASSWORD_MIN_LENGTH })}
        />
      </FormSection>

      <FormSection title={t('auth.register.companySection')}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <RHFTextField<RegisterEmployerInput>
              name="companyName"
              label={t('auth.companyName')}
              autoComplete="organization"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFTextField<RegisterEmployerInput>
              name="companyPhone"
              label={t('auth.companyPhone')}
              autoComplete="tel"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFTextField<RegisterEmployerInput>
              name="webSite"
              label={t('auth.webSite')}
              placeholder="https://"
              autoComplete="url"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {/* `type="number"` deliberately not used: it silently drops non-numeric input, so a typo
                clears the box with no message. The schema reports it instead. */}
            <RHFTextField<RegisterEmployerInput>
              name="numberOfEmployees"
              label={t('auth.numberOfEmployees')}
              inputMode="numeric"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFTagsField<RegisterEmployerInput>
              name="sectors"
              label={t('auth.sectors')}
              placeholder={t('auth.sectorsPlaceholder')}
            />
          </Grid>
          <Grid size={12}>
            <RHFTextField<RegisterEmployerInput>
              name="description"
              label={t('auth.description')}
              multiline
              minRows={3}
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
