'use client';

import Grid from '@mui/material/Grid';
import { useTranslations } from 'next-intl';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { FieldArrayCard, FieldArraySection } from '@/components/form/FieldArrayCard';
import { RHFTextField } from '@/components/form/RHFTextField';
import type { CvInput } from '@/schemas/cv';

const BLANK = {
  companyName: '',
  department: '',
  position: '',
  startYear: '',
  endYear: '',
  description: '',
} as const;

export function CvExperienceStep() {
  const t = useTranslations('cv');
  const { control } = useFormContext<CvInput>();
  const { fields, append, remove } = useFieldArray<CvInput, 'jobExperiences'>({
    control,
    name: 'jobExperiences',
  });

  return (
    <FieldArraySection
      isEmpty={fields.length === 0}
      emptyLabel={t('experienceEmpty')}
      addLabel={t('addExperience')}
      onAdd={() => append(BLANK)}
    >
      {fields.map((field, index) => (
        <FieldArrayCard
          key={field.id}
          index={index}
          label={t('experience')}
          removeLabel={t('remove')}
          onRemove={() => remove(index)}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFTextField<CvInput>
                name={`jobExperiences.${index}.companyName`}
                label={t('companyName')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFTextField<CvInput>
                name={`jobExperiences.${index}.position`}
                label={t('position')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFTextField<CvInput>
                name={`jobExperiences.${index}.department`}
                label={t('department')}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <RHFTextField<CvInput>
                name={`jobExperiences.${index}.startYear`}
                label={t('startYear')}
                inputMode="numeric"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <RHFTextField<CvInput>
                name={`jobExperiences.${index}.endYear`}
                label={t('endYear')}
                hint={t('stillWorking')}
                inputMode="numeric"
              />
            </Grid>
            <Grid size={12}>
              <RHFTextField<CvInput>
                name={`jobExperiences.${index}.description`}
                label={t('experienceDescription')}
                multiline
                minRows={3}
              />
            </Grid>
          </Grid>
        </FieldArrayCard>
      ))}
    </FieldArraySection>
  );
}
