'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useTranslations } from 'next-intl';
import { useController } from 'react-hook-form';
import { z } from 'zod';

import { Form, SubmitButton } from '@/components/form/Form';
import { RHFTextField } from '@/components/form/RHFTextField';
import { useApiForm } from '@/components/form/useApiForm';
import { JobApplicationStatus, jobApplicationStatusOrder } from '@/contracts/enums';
import type { JobApplicationResponse } from '@/contracts/responses';
import { api } from '@/lib/http';
import { MAX, optionalText, type Translate } from '@/schemas/rules';

function statusSchema(t: Translate) {
  return z.object({
    status: z.enum(Object.values(JobApplicationStatus) as [string, ...string[]]),
    employerNote: optionalText(t, MAX.note),
  });
}

type Values = z.output<ReturnType<typeof statusSchema>>;
type Input = z.input<ReturnType<typeof statusSchema>>;

export function ApplicationStatusForm({ application }: { application: JobApplicationResponse }) {
  const t = useTranslations('company');
  const tRoot = useTranslations();
  const router = useRouter();

  const schema = useMemo(() => statusSchema(tRoot), [tRoot]);

  const submit = useCallback(
    async (values: Values) => {
      await api('JobApplications/update', {
        method: 'PUT',
        body: {
          id: application.id,
          status: values.status,
          employerNote: values.employerNote ?? null,
        },
      });

      router.refresh();
    },
    [application.id, router],
  );

  const form = useApiForm<Input, Values>({
    schema,
    defaultValues: {
      status: application.status,
      employerNote: application.employerNote ?? '',
    },
    onSubmit: submit,
    successMessage: t('statusSaved'),
  });

  return (
    <Form form={form}>
      <StatusSelect />

      <RHFTextField<Input>
        name="employerNote"
        label={t('employerNote')}
        hint={t('employerNoteHint')}
        multiline
        minRows={3}
      />

      <SubmitButton busy={form.formState.isSubmitting} sx={{ alignSelf: 'flex-start', mt: 1 }}>
        {t('updateStatus')}
      </SubmitButton>
    </Form>
  );
}

function StatusSelect() {
  const t = useTranslations('applications.status');
  const label = useTranslations('company')('status');
  const { field, fieldState } = useController<Input>({ name: 'status' });

  return (
    <TextField
      select
      fullWidth
      label={label}
      value={field.value ?? JobApplicationStatus.Submitted}
      onChange={field.onChange}
      onBlur={field.onBlur}
      error={Boolean(fieldState.error)}
      helperText={fieldState.error?.message ?? ' '}
    >
      {jobApplicationStatusOrder.map((status) => (
        <MenuItem key={status} value={status}>
          {t(status)}
        </MenuItem>
      ))}
    </TextField>
  );
}
