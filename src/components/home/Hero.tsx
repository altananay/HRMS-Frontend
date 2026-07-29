import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';

import { gradients } from '@/theme/palette';
import { darkScheme } from '@/theme/tokens';

import { JobSearchForm } from './JobSearchForm';
import { PipelinePreview } from './PipelinePreview';

export async function Hero() {
  const t = await getTranslations('home.hero');

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        // Pull up under the transparent header instead of leaving a white strip above the gradient.
        mt: { xs: -8, md: -9.5 },
        pt: { xs: 14, md: 20 },
        pb: { xs: 8, md: 14 },
        backgroundImage: gradients.heroLight,
        [darkScheme]: { backgroundImage: gradients.heroDark },
      }}
    >
      {/*
        A faint dot grid over the gradient. Purely decorative and mask-faded at the bottom edge so it
        dissolves into the next section rather than stopping on a hard line.
      */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(currentColor 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          color: 'text.primary',
          opacity: 0.06,
          maskImage: 'linear-gradient(to bottom, black 20%, transparent 85%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 85%)',
          pointerEvents: 'none',
        }}
      />

      <Container sx={{ position: 'relative' }}>
        <Grid container spacing={{ xs: 6, md: 8 }} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Chip
              label={t('eyebrow')}
              size="small"
              variant="outlined"
              icon={<BusinessCenterOutlinedIcon />}
              sx={{
                mb: 3,
                bgcolor: 'background.paper',
                fontWeight: 500,
                '& .MuiChip-icon': { color: 'primary.main' },
              }}
            />

            <Typography variant="h1" sx={{ mb: 3 }}>
              {t('titleLead')}{' '}
              <Box
                component="span"
                sx={{
                  // `background-clip: text` needs a transparent fill; the fallback colour is what
                  // shows if a browser refuses the clip, so it must be readable on its own.
                  color: 'primary.main',
                  backgroundImage: gradients.brandText,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  '@supports (-webkit-background-clip: text)': { color: 'transparent' },
                  [darkScheme]: { backgroundImage: gradients.brandTextDark },
                }}
              >
                {t('titleHighlight')}
              </Box>{' '}
              {t('titleTail')}
            </Typography>

            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: '52ch' }}
            >
              {t('subtitle')}
            </Typography>

            <JobSearchForm />

            <Stack direction="row" spacing={1} sx={{ mt: 3, flexWrap: 'wrap', rowGap: 1 }}>
              <Button
                href="/jobs"
                size="large"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{ px: 0, '&:hover': { background: 'transparent' } }}
              >
                {t('browseJobs')}
              </Button>

              <Button
                href="/register/employer"
                size="large"
                color="inherit"
                sx={{ color: 'text.secondary', px: 2 }}
              >
                {t('forEmployers')}
              </Button>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <PipelinePreview />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
