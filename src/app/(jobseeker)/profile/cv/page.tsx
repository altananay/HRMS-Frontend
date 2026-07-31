import type { Metadata } from 'next';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';

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

/** The résumé as an employer sees it — read-only, so the user can check what they are sending. */
export default async function CvPage() {
  const user = await requireRole(Role.JobSeeker);

  const [t, tLevel, nav, cv] = await Promise.all([
    getTranslations('cv'),
    getTranslations('cv.level'),
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

  const years = (start: number | null, end: number | null) =>
    [start, end].some((value) => value !== null)
      ? `${start ?? '…'} – ${end ?? t('stillWorking')}`
      : null;

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
          <Stack spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h5">
                {cv.firstName} {cv.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {cv.email}
              </Typography>

              {cv.socialMedia &&
              (cv.socialMedia.github || cv.socialMedia.linkedin || cv.socialMedia.webSite) ? (
                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 0.5, pt: 0.5 }}>
                  {cv.socialMedia.github ? (
                    <SocialLink href={cv.socialMedia.github} label={t('github')} />
                  ) : null}
                  {cv.socialMedia.linkedin ? (
                    <SocialLink href={cv.socialMedia.linkedin} label={t('linkedin')} />
                  ) : null}
                  {cv.socialMedia.webSite ? (
                    <SocialLink href={cv.socialMedia.webSite} label={t('website')} />
                  ) : null}
                </Stack>
              ) : null}
            </Stack>

            {cv.information ? (
              <Section title={t('information')}>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{cv.information}</Typography>
              </Section>
            ) : null}

            {cv.skills.length > 0 ? (
              <Section title={t('skills')}>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                  {cv.skills.map((skill) => (
                    <Chip key={skill} label={skill} size="small" />
                  ))}
                </Stack>
              </Section>
            ) : null}

            {cv.educations.length > 0 ? (
              <Section title={t('education')}>
                <Stack spacing={2}>
                  {cv.educations.map((education) => (
                    <Entry
                      key={education.id}
                      title={education.school}
                      subtitle={education.major}
                      meta={years(education.startYear, education.endYear)}
                      extra={education.grade}
                    />
                  ))}
                </Stack>
              </Section>
            ) : null}

            {cv.jobExperiences.length > 0 ? (
              <Section title={t('experience')}>
                <Stack spacing={2}>
                  {cv.jobExperiences.map((experience) => (
                    <Entry
                      key={experience.id}
                      title={experience.position}
                      subtitle={
                        experience.department
                          ? `${experience.companyName} · ${experience.department}`
                          : experience.companyName
                      }
                      meta={years(experience.startYear, experience.endYear)}
                      body={experience.description}
                    />
                  ))}
                </Stack>
              </Section>
            ) : null}

            {cv.languages.length > 0 ? (
              <Section title={t('languages')}>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                  {cv.languages.map((language) => (
                    <Chip
                      key={language.id}
                      label={`${language.name} · ${tLevel(language.level)}`}
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Section>
            ) : null}

            {cv.projects.length > 0 ? (
              <Section title={t('projects')}>
                <Stack spacing={2}>
                  {cv.projects.map((project) => (
                    <Entry key={project.id} title={project.name} body={project.description} />
                  ))}
                </Stack>
              </Section>
            ) : null}

            {cv.hobbies ? (
              <Section title={t('hobbies')}>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{cv.hobbies}</Typography>
              </Section>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </PanelLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="overline" color="text.secondary">
        {title}
      </Typography>
      <Divider sx={{ mt: 0.5, mb: 2 }} />
      {children}
    </Box>
  );
}

function Entry({
  title,
  subtitle,
  meta,
  extra,
  body,
}: {
  title: string;
  subtitle?: string;
  meta?: string | null;
  extra?: string | null;
  body?: string | null;
}) {
  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 0, sm: 1 }}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'baseline' } }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {meta ? (
          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
            {meta}
          </Typography>
        ) : null}
      </Stack>

      {subtitle ? (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      ) : null}

      {extra ? (
        <Typography variant="caption" color="text.secondary">
          {extra}
        </Typography>
      ) : null}

      {body ? (
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.75 }}>
          {body}
        </Typography>
      ) : null}
    </Box>
  );
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <MuiLink href={href} target="_blank" rel="noopener noreferrer nofollow" variant="body2">
      {label}
    </MuiLink>
  );
}
