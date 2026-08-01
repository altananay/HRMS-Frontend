import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { JobAdvertisementForm } from '@/components/company/JobAdvertisementForm';
import { PanelLayout } from '@/components/panel/PanelLayout';
import { companyNav } from '@/components/panel/company-nav';
import { Role } from '@/contracts/enums';
import type { JobAdvertisementResponse } from '@/contracts/responses';
import { requireRole } from '@/server/guard';
import { fetchMine } from '@/server/queries';

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('company');
  return { title: t('editTitle') };
}

export default async function EditJobPage({ params }: Params) {
  const employer = await requireRole(Role.Employer);
  const { id } = await params;

  const [t, nav, job] = await Promise.all([
    getTranslations('company'),
    companyNav(),
    fetchMine<JobAdvertisementResponse>(`JobAdvertisements/getbyid/${id}`),
  ]);

  if (!job || job.employerId !== employer.id) notFound();

  return (
    <PanelLayout title={t('editTitle')} description={job.title} items={nav}>
      <JobAdvertisementForm job={job} />
    </PanelLayout>
  );
}
