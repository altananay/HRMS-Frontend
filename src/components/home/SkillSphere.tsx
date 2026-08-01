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

const MAX_SKILLS = 30;

export async function SkillSphere() {
  const [result, t] = await Promise.all([
    fetchPublic<PagedResult<JobAdvertisementResponse>>('JobAdvertisements/getall', {
      isActive: true,
      pageSize: 100,
    }),
    getTranslations('skills'),
  ]);

  const skills = rankSkills(result?.items ?? []);

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

export function rankSkills(jobs: readonly Pick<JobAdvertisementResponse, 'skills'>[]): string[] {
  const counts = new Map<string, { label: string; count: number }>();

  for (const job of jobs) {
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
