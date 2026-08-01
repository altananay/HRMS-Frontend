import type { Metadata } from 'next';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { getTranslations } from 'next-intl/server';

import { CvView } from '@/components/cv/CvView';
import { PanelLayout } from '@/components/panel/PanelLayout';
import { jobSeekerNav } from '@/components/panel/jobseeker-nav';
import { EmptyState } from '@/components/ui/EmptyState';
import { Role } from '@/contracts/enums';
import type { CvResponse } from '@/contracts/responses';
import { requireRole } from '@/server/guard';
import { fetchMine } from '@/server/queries';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('cv');
  return { title: t('title') };
}

export default async function CvPage() {
  const user = await requireRole(Role.JobSeeker);

  const [t, nav, cv] = await Promise.all([
    getTranslations('cv'),
    jobSeekerNav(),
    fetchMine<CvResponse>(`Cvs/getbyjobseekerid/${user.id}`),
  ]);

  if (!cv) {
    return (
      <PanelLayout title={t('title')} items={nav}>
        <EmptyState
          title={t('empty')}
          description={t('emptyHint')}
          icon={<ArticleOutlinedIcon />}
          action={
            <Button href="/profile/cv/edit" variant="contained">
              {t('createTitle')}
            </Button>
          }
        />
      </PanelLayout>
    );
  }

  return (
    <PanelLayout
      title={t('title')}
      description={t('subtitle')}
      items={nav}
      actions={
        <Button href="/profile/cv/edit" variant="contained">
          {t('editTitle')}
        </Button>
      }
    >
      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <CvView cv={cv} />
        </CardContent>
      </Card>
    </PanelLayout>
  );
}
