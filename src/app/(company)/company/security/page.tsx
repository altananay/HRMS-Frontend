import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { PanelLayout } from '@/components/panel/PanelLayout';
import { companyNav } from '@/components/panel/company-nav';
import { SecuritySettings } from '@/components/profile/SecuritySettings';
import { Role } from '@/contracts/enums';
import { requireRole } from '@/server/guard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('security');
  return { title: t('title') };
}

/** Same component as the job seeker's: password and sessions are account concerns, not role ones. */
export default async function CompanySecurityPage() {
  await requireRole(Role.Employer);

  const [t, nav] = await Promise.all([getTranslations('security'), companyNav()]);

  return (
    <PanelLayout title={t('title')} description={t('subtitle')} items={nav}>
      <SecuritySettings />
    </PanelLayout>
  );
}
