import type { Metadata } from 'next';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import Button from '@mui/material/Button';
import { getTranslations } from 'next-intl/server';

import { CvFiles } from '@/components/cv/CvFiles';
import { PanelLayout } from '@/components/panel/PanelLayout';
import { jobSeekerNav } from '@/components/panel/jobseeker-nav';
import { EmptyState } from '@/components/ui/EmptyState';
import { Role } from '@/contracts/enums';
import type { CvResponse } from '@/contracts/responses';
import { requireRole } from '@/server/guard';
import { fetchMine } from '@/server/queries';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('files');
  return { title: t('title') };
}

export default async function CvFilesPage() {
  const user = await requireRole(Role.JobSeeker);

  const [t, tCv, nav, cv] = await Promise.all([
    getTranslations('files'),
    getTranslations('cv'),
    jobSeekerNav(),
    fetchMine<CvResponse>(`Cvs/getbyjobseekerid/${user.id}`),
  ]);

  return (
    <PanelLayout
      title={t('title')}
      description={t('subtitle', { maxMb: 5, maxFiles: 5 })}
      items={nav}
    >
      {cv ? (
        <CvFiles files={cv.files} />
      ) : (
        <EmptyState
          title={tCv('empty')}
          description={tCv('emptyHint')}
          icon={<ArticleOutlinedIcon />}
          action={
            <Button href="/profile/cv/edit" variant="contained">
              {tCv('createTitle')}
            </Button>
          }
        />
      )}
    </PanelLayout>
  );
}
