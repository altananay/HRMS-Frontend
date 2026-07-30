import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';

import type { PagedResult } from '@/contracts/envelope';
import type { JobAdvertisementResponse } from '@/contracts/responses';
import { fetchPublic } from '@/server/queries';

import { SkillSphereCanvas } from './SkillSphereCanvas';

/** How many skills make it into the cloud. Beyond ~30 the words overlap into noise. */
const MAX_SKILLS = 30;

/**
 * The skills employers are asking for, counted from live openings.
 *
 * Everything here happens on the server: the read, the counting and the ranking. The client component
 * receives a plain array of strings and does nothing but draw it.
 *
 * The `<Link>` list is **not** a fallback nobody sees. It is the real control — keyboard-reachable,
 * announced by a screen reader, working with JavaScript disabled, and the thing an E2E test can
 * click, because canvas pixels cannot be asserted on. The canvas is the decoration.
 */
export async function SkillSphere() {
  const [result, t] = await Promise.all([
    fetchPublic<PagedResult<JobAdvertisementResponse>>('JobAdvertisements/getall', {
      isActive: true,
      pageSize: 100,
    }),
    getTranslations('skills'),
  ]);

  const skills = rankSkills(result?.items ?? []);

  // Nothing to draw is a normal state on a fresh database — better to omit the section entirely than
  // to render an empty sphere and a heading promising skills.
  if (skills.length === 0) return null;

  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 } }}>
      <Container>
        <Grid container spacing={{ xs: 4, md: 8 }} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2}>
              <Typography variant="h2">{t('title')}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {t('subtitle')}
              </Typography>

              <Stack
                component="ul"
                direction="row"
                aria-label={t('listLabel')}
                sx={{ flexWrap: 'wrap', gap: 1, listStyle: 'none', p: 0, m: 0, mt: 1 }}
              >
                {skills.map((skill) => (
                  <Box component="li" key={skill} sx={{ display: 'contents' }}>
                    <Chip
                      component="a"
                      href={`/jobs?skill=${encodeURIComponent(skill)}`}
                      label={skill}
                      size="small"
                      clickable
                      variant="outlined"
                    />
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <SkillSphereCanvas skills={skills} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

/**
 * Counts how often each skill appears and returns the most common, most frequent first.
 *
 * Case-insensitive, because `React` and `react` are one skill to a reader and two to a `Map`. The
 * first spelling seen wins the display form rather than lower-casing everything, so `SQL` does not
 * come out as `sql`.
 */
export function rankSkills(jobs: readonly Pick<JobAdvertisementResponse, 'skills'>[]): string[] {
  const counts = new Map<string, { label: string; count: number }>();

  for (const job of jobs) {
    // One count per advertisement: a posting that lists "React" three times should not outrank three
    // separate postings that each mention it once.
    const seen = new Set<string>();

    for (const raw of job.skills) {
      const label = raw.trim();
      if (!label) continue;

      const key = label.toLocaleLowerCase('tr');
      if (seen.has(key)) continue;
      seen.add(key);

      const existing = counts.get(key);

      if (existing) {
        existing.count += 1;
      } else {
        counts.set(key, { label, count: 1 });
      }
    }
  }

  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'tr'))
    .slice(0, MAX_SKILLS)
    .map((entry) => entry.label);
}
