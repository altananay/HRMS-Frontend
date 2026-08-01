import type { Metadata } from 'next';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';

import { ApplicationRow } from '@/components/company/ApplicationRow';
import { PipelineChart } from '@/components/company/PipelineChart';
import { PanelLayout } from '@/components/panel/PanelLayout';
import { companyNav } from '@/components/panel/company-nav';
import { JobApplicationStatus, Role } from '@/contracts/enums';
import type { PagedResult } from '@/contracts/envelope';
import type { JobAdvertisementResponse, JobApplicationResponse } from '@/contracts/responses';
import { requireRole } from '@/server/guard';
import { fetchMine } from '@/server/queries';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('company');
  return { title: t('title') };
}

export default async function CompanyOverviewPage() {
  const employer = await requireRole(Role.Employer);

  const [t, nav, jobs, applications] = await Promise.all([
    getTranslations('company'),
    companyNav(),
    fetchMine<PagedResult<JobAdvertisementResponse>>('JobAdvertisements/getall', {
      employerId: employer.id,
      pageSize: 100,
    }),
    fetchMine<PagedResult<JobApplicationResponse>>('JobApplications/getall', { pageSize: 100 }),
  ]);

  const allJobs = jobs?.items ?? [];
  const allApplications = applications?.items ?? [];

  const counts = allApplications.reduce<Record<string, number>>((totals, application) => {
    totals[application.status] = (totals[application.status] ?? 0) + 1;
    return totals;
  }, {});

  const pending =
    (counts[JobApplicationStatus.Submitted] ?? 0) + (counts[JobApplicationStatus.UnderReview] ?? 0);

  const recent = allApplications.slice(0, 5);

  return (
    <PanelLayout
      title={t('title')}
      description={t('welcome', { name: employer.displayName })}
      items={nav}
      actions={
        <Button href="/company/jobs/new" variant="contained">
          {t('newJob')}
        </Button>
      }
    >
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Stat label={t('activeJobs')} value={allJobs.filter((job) => job.isActive).length} />
        <Stat label={t('totalJobs')} value={jobs?.totalCount ?? allJobs.length} />
        <Stat label={t('totalApplications')} value={applications?.totalCount ?? 0} />
        <Stat label={t('pendingApplications')} value={pending} highlight />
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            {t('pipelineTitle')}
          </Typography>

          {allApplications.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              {t('pipelineEmpty')}
            </Typography>
          ) : (
            <PipelineChart counts={counts} />
          )}
        </CardContent>
      </Card>

      {recent.length > 0 ? (
        <>
          <Stack
            direction="row"
            sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography variant="h5">{t('recentApplications')}</Typography>
            <Button href="/company/applications" endIcon={<ArrowForwardRoundedIcon />} size="small">
              {t('viewAllApplications')}
            </Button>
          </Stack>

          <Stack spacing={2}>
            {recent.map((application) => (
              <ApplicationRow key={application.id} application={application} />
            ))}
          </Stack>
        </>
      ) : null}
    </PanelLayout>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <Grid size={{ xs: 6, md: 3 }}>
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography
            variant="h3"
            sx={{ color: highlight && value > 0 ? 'primary.main' : 'text.primary' }}
          >
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}
