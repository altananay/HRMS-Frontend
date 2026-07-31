import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { JobAdvertisementForm } from '@/components/company/JobAdvertisementForm';
import { PanelLayout } from '@/components/panel/PanelLayout';
import { companyNav } from '@/components/panel/company-nav';
import { Role } from '@/contracts/enums';
import { requireRole } from '@/server/guard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('company');
  return { title: t('createTitle') };
}

export default async function NewJobPage() {
  await requireRole(Role.Employer);

  const [t, nav] = await Promise.all([getTranslations('company'), companyNav()]);

  return (
    <PanelLayout title={t('createTitle')} items={nav}>
      <JobAdvertisementForm />
    </PanelLayout>
  );
}
