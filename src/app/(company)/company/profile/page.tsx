import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Button from '@mui/material/Button';
import { getTranslations } from 'next-intl/server';

import { EmployerProfileForm } from '@/components/company/EmployerProfileForm';
import { PanelLayout } from '@/components/panel/PanelLayout';
import { companyNav } from '@/components/panel/company-nav';
import { Role } from '@/contracts/enums';
import type { EmployerDetailResponse } from '@/contracts/responses';
import { requireRole } from '@/server/guard';
import { fetchPublic } from '@/server/queries';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('company');
  return { title: t('profileTitle') };
}

export default async function CompanyProfilePage() {
  const employer = await requireRole(Role.Employer);

  const [t, nav, detail] = await Promise.all([
    getTranslations('company'),
    companyNav(),
    fetchPublic<EmployerDetailResponse>(`Employers/getbyemployerid/${employer.id}`),
  ]);

  if (!detail) notFound();

  return (
    <PanelLayout
      title={t('profileTitle')}
      description={t('profileSubtitle')}
      items={nav}
      actions={
        <Button href={`/companies/${employer.id}`} variant="outlined">
          {t('viewPublicPage')}
        </Button>
      }
    >
      <EmployerProfileForm employer={detail} />
    </PanelLayout>
  );
}
