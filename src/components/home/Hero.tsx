import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
        mt: { xs: -8, md: -9.5 },
        pt: { xs: 14, md: 20 },
        pb: { xs: 8, md: 14 },
        backgroundImage: gradients.heroLight,
        [darkScheme]: { backgroundImage: gradients.heroDark },
      }}
    >
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

            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                mb: 3,
                px: 1.5,
                py: 0.75,
                borderRadius: 999,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                fontSize: '0.8125rem',
                fontWeight: 500,
              }}
            >
              <BusinessCenterOutlinedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              {t('eyebrow')}
            </Box>

            <Typography variant="h1" sx={{ mb: 3 }}>
              {t('titleLead')}{' '}
              <Box
                component="span"
                sx={{
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
