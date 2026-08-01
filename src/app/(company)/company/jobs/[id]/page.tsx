import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getFormatter, getTranslations } from 'next-intl/server';

import { ApplicationRow } from '@/components/company/ApplicationRow';
import { DeleteJobButton } from '@/components/company/DeleteJobButton';
import { isDeadlinePassed } from '@/components/jobs/deadline';
import { formatSalary } from '@/components/jobs/salary';
import { PanelLayout } from '@/components/panel/PanelLayout';
import { companyNav } from '@/components/panel/company-nav';
import { EmptyState } from '@/components/ui/EmptyState';
import { Role } from '@/contracts/enums';
import type { PagedResult } from '@/contracts/envelope';
import type { JobAdvertisementResponse, JobApplicationResponse } from '@/contracts/responses';
import { requireRole } from '@/server/guard';
import { fetchMine } from '@/server/queries';

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('company');
  return { title: t('jobDetailTitle') };
}

export default async function CompanyJobDetailPage({ params }: Params) {
  const employer = await requireRole(Role.Employer);
  const { id } = await params;

  const [t, tJobs, format, nav, job] = await Promise.all([
    getTranslations('company'),
    getTranslations('jobs'),
    getFormatter(),
    companyNav(),
    fetchMine<JobAdvertisementResponse>(`JobAdvertisements/getbyid/${id}`),
  ]);

  if (!job || job.employerId !== employer.id) notFound();

  const applications = await fetchMine<PagedResult<JobApplicationResponse>>(
    'JobApplications/getall',
    { jobAdvertisementId: job.id, pageSize: 100 },
  );

  const rows = applications?.items ?? [];
  const closed = isDeadlinePassed(job.deadline);

  return (
    <PanelLayout
      title={job.title}
      description={`${job.jobPositionName} · ${formatSalary(job, format, tJobs)}`}
      items={nav}
      actions={
        <Stack direction="row" spacing={1}>
          <Button href={`/company/jobs/${job.id}/edit`} variant="contained">
            {t('edit')}
          </Button>
          <DeleteJobButton jobId={job.id} />
        </Stack>
      }
    >
      <Button
        href="/company/jobs"
        startIcon={<ArrowBackRoundedIcon />}
        color="inherit"
        sx={{ mb: 2, px: 1 }}
      >
        {t('backToJobs')}
      </Button>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, mb: 2 }}>
            <Chip
              label={job.isActive ? t('active') : t('inactive')}
              size="small"
              color={job.isActive ? 'success' : 'default'}
            />
            {closed ? <Chip label={tJobs('closed')} size="small" color="warning" /> : null}
            <Chip label={tJobs(`jobType.${job.jobType}`)} size="small" variant="outlined" />
            <Chip label={job.city ?? tJobs('remoteCity')} size="small" variant="outlined" />
            <Chip
              label={tJobs('deadline', {
                date: format.dateTime(new Date(job.deadline), 'long'),
              })}
              size="small"
              variant="outlined"
            />
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Typography sx={{ whiteSpace: 'pre-wrap' }}>{job.description}</Typography>

          {job.skills.length > 0 ? (
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, mt: 2 }}>
              {job.skills.map((skill) => (
                <Chip key={skill} label={skill} size="small" />
              ))}
            </Stack>
          ) : null}
        </CardContent>
      </Card>

      <Typography variant="h5" sx={{ mb: 2 }}>
        {t('applicationsTitle')}
      </Typography>

      {rows.length === 0 ? (
        <EmptyState title={t('applicationsEmpty')} icon={<InboxOutlinedIcon />} />
      ) : (
        <Stack spacing={2}>
          {rows.map((application) => (
            <ApplicationRow key={application.id} application={application} showJob={false} />
          ))}
        </Stack>
      )}
    </PanelLayout>
  );
}
