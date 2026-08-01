import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';

import { JobCard } from '@/components/jobs/JobCard';
import type { PagedResult } from '@/contracts/envelope';
import type { JobAdvertisementResponse } from '@/contracts/responses';
import { fetchPublic } from '@/server/queries';

export async function LatestJobs() {
  const [result, t] = await Promise.all([
    fetchPublic<PagedResult<JobAdvertisementResponse>>('JobAdvertisements/getall', {
      isActive: true,
      pageSize: 4,
    }),
    getTranslations('latest'),
  ]);

  const jobs = result?.items ?? [];

  if (jobs.length === 0) return null;

  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.subtle' }}>
      <Container>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            mb: { xs: 4, md: 6 },
            justifyContent: 'space-between',
            alignItems: { sm: 'flex-end' },
          }}
        >
          <Stack spacing={1.5} sx={{ maxWidth: '52ch' }}>
            <Typography variant="h2">{t('title')}</Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {t('subtitle')}
            </Typography>
          </Stack>

          <Button href="/jobs" endIcon={<ArrowForwardRoundedIcon />} sx={{ flexShrink: 0 }}>
            {t('viewAll')}
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {jobs.map((job) => (
            <Grid key={job.id} size={{ xs: 12, md: 6 }}>
              <JobCard job={job} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
