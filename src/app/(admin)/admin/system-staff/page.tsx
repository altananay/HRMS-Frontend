import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { NewSystemStaffButton } from '@/components/admin/NewSystemStaffButton';
import { SystemStaffGrid } from '@/components/admin/grids';
import { PanelLayout } from '@/components/panel/PanelLayout';
import { adminNav } from '@/components/panel/admin-nav';
import { Role } from '@/contracts/enums';
import type { SystemStaffResponse } from '@/contracts/responses';
import { fetchAdminPage } from '@/server/admin-list';
import { requireRole } from '@/server/guard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin');
  return { title: t('systemStaffTitle') };
}

export default async function AdminSystemStaffPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(Role.Admin);

  const params = await searchParams;

  const [t, nav, result] = await Promise.all([
    getTranslations('admin'),
    adminNav(),
    fetchAdminPage<SystemStaffResponse>('SystemStaffs/getall', params),
  ]);

  return (
    <PanelLayout
      title={t('systemStaffTitle')}
      description={t('systemStaffSubtitle')}
      items={nav}
      actions={<NewSystemStaffButton />}
    >
      <SystemStaffGrid page={result} />
    </PanelLayout>
  );
}
