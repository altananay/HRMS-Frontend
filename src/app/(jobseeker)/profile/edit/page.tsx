import type { Metadata } from 'next';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { PanelLayout } from '@/components/panel/PanelLayout';
import { jobSeekerNav } from '@/components/panel/jobseeker-nav';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { Role } from '@/contracts/enums';
import type { JobSeekerResponse } from '@/contracts/responses';
import { requireRole } from '@/server/guard';
import { fetchMine } from '@/server/queries';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('profile');
  return { title: t('editTitle') };
}

export default async function ProfileEditPage() {
  const user = await requireRole(Role.JobSeeker);

  const [t, nav, seeker] = await Promise.all([
    getTranslations('profile'),
    jobSeekerNav(),
    fetchMine<JobSeekerResponse>(`JobSeekers/getbyid/${user.id}`),
  ]);

  if (!seeker) notFound();

  return (
    <PanelLayout title={t('editTitle')} description={t('editSubtitle')} items={nav}>
      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <ProfileForm seeker={seeker} />
        </CardContent>
      </Card>
    </PanelLayout>
  );
}
