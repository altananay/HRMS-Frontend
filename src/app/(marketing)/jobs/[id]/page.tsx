import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getFormatter, getTranslations } from 'next-intl/server';

import { CompanyAvatar } from '@/components/companies/CompanyAvatar';
import { isDeadlinePassed } from '@/components/jobs/deadline';
import { formatSalary } from '@/components/jobs/salary';
import type { JobAdvertisementResponse } from '@/contracts/responses';
import { fetchPublic } from '@/server/queries';
import { getSession } from '@/server/session';

type Params = { params: Promise<{ id: string }> };

async function loadJob(id: string) {
  return fetchPublic<JobAdvertisementResponse>(`JobAdvertisements/getbyid/${id}`);
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const job = await loadJob(id);

  if (!job) return {};

  return {
    title: `${job.title} · ${job.companyName}`,
    description: job.description.slice(0, 160),
  };
}

export default async function JobDetailPage({ params }: Params) {
  const { id } = await params;
  const [job, t, format, user] = await Promise.all([
    loadJob(id),
    getTranslations('jobs'),
    getFormatter(),
    getSession(),
  ]);

  if (!job) notFound();

  const deadline = new Date(job.deadline);
  const isClosed = isDeadlinePassed(job.deadline);
  const salary = formatSalary(job, format, t);

  return (
    <Container sx={{ py: { xs: 4, md: 7 } }}>
      <Button href="/jobs" startIcon={<ArrowBackRoundedIcon />} color="inherit" sx={{ mb: 3, px: 1 }}>
        {t('backToJobs')}
      </Button>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack direction="row" spacing={2.5} sx={{ mb: 3, alignItems: 'flex-start' }}>
            <CompanyAvatar name={job.companyName} size={64} />

            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h2" component="h1" sx={{ mb: 1 }}>
                {job.title}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {job.companyName} · {job.jobPositionName}
              </Typography>
            </Box>
          </Stack>

          {!job.isActive ? (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {t('inactive')}
            </Alert>
          ) : isClosed ? (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {t('closed')}
            </Alert>
          ) : null}

          <Typography variant="h4" sx={{ mb: 1.5 }}>
            {t('aboutRole')}
          </Typography>
          <Typography sx={{ whiteSpace: 'pre-wrap', mb: 4 }}>{job.description}</Typography>

          {job.skills.length > 0 ? (
            <>
              <Typography variant="h4" sx={{ mb: 1.5 }}>
                {t('requiredSkills')}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, mb: 4 }}>
                {job.skills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    component="a"
                    href={`/jobs?skill=${encodeURIComponent(skill)}`}
                    clickable
                  />
                ))}
              </Stack>
            </>
          ) : null}

          {job.experience ? (
            <>
              <Typography variant="h4" sx={{ mb: 1.5 }}>
                {t('experience')}
              </Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{job.experience}</Typography>
            </>
          ) : null}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ position: { md: 'sticky' }, top: { md: 96 } }}>
            <CardContent>
              <Stack spacing={2}>
                <Fact icon={<PaymentsOutlinedIcon />} value={salary} />
                <Fact icon={<LocationOnOutlinedIcon />} value={job.city ?? t('remoteCity')} />
                <Fact icon={<WorkOutlineRoundedIcon />} value={t(`jobType.${job.jobType}`)} />
                <Fact
                  icon={<GroupsOutlinedIcon />}
                  value={t('openPositions', { count: job.openPositions })}
                />
                <Fact
                  icon={<AccessTimeRoundedIcon />}
                  value={t('deadline', { date: format.dateTime(deadline, 'long') })}
                />
                <Fact
                  icon={<BadgeOutlinedIcon />}
                  value={t('postedAt', {
                    date: format.dateTime(new Date(job.createdAt), 'long'),
                  })}
                />
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Button
                href={user ? `/profile/applications/new?jobId=${job.id}` : `/login?next=/jobs/${job.id}`}
                variant="contained"
                size="large"
                fullWidth
                disabled={isClosed || !job.isActive}
              >
                {user ? t('applyNow') : t('applySignIn')}
              </Button>

              <Button
                href={`/companies/${job.employerId}`}
                variant="outlined"
                fullWidth
                sx={{ mt: 1.5 }}
              >
                {t('viewCompany')}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

function Fact({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
      <Box sx={{ color: 'text.disabled', display: 'flex', '& svg': { fontSize: 20 } }}>{icon}</Box>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}
