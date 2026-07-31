import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { JobPositionsManager } from '@/components/admin/JobPositionsManager';
import { PanelLayout } from '@/components/panel/PanelLayout';
import { adminNav } from '@/components/panel/admin-nav';
import { Role } from '@/contracts/enums';
import type { JobPositionResponse } from '@/contracts/responses';
import { fetchAdminPage } from '@/server/admin-list';
import { requireRole } from '@/server/guard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin');
  return { title: t('jobPositionsTitle') };
}

export default async function AdminJobPositionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(Role.Admin);

  const params = await searchParams;

  const [t, nav, result] = await Promise.all([
    getTranslations('admin'),
    adminNav(),
    fetchAdminPage<JobPositionResponse>('JobPosition/getall', params),
  ]);

  return (
    <PanelLayout title={t('jobPositionsTitle')} description={t('jobPositionsSubtitle')} items={nav}>
      <JobPositionsManager page={result} />
    </PanelLayout>
  );
}
