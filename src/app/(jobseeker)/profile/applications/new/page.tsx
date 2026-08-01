import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';

import { ApplyForm } from '@/components/applications/ApplyForm';
import { CompanyAvatar } from '@/components/companies/CompanyAvatar';
import { isDeadlinePassed } from '@/components/jobs/deadline';
import { PanelLayout } from '@/components/panel/PanelLayout';
import { jobSeekerNav } from '@/components/panel/jobseeker-nav';
import { Role } from '@/contracts/enums';
import type { JobAdvertisementResponse } from '@/contracts/responses';
import { requireRole } from '@/server/guard';
import { fetchPublic } from '@/server/queries';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('applications');
  return { title: t('newTitle') };
}

export default async function NewApplicationPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string }>;
}) {
  await requireRole(Role.JobSeeker);

  const { jobId } = await searchParams;

  if (!jobId) notFound();

  const [t, nav, job] = await Promise.all([
    getTranslations('applications'),
    jobSeekerNav(),
    fetchPublic<JobAdvertisementResponse>(`JobAdvertisements/getbyid/${jobId}`),
  ]);

  if (!job || !job.isActive || isDeadlinePassed(job.deadline)) notFound();

  return (
    <PanelLayout title={t('newTitle')} description={t('newSubtitle')} items={nav}>
      <Stack spacing={3}>
        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <CompanyAvatar name={job.companyName} />
              <Stack sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {job.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {job.companyName}
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <ApplyForm jobAdvertisementId={job.id} />
          </CardContent>
        </Card>
      </Stack>
    </PanelLayout>
  );
}
