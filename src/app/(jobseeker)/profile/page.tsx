import type { Metadata } from 'next';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';

import { PanelLayout } from '@/components/panel/PanelLayout';
import { jobSeekerNav } from '@/components/panel/jobseeker-nav';
import type { PagedResult } from '@/contracts/envelope';
import type { CvResponse, JobApplicationResponse } from '@/contracts/responses';
import { requireRole } from '@/server/guard';
import { fetchMine } from '@/server/queries';
import { Role } from '@/contracts/enums';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('profile');
  return { title: t('title') };
}

/**
 * The panel's front door: what the user has, and the one thing they most likely came to do.
 *
 * The three reads run together and each degrades on its own — a résumé that fails to load leaves the
 * other two cards intact rather than taking the page down.
 */
export default async function ProfileOverviewPage() {
  const user = await requireRole(Role.JobSeeker);

  const [t, nav, cv, applications] = await Promise.all([
    getTranslations('profile'),
    jobSeekerNav(),
    fetchMine<CvResponse>(`Cvs/getbyjobseekerid/${user.id}`),
    fetchMine<PagedResult<JobApplicationResponse>>('JobApplications/getall', { pageSize: 1 }),
  ]);

  // How much of the résumé is actually filled in — a more honest signal than "exists" for someone who
  // created one and stopped after the first step.
  const filledSections = cv
    ? [
        Boolean(cv.information),
        cv.skills.length > 0,
        cv.educations.length > 0,
        cv.jobExperiences.length > 0,
        cv.languages.length > 0,
        cv.projects.length > 0,
      ].filter(Boolean).length
    : 0;

  return (
    <PanelLayout title={t('title')} description={t('welcome', { name: user.displayName })} items={nav}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SummaryCard
            icon={<ArticleOutlinedIcon />}
            title={t('cvCardTitle')}
            body={cv ? t('cvCardFilled', { sections: filledSections }) : t('cvCardEmpty')}
            primary={{
              href: cv ? '/profile/cv' : '/profile/cv/edit',
              label: cv ? t('cvView') : t('cvCreate'),
            }}
            secondary={cv ? { href: '/profile/cv/edit', label: t('cvEdit') } : undefined}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SummaryCard
            icon={<FolderOutlinedIcon />}
            title={t('filesCardTitle')}
            body={
              cv && cv.files.length > 0
                ? t('filesCount', { count: cv.files.length })
                : t('filesEmpty')
            }
            primary={{ href: '/profile/cv/files', label: t('filesManage') }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SummaryCard
            icon={<SendOutlinedIcon />}
            title={t('applicationsCardTitle')}
            body={
              applications && applications.totalCount > 0
                ? t('applicationsCount', { count: applications.totalCount })
                : t('applicationsEmpty')
            }
            primary={{ href: '/profile/applications', label: t('applicationsView') }}
            secondary={{ href: '/jobs', label: t('browseJobs') }}
          />
        </Grid>
      </Grid>
    </PanelLayout>
  );
}

function SummaryCard({
  icon,
  title,
  body,
  primary,
  secondary,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string } | undefined;
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'primary.lighter',
            color: 'primary.main',
          }}
        >
          {icon}
        </Box>

        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {body}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mt: 'auto', pt: 1.5 }}>
          <Button href={primary.href} variant="contained" size="small">
            {primary.label}
          </Button>
          {secondary ? (
            <Button href={secondary.href} size="small" color="inherit">
              {secondary.label}
            </Button>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
