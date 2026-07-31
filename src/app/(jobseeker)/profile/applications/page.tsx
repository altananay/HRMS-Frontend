import type { Metadata } from 'next';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getFormatter, getTranslations } from 'next-intl/server';

import { ApplicationStatusChip } from '@/components/applications/ApplicationStatusChip';
import { PanelLayout } from '@/components/panel/PanelLayout';
import { jobSeekerNav } from '@/components/panel/jobseeker-nav';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Role } from '@/contracts/enums';
import type { PagedResult } from '@/contracts/envelope';
import type { JobApplicationResponse } from '@/contracts/responses';
import { requireRole } from '@/server/guard';
import { emptyPage, fetchMine } from '@/server/queries';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('applications');
  return { title: t('title') };
}

const PAGE_SIZE = 15;

/**
 * The applicant's own applications.
 *
 * No `jobSeekerId` filter is sent, and none would help: `JobApplicationsController.GetAll` overwrites
 * it from the bearer token for this role. The scoping is the server's, which is what makes it a
 * security property rather than a query parameter.
 */
export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(Role.JobSeeker);

  const params = await searchParams;
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Math.max(1, Number(rawPage ?? 1) || 1);

  const [t, format, nav, result] = await Promise.all([
    getTranslations('applications'),
    getFormatter(),
    jobSeekerNav(),
    fetchMine<PagedResult<JobApplicationResponse>>('JobApplications/getall', {
      page,
      pageSize: PAGE_SIZE,
    }),
  ]);

  const applications = result ?? emptyPage<JobApplicationResponse>(PAGE_SIZE);

  return (
    <PanelLayout title={t('title')} description={t('subtitle')} items={nav}>
      {applications.items.length === 0 ? (
        <EmptyState
          title={t('empty')}
          description={t('emptyHint')}
          icon={<SendOutlinedIcon />}
          action={
            <Button href="/jobs" variant="contained">
              {t('viewJob')}
            </Button>
          }
        />
      ) : (
        <>
          <Stack spacing={2}>
            {applications.items.map((application) => (
              <Card key={application.id}>
                <CardActionArea href={`/profile/applications/${application.id}`}>
                  <CardContent>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1.5}
                      sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
                    >
                      <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {application.jobAdvertisementTitle}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('appliedAt', {
                            date: format.dateTime(new Date(application.createdAt), 'short'),
                          })}
                        </Typography>
                      </Stack>

                      <ApplicationStatusChip status={application.status} />
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>

          <Pagination
            page={applications.page}
            totalPages={applications.totalPages}
            basePath="/profile/applications"
            searchParams={params}
          />
        </>
      )}
    </PanelLayout>
  );
}
