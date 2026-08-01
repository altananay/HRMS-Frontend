'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Grid from '@mui/material/Grid';
import { useTranslations } from 'next-intl';

import { Form, SubmitButton } from '@/components/form/Form';
import { RHFDateField } from '@/components/form/RHFDateField';
import { RHFTextField } from '@/components/form/RHFTextField';
import { useApiForm } from '@/components/form/useApiForm';
import type { JobSeekerResponse } from '@/contracts/responses';
import { api } from '@/lib/http';
import {
  fromJobSeeker,
  jobSeekerProfileSchema,
  toUpdateJobSeekerRequest,
  type JobSeekerProfileInput,
  type JobSeekerProfileValues,
} from '@/schemas/profile';

export function ProfileForm({ seeker }: { seeker: JobSeekerResponse }) {
  const t = useTranslations();
  const router = useRouter();

  const schema = useMemo(() => jobSeekerProfileSchema(t), [t]);
  const defaultValues = useMemo(() => fromJobSeeker(seeker), [seeker]);

  const submit = useCallback(
    async (values: JobSeekerProfileValues) => {
      await api('JobSeekers/update', { method: 'PUT', body: toUpdateJobSeekerRequest(values) });
      router.refresh();
    },
    [router],
  );

  const form = useApiForm<JobSeekerProfileInput, JobSeekerProfileValues>({
    schema,
    defaultValues,
    onSubmit: submit,
    successMessage: t('profile.saved'),
  });

  return (
    <Form form={form}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <RHFTextField<JobSeekerProfileInput>
            name="firstName"
            label={t('auth.firstName')}
            autoComplete="given-name"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <RHFTextField<JobSeekerProfileInput>
            name="lastName"
            label={t('auth.lastName')}
            autoComplete="family-name"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <RHFTextField<JobSeekerProfileInput>
            name="email"
            label={t('auth.email')}
            type="email"
            autoComplete="email"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <RHFDateField<JobSeekerProfileInput>
            name="dateOfBirth"
            label={t('auth.dateOfBirth')}
            maxDate={new Date()}
          />
        </Grid>
      </Grid>

      <SubmitButton busy={form.formState.isSubmitting} sx={{ alignSelf: 'flex-start', mt: 1 }}>
        {t('profile.save')}
      </SubmitButton>
    </Form>
  );
}
