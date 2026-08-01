'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import { useController } from 'react-hook-form';

import { Form, SubmitButton } from '@/components/form/Form';
import { RHFDateField } from '@/components/form/RHFDateField';
import { RHFTagsField } from '@/components/form/RHFTagsField';
import { RHFTextField } from '@/components/form/RHFTextField';
import { useApiForm } from '@/components/form/useApiForm';
import { JobType } from '@/contracts/enums';
import type { CreatedResponse } from '@/contracts/responses';
import type { JobAdvertisementResponse } from '@/contracts/responses';
import type { DataResult } from '@/contracts/envelope';
import { api } from '@/lib/http';
import {
  emptyJobAdvertisement,
  fromJobAdvertisement,
  jobAdvertisementSchema,
  toCreateJobAdvertisementRequest,
  toUpdateJobAdvertisementRequest,
  type JobAdvertisementInput,
  type JobAdvertisementValues,
} from '@/schemas/job-advertisement';

export function JobAdvertisementForm({ job }: { job?: JobAdvertisementResponse }) {
  const t = useTranslations('company');
  const tRoot = useTranslations();
  const router = useRouter();

  const mode = job ? 'edit' : 'create';
  const schema = useMemo(() => jobAdvertisementSchema(tRoot, mode), [tRoot, mode]);
  const defaultValues = useMemo<JobAdvertisementInput>(
    () => (job ? fromJobAdvertisement(job) : emptyJobAdvertisement()),
    [job],
  );

  const submit = useCallback(
    async (values: JobAdvertisementValues) => {
      if (job) {
        await api('JobAdvertisements/update', {
          method: 'PUT',
          body: toUpdateJobAdvertisementRequest(values, job.id),
        });
        router.push(`/company/jobs/${job.id}`);
      } else {
        const created = await api<DataResult<CreatedResponse>>('JobAdvertisements/add', {
          method: 'POST',
          body: toCreateJobAdvertisementRequest(values),
        });
        router.push(created.data?.id ? `/company/jobs/${created.data.id}` : '/company/jobs');
      }

      router.refresh();
    },
    [job, router],
  );

  const form = useApiForm<JobAdvertisementInput, JobAdvertisementValues>({
    schema,
    defaultValues,
    onSubmit: submit,
    successMessage: job ? t('saved') : t('created'),
  });

  return (
    <Form form={form}>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Typography variant="overline" color="text.secondary">
            {t('form.basics')}
          </Typography>

          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 7 }}>
              <RHFTextField<JobAdvertisementInput> name="title" label={t('form.title')} autoFocus />
            </Grid>
            <Grid size={{ xs: 12, sm: 5 }}>
              <RHFTextField<JobAdvertisementInput>
                name="jobPositionName"
                label={t('form.position')}
                hint={t('form.positionHint')}
              />
            </Grid>
            <Grid size={12}>
              <RHFTextField<JobAdvertisementInput>
                name="description"
                label={t('form.description')}
                multiline
                minRows={6}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFTextField<JobAdvertisementInput> name="city" label={t('form.city')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFTagsField<JobAdvertisementInput>
                name="skills"
                label={t('form.skills')}
                placeholder={t('form.skillsPlaceholder')}
              />
            </Grid>
            <Grid size={12}>
              <RHFTextField<JobAdvertisementInput>
                name="experience"
                label={t('form.experience')}
                multiline
                minRows={2}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Typography variant="overline" color="text.secondary">
            {t('form.conditions')}
          </Typography>

          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <JobTypeSelect />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <RHFTextField<JobAdvertisementInput>
                name="openPositions"
                label={t('form.openPositions')}
                inputMode="numeric"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <RHFDateField<JobAdvertisementInput>
                name="deadline"
                label={t('form.deadline')}
                {...(mode === 'create' ? { minDate: new Date() } : {})}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <RHFTextField<JobAdvertisementInput>
                name="minSalary"
                label={t('form.minSalary')}
                inputMode="numeric"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <RHFTextField<JobAdvertisementInput>
                name="maxSalary"
                label={t('form.maxSalary')}
                inputMode="numeric"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <RHFTextField<JobAdvertisementInput>
                name="currency"
                label={t('form.currency')}
                hint={t('form.currencyHint')}
              />
            </Grid>

            {job ? (
              <Grid size={12}>
                <PublishedSwitch label={t('form.isActive')} hint={t('form.isActiveHint')} />
              </Grid>
            ) : null}
          </Grid>
        </CardContent>
      </Card>

      <SubmitButton busy={form.formState.isSubmitting} sx={{ alignSelf: 'flex-start', mt: 3 }}>
        {job ? t('form.submitEdit') : t('form.submitCreate')}
      </SubmitButton>
    </Form>
  );
}

function JobTypeSelect() {
  const t = useTranslations('jobs.jobType');
  const label = useTranslations('company')('form.jobType');
  const { field, fieldState } = useController<JobAdvertisementInput>({ name: 'jobType' });

  return (
    <TextField
      select
      fullWidth
      label={label}
      value={field.value ?? JobType.FullTime}
      onChange={field.onChange}
      onBlur={field.onBlur}
      error={Boolean(fieldState.error)}
      helperText={fieldState.error?.message ?? ' '}
    >
      {Object.values(JobType).map((type) => (
        <MenuItem key={type} value={type}>
          {t(type)}
        </MenuItem>
      ))}
    </TextField>
  );
}

function PublishedSwitch({ label, hint }: { label: string; hint: string }) {
  const { field } = useController<JobAdvertisementInput>({ name: 'isActive' });

  return (
    <Stack>
      <FormControlLabel
        control={
          <Checkbox
            checked={Boolean(field.value)}
            onChange={(event) => field.onChange(event.target.checked)}
          />
        }
        label={label}
      />
      <FormHelperText sx={{ ml: 4, mt: -0.5 }}>{hint}</FormHelperText>
    </Stack>
  );
}
