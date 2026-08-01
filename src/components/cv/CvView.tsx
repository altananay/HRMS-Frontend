import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';

import type { CvResponse } from '@/contracts/responses';

export async function CvView({ cv }: { cv: CvResponse }) {
  const [t, tLevel] = await Promise.all([getTranslations('cv'), getTranslations('cv.level')]);

  const years = (start: number | null, end: number | null) =>
    [start, end].some((value) => value !== null)
      ? `${start ?? '…'} – ${end ?? t('stillWorking')}`
      : null;

  const social = cv.socialMedia;
  const hasSocial = Boolean(social && (social.github || social.linkedin || social.webSite));

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h5">
          {cv.firstName} {cv.lastName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {cv.email}
        </Typography>

        {hasSocial ? (
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 0.5, pt: 0.5 }}>
            {social?.github ? <SocialLink href={social.github} label={t('github')} /> : null}
            {social?.linkedin ? <SocialLink href={social.linkedin} label={t('linkedin')} /> : null}
            {social?.webSite ? <SocialLink href={social.webSite} label={t('website')} /> : null}
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
