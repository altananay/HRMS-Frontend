import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getFormatter, getTranslations } from 'next-intl/server';

import { ApplicationStatusChip } from '@/components/applications/ApplicationStatusChip';
import { PanelLayout } from '@/components/panel/PanelLayout';
import { jobSeekerNav } from '@/components/panel/jobseeker-nav';
import { Role } from '@/contracts/enums';
import type { JobApplicationResponse } from '@/contracts/responses';
import { requireRole } from '@/server/guard';
import { fetchMine } from '@/server/queries';

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('applications');
  return { title: t('detailTitle') };
}

/**
 * One application.
 *
 * `GetByIdJobApplicationQuery` takes `RequestedBy` from the token and refuses anyone who is not a
 * party to it, so a guessed id gets a 403 — which `fetchMine` turns into `null` and this turns into a
 * 404. Not found and not yours look identical from here, which is the right amount to tell someone
 * probing for other people's applications.
 */
export default async function ApplicationDetailPage({ params }: Params) {
  await requireRole(Role.JobSeeker);

  const { id } = await params;

  const [t, format, nav, application] = await Promise.all([
    getTranslations('applications'),
    getFormatter(),
    jobSeekerNav(),
    fetchMine<JobApplicationResponse>(`JobApplications/getbyid/${id}`),
  ]);

  if (!application) notFound();

  return (
    <PanelLayout title={t('detailTitle')} items={nav}>
      <Button
        href="/profile/applications"
        startIcon={<ArrowBackRoundedIcon />}
        color="inherit"
        sx={{ mb: 2, px: 1 }}
      >
        {t('backToApplications')}
      </Button>

      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Stack spacing={3}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-start' } }}
            >
              <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                <Typography variant="h5">{application.jobAdvertisementTitle}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('appliedAt', {
                    date: format.dateTime(new Date(application.createdAt), 'long'),
                  })}
                </Typography>
                {application.statusChangedAt ? (
                  <Typography variant="caption" color="text.secondary">
                    {t('statusChangedAt', {
                      date: format.dateTime(new Date(application.statusChangedAt), 'long'),
                    })}
                  </Typography>
                ) : null}
              </Stack>

              <ApplicationStatusChip status={application.status} size="medium" />
            </Stack>

            {application.jobSeekerNote ? (
              <>
                <Divider />
                <Stack spacing={0.75}>
                  <Typography variant="overline" color="text.secondary">
                    {t('yourNote')}
                  </Typography>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                    {application.jobSeekerNote}
                  </Typography>
                </Stack>
              </>
            ) : null}

            {application.employerNote ? (
              <>
                <Divider />
                <Stack spacing={0.75}>
                  <Typography variant="overline" color="text.secondary">
                    {t('employerNote')}
                  </Typography>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                    {application.employerNote}
                  </Typography>
                </Stack>
              </>
            ) : null}

            <Divider />

            <Button
              href={`/jobs/${application.jobAdvertisementId}`}
              variant="outlined"
              sx={{ alignSelf: 'flex-start' }}
            >
              {t('viewJob')}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </PanelLayout>
  );
}
