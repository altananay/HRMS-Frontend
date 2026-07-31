'use client';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { RHFTagsField } from '@/components/form/RHFTagsField';
import { RHFTextField } from '@/components/form/RHFTextField';
import type { CvInput } from '@/schemas/cv';

export function CvBasicsStep() {
  const t = useTranslations('cv');

  return (
    <Stack spacing={1}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {t('basicsHint')}
      </Typography>

      <RHFTextField<CvInput>
        name="information"
        label={t('information')}
        multiline
        minRows={4}
      />

      <RHFTagsField<CvInput>
        name="skills"
        label={t('skills')}
        placeholder={t('skillsPlaceholder')}
      />

      <RHFTextField<CvInput> name="hobbies" label={t('hobbies')} multiline minRows={2} />

      <Typography variant="overline" color="text.secondary" sx={{ pt: 2 }}>
        {t('social')}
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <RHFTextField<CvInput>
            name="socialMedia.github"
            label={t('github')}
            placeholder="https://github.com/"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <RHFTextField<CvInput>
            name="socialMedia.linkedin"
            label={t('linkedin')}
            placeholder="https://linkedin.com/in/"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <RHFTextField<CvInput>
            name="socialMedia.webSite"
            label={t('website')}
            placeholder="https://"
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
