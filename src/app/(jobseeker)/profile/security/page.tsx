import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { PanelLayout } from '@/components/panel/PanelLayout';
import { jobSeekerNav } from '@/components/panel/jobseeker-nav';
import { SecuritySettings } from '@/components/profile/SecuritySettings';
import { Role } from '@/contracts/enums';
import { requireRole } from '@/server/guard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('security');
  return { title: t('title') };
}

export default async function SecurityPage() {
  await requireRole(Role.JobSeeker);

  const [t, nav] = await Promise.all([getTranslations('security'), jobSeekerNav()]);

  return (
    <PanelLayout title={t('title')} description={t('subtitle')} items={nav}>
      <SecuritySettings />
    </PanelLayout>
  );
}
