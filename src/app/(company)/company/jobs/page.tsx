import type { Metadata } from 'next';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { getTranslations } from 'next-intl/server';

import { JobRow } from '@/components/company/JobRow';
import { PanelLayout } from '@/components/panel/PanelLayout';
import { companyNav } from '@/components/panel/company-nav';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Role } from '@/contracts/enums';
import type { PagedResult } from '@/contracts/envelope';
import type { JobAdvertisementResponse } from '@/contracts/responses';
import { requireRole } from '@/server/guard';
import { emptyPage, fetchMine } from '@/server/queries';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('company');
  return { title: t('jobsTitle') };
}

const PAGE_SIZE = 15;

export default async function CompanyJobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const employer = await requireRole(Role.Employer);

  const params = await searchParams;
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Math.max(1, Number(rawPage ?? 1) || 1);

  const [t, nav, result] = await Promise.all([
    getTranslations('company'),
    companyNav(),
    // Scoped by employerId explicitly: unlike applications, the advertisement list is not narrowed by
    // role server-side — `getall` is the public board's endpoint too.
    fetchMine<PagedResult<JobAdvertisementResponse>>('JobAdvertisements/getall', {
      employerId: employer.id,
      page,
      pageSize: PAGE_SIZE,
    }),
  ]);

  const jobs = result ?? emptyPage<JobAdvertisementResponse>(PAGE_SIZE);

  return (
    <PanelLayout
      title={t('jobsTitle')}
      description={t('jobsSubtitle')}
      items={nav}
      actions={
        <Button href="/company/jobs/new" variant="contained">
          {t('newJob')}
        </Button>
      }
    >
      {jobs.items.length === 0 ? (
        <EmptyState
          title={t('jobsEmpty')}
          description={t('jobsEmptyHint')}
          icon={<WorkOutlineRoundedIcon />}
          action={
            <Button href="/company/jobs/new" variant="contained">
              {t('newJob')}
            </Button>
          }
        />
      ) : (
        <>
          <Stack spacing={2}>
            {jobs.items.map((job) => (
              <JobRow key={job.id} job={job} />
            ))}
          </Stack>

          <Pagination
            page={jobs.page}
            totalPages={jobs.totalPages}
            basePath="/company/jobs"
            searchParams={params}
          />
        </>
      )}
    </PanelLayout>
  );
}
