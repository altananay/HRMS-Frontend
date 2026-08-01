'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { FieldArrayCard, FieldArraySection } from '@/components/form/FieldArrayCard';
import { Form, SubmitButton } from '@/components/form/Form';
import { RHFTagsField } from '@/components/form/RHFTagsField';
import { RHFTextField } from '@/components/form/RHFTextField';
import { useApiForm } from '@/components/form/useApiForm';
import type { EmployerDetailResponse } from '@/contracts/responses';
import { api } from '@/lib/http';
import {
  employerProfileSchema,
  fromEmployer,
  toUpdateEmployerRequest,
  type EmployerProfileInput,
  type EmployerProfileValues,
} from '@/schemas/employer';

export function EmployerProfileForm({ employer }: { employer: EmployerDetailResponse }) {
  const t = useTranslations('company');
  const tRoot = useTranslations();
  const router = useRouter();

  const schema = useMemo(() => employerProfileSchema(tRoot), [tRoot]);
  const defaultValues = useMemo(() => fromEmployer(employer), [employer]);

  const submit = useCallback(
    async (values: EmployerProfileValues) => {
      await api('Employers/update', { method: 'PUT', body: toUpdateEmployerRequest(values) });
      router.refresh();
    },
    [router],
  );

  const form = useApiForm<EmployerProfileInput, EmployerProfileValues>({
    schema,
    defaultValues,
    onSubmit: submit,
    successMessage: t('profileSaved'),
  });

  return (
    <Form form={form}>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <RHFTextField<EmployerProfileInput>
                name="companyName"
                label={tRoot('auth.companyName')}
                autoComplete="organization"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFTextField<EmployerProfileInput>
                name="companyPhone"
                label={tRoot('auth.companyPhone')}
                autoComplete="tel"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFTextField<EmployerProfileInput>
                name="webSite"
                label={tRoot('auth.webSite')}
                placeholder="https://"
                autoComplete="url"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFTextField<EmployerProfileInput>
                name="numberOfEmployees"
                label={tRoot('auth.numberOfEmployees')}
                inputMode="numeric"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFTagsField<EmployerProfileInput>
                name="sectors"
                label={tRoot('auth.sectors')}
                placeholder={tRoot('auth.sectorsPlaceholder')}
              />
            </Grid>
            <Grid size={12}>
              <RHFTextField<EmployerProfileInput>
                name="description"
                label={tRoot('auth.description')}
                multiline
                minRows={4}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            {t('departments')}
          </Typography>

          <Departments />
        </CardContent>
      </Card>

      <SubmitButton busy={form.formState.isSubmitting} sx={{ alignSelf: 'flex-start', mt: 3 }}>
        {tRoot('profile.save')}
      </SubmitButton>
    </Form>
  );
}

function Departments() {
  const t = useTranslations('company');
  const { control } = useFormContext<EmployerProfileInput>();
  const { fields, append, remove } = useFieldArray<EmployerProfileInput, 'departments'>({
    control,
    name: 'departments',
  });

  return (
    <FieldArraySection
      isEmpty={fields.length === 0}
      emptyLabel={t('departmentsEmpty')}
      addLabel={t('addDepartment')}
      onAdd={() => append({ name: '', numberOfEmployees: '' })}
    >
      <Stack spacing={2}>
        {fields.map((field, index) => (
          <FieldArrayCard
            key={field.id}
            index={index}
            label={t('departmentName')}
            removeLabel={t('delete')}
            onRemove={() => remove(index)}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <RHFTextField<EmployerProfileInput>
                  name={`departments.${index}.name`}
                  label={t('departmentName')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RHFTextField<EmployerProfileInput>
                  name={`departments.${index}.numberOfEmployees`}
                  label={t('departmentSize')}
                  inputMode="numeric"
                />
              </Grid>
            </Grid>
          </FieldArrayCard>
        ))}
      </Stack>
    </FieldArraySection>
  );
}
