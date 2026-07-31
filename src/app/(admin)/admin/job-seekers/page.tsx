import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { JobSeekersGrid } from '@/components/admin/grids';
import { PanelLayout } from '@/components/panel/PanelLayout';
import { adminNav } from '@/components/panel/admin-nav';
import { Role } from '@/contracts/enums';
import type { JobSeekerResponse } from '@/contracts/responses';
import { fetchAdminPage } from '@/server/admin-list';
import { requireRole } from '@/server/guard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin');
  return { title: t('jobSeekersTitle') };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(Role.Admin);

  const params = await searchParams;

  const [t, nav, result] = await Promise.all([
    getTranslations('admin'),
    adminNav(),
    fetchAdminPage<JobSeekerResponse>('JobSeekers/getall', params),
  ]);

  return (
    <PanelLayout title={t('jobSeekersTitle')} description={t('jobSeekersSubtitle')} items={nav}>
      <JobSeekersGrid page={result} />
    </PanelLayout>
  );
}
