import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { CvForm } from '@/components/cv/CvForm';
import { PanelLayout } from '@/components/panel/PanelLayout';
import { jobSeekerNav } from '@/components/panel/jobseeker-nav';
import { Role } from '@/contracts/enums';
import type { CvResponse } from '@/contracts/responses';
import { requireRole } from '@/server/guard';
import { fetchMine } from '@/server/queries';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('cv');
  return { title: t('editTitle') };
}

/**
 * Create and edit are the same screen, because the API's create and update take the same body. Which
 * one it is depends on whether a résumé already exists — and the **whole** existing record is loaded,
 * not just the part being edited, because the update replaces every collection.
 */
export default async function CvEditPage() {
  const user = await requireRole(Role.JobSeeker);

  const [t, nav, cv] = await Promise.all([
    getTranslations('cv'),
    jobSeekerNav(),
    fetchMine<CvResponse>(`Cvs/getbyjobseekerid/${user.id}`),
  ]);

  return (
    <PanelLayout title={cv ? t('editTitle') : t('createTitle')} items={nav}>
      <CvForm cv={cv} />
    </PanelLayout>
  );
}
