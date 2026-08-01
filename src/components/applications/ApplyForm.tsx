'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { Form, SubmitButton } from '@/components/form/Form';
import { RHFTextField } from '@/components/form/RHFTextField';
import { useApiForm } from '@/components/form/useApiForm';
import { api } from '@/lib/http';
import { MAX, optionalText } from '@/schemas/rules';

export function ApplyForm({ jobAdvertisementId }: { jobAdvertisementId: string }) {
  const t = useTranslations('applications');
  const tRoot = useTranslations();
  const router = useRouter();

  const schema = useMemo(
    () => z.object({ jobSeekerNote: optionalText(tRoot, MAX.note) }),
    [tRoot],
  );

  type Values = z.output<typeof schema>;
  type Input = z.input<typeof schema>;

  const submit = useCallback(
    async (values: Values) => {
      await api('JobApplications/add', {
        method: 'POST',
        body: { jobAdvertisementId, jobSeekerNote: values.jobSeekerNote ?? null },
      });

      router.push('/profile/applications');
      router.refresh();
    },
    [jobAdvertisementId, router],
  );

  const form = useApiForm<Input, Values>({
    schema,
    defaultValues: { jobSeekerNote: '' },
    onSubmit: submit,
    successMessage: t('submitted'),
  });

  return (
    <Form form={form}>
      <RHFTextField<Input>
        name="jobSeekerNote"
        label={t('note')}
        multiline
        minRows={4}
        autoFocus
      />

      <SubmitButton busy={form.formState.isSubmitting} sx={{ alignSelf: 'flex-start', mt: 1 }}>
        {t('submit')}
      </SubmitButton>
    </Form>
  );
}
