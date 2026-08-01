'use client';

import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import { useController, useFieldArray, useFormContext } from 'react-hook-form';

import { FieldArrayCard, FieldArraySection } from '@/components/form/FieldArrayCard';
import { RHFTextField } from '@/components/form/RHFTextField';
import { LanguageLevel, languageLevelOrder } from '@/contracts/enums';
import type { CvInput } from '@/schemas/cv';

export function CvExtrasStep() {
  const t = useTranslations('cv');
  const { control } = useFormContext<CvInput>();

  const languages = useFieldArray<CvInput, 'languages'>({ control, name: 'languages' });
  const projects = useFieldArray<CvInput, 'projects'>({ control, name: 'projects' });

  return (
    <Stack spacing={5}>
      <Stack spacing={2}>
        <Typography variant="h6">{t('languages')}</Typography>

        <FieldArraySection
          isEmpty={languages.fields.length === 0}
          emptyLabel={t('languagesEmpty')}
          addLabel={t('addLanguage')}
          onAdd={() => languages.append({ name: '', level: LanguageLevel.Intermediate })}
        >
          {languages.fields.map((field, index) => (
            <FieldArrayCard
              key={field.id}
              index={index}
              label={t('languageName')}
              removeLabel={t('remove')}
              onRemove={() => languages.remove(index)}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RHFTextField<CvInput>
                    name={`languages.${index}.name`}
                    label={t('languageName')}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <LanguageLevelSelect index={index} />
                </Grid>
              </Grid>
            </FieldArrayCard>
          ))}
        </FieldArraySection>
      </Stack>

      <Stack spacing={2}>
        <Typography variant="h6">{t('projects')}</Typography>

        <FieldArraySection
          isEmpty={projects.fields.length === 0}
          emptyLabel={t('projectsEmpty')}
          addLabel={t('addProject')}
          onAdd={() => projects.append({ name: '', description: '' })}
        >
          {projects.fields.map((field, index) => (
            <FieldArrayCard
              key={field.id}
              index={index}
              label={t('projectName')}
              removeLabel={t('remove')}
              onRemove={() => projects.remove(index)}
            >
              <Stack spacing={1}>
                <RHFTextField<CvInput> name={`projects.${index}.name`} label={t('projectName')} />
                <RHFTextField<CvInput>
                  name={`projects.${index}.description`}
                  label={t('projectDescription')}
                  multiline
                  minRows={2}
                />
              </Stack>
            </FieldArrayCard>
          ))}
        </FieldArraySection>
      </Stack>
    </Stack>
  );
}

function LanguageLevelSelect({ index }: { index: number }) {
  const t = useTranslations('cv.level');
  const { field, fieldState } = useController<CvInput>({ name: `languages.${index}.level` });

  return (
    <TextField
      select
      fullWidth
      label={useTranslations('cv')('languageLevel')}
      value={field.value ?? LanguageLevel.Intermediate}
      onChange={field.onChange}
      onBlur={field.onBlur}
      error={Boolean(fieldState.error)}
      helperText={fieldState.error?.message ?? ' '}
    >
      {languageLevelOrder.map((level) => (
        <MenuItem key={level} value={level}>
          {t(level)}
        </MenuItem>
      ))}
    </TextField>
  );
}
