'use client';

import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import { useTranslations } from 'next-intl';
import { useController, useFieldArray, useFormContext } from 'react-hook-form';

import { FieldArrayCard, FieldArraySection } from '@/components/form/FieldArrayCard';
import { RHFTextField } from '@/components/form/RHFTextField';
import type { CvInput } from '@/schemas/cv';

const BLANK = {
  school: '',
  major: '',
  grade: '',
  startYear: '',
  endYear: '',
  isGraduated: false,
} as const;

export function CvEducationStep() {
  const t = useTranslations('cv');
  const { control } = useFormContext<CvInput>();
  const { fields, append, remove } = useFieldArray<CvInput, 'educations'>({
    control,
    name: 'educations',
  });

  return (
    <FieldArraySection
      isEmpty={fields.length === 0}
      emptyLabel={t('educationEmpty')}
      addLabel={t('addEducation')}
      onAdd={() => append(BLANK)}
    >
      {fields.map((field, index) => (
        // `field.id` is RHF's own stable key. Using `index` here would reuse a row's DOM when an
        // earlier entry is removed, and the values below would visibly jump to the wrong card.
        <FieldArrayCard
          key={field.id}
          index={index}
          label={t('education')}
          removeLabel={t('remove')}
          onRemove={() => remove(index)}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFTextField<CvInput> name={`educations.${index}.school`} label={t('school')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFTextField<CvInput> name={`educations.${index}.major`} label={t('major')} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <RHFTextField<CvInput>
                name={`educations.${index}.startYear`}
                label={t('startYear')}
                inputMode="numeric"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <RHFTextField<CvInput>
                name={`educations.${index}.endYear`}
                label={t('endYear')}
                inputMode="numeric"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <RHFTextField<CvInput> name={`educations.${index}.grade`} label={t('grade')} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <GraduatedCheckbox index={index} label={t('isGraduated')} />
            </Grid>
          </Grid>
        </FieldArrayCard>
      ))}
    </FieldArraySection>
  );
}

function GraduatedCheckbox({ index, label }: { index: number; label: string }) {
  const { field } = useController<CvInput>({ name: `educations.${index}.isGraduated` });

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={Boolean(field.value)}
          onChange={(event) => field.onChange(event.target.checked)}
          onBlur={field.onBlur}
        />
      }
      label={label}
      sx={{ mt: 1 }}
    />
  );
}
