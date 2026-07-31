import type { Metadata } from 'next';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import Stack from '@mui/material/Stack';
import { getTranslations } from 'next-intl/server';

import { ApplicationRow } from '@/components/company/ApplicationRow';
import { PanelLayout } from '@/components/panel/PanelLayout';
import { companyNav } from '@/components/panel/company-nav';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Role } from '@/contracts/enums';
import type { PagedResult } from '@/contracts/envelope';
import type { JobApplicationResponse } from '@/contracts/responses';
import { requireRole } from '@/server/guard';
import { emptyPage, fetchMine } from '@/server/queries';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('company');
  return { title: t('applicationsTitle') };
}

const PAGE_SIZE = 20;

/**
 * Every application to this employer's postings.
 *
 * No `employerId` is sent and none would help: `JobApplicationsController.GetAll` overwrites it from
 * the token for this role. The scoping is the server's, which makes it a security property rather
 * than a query parameter someone could tamper with.
 */
export default async function CompanyApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(Role.Employer);

  const params = await searchParams;
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  const page = Math.max(1, Number(first(params.page) ?? 1) || 1);
  const status = first(params.status);

  const [t, nav, result] = await Promise.all([
    getTranslations('company'),
    companyNav(),
    fetchMine<PagedResult<JobApplicationResponse>>('JobApplications/getall', {
      page,
      pageSize: PAGE_SIZE,
      status,
    }),
  ]);

  const applications = result ?? emptyPage<JobApplicationResponse>(PAGE_SIZE);

  return (
    <PanelLayout title={t('applicationsTitle')} description={t('applicationsSubtitle')} items={nav}>
      {applications.items.length === 0 ? (
        <EmptyState
          title={t('applicationsEmpty')}
          description={t('applicationsEmptyHint')}
          icon={<InboxOutlinedIcon />}
        />
      ) : (
        <>
          <Stack spacing={2}>
            {applications.items.map((application) => (
              <ApplicationRow key={application.id} application={application} />
            ))}
          </Stack>

          <Pagination
            page={applications.page}
            totalPages={applications.totalPages}
            basePath="/company/applications"
            searchParams={params}
          />
        </>
      )}
    </PanelLayout>
  );
}
