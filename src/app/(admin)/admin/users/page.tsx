import type { Metadata } from 'next';
import Alert from '@mui/material/Alert';
import { getTranslations } from 'next-intl/server';

import { UsersGrid } from '@/components/admin/grids';
import { PanelLayout } from '@/components/panel/PanelLayout';
import { adminNav } from '@/components/panel/admin-nav';
import { Role } from '@/contracts/enums';
import type { UserSummaryResponse } from '@/contracts/responses';
import { fetchAdminPage } from '@/server/admin-list';
import { requireRole } from '@/server/guard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin');
  return { title: t('usersTitle') };
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
    fetchAdminPage<UserSummaryResponse>('Users/getall', params),
  ]);

  return (
    <PanelLayout title={t('usersTitle')} description={t('usersSubtitle')} items={nav}>
      <Alert severity="info" sx={{ mb: 3 }}>
        {t('usersReadOnly')}
      </Alert>
      <UsersGrid page={result} />
    </PanelLayout>
  );
}
