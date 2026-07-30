import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';

import { JobCard } from '@/components/jobs/JobCard';
import { JobFilters } from '@/components/jobs/JobFilters';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import type { PagedResult } from '@/contracts/envelope';
import type { JobAdvertisementResponse } from '@/contracts/responses';
import { emptyPage, fetchPublic } from '@/server/queries';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('jobs');
  return { title: t('title') };
}

const PAGE_SIZE = 12;

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/**
 * The public job board. A Server Component: the list is rendered with its data already in it, so
 * there is no spinner, no client-side fetch and nothing for a crawler to miss.
 *
 * `isActive: true` is pinned here rather than exposed as a filter — an expired or unpublished opening
 * on a public board wastes the reader's time and the employer's.
 */
export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const t = await getTranslations('jobs');

  const page = Math.max(1, Number(first(params.page) ?? 1) || 1);
  const search = first(params.search);
  const city = first(params.city);
  const skill = first(params.skill);

  const result =
    (await fetchPublic<PagedResult<JobAdvertisementResponse>>('JobAdvertisements/getall', {
      page,
      pageSize: PAGE_SIZE,
      isActive: true,
      search,
      city,
      skill,
    })) ?? emptyPage<JobAdvertisementResponse>(PAGE_SIZE);

  return (
    <Container sx={{ py: { xs: 5, md: 8 } }}>
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h2" component="h1">
          {t('title')}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="subtitle1" color="text.secondary">
            {t('subtitle', { count: result.totalCount })}
          </Typography>
          {skill ? <Chip label={`${t('skillLabel')}: ${skill}`} size="small" color="primary" /> : null}
        </Stack>
      </Stack>

      <JobFilters />

      {result.items.length === 0 ? (
        <EmptyState title={t('empty')} description={t('emptyHint')} />
      ) : (
        <Box>
          <Grid container spacing={3}>
            {result.items.map((job) => (
              <Grid key={job.id} size={{ xs: 12, md: 6 }}>
                <JobCard job={job} />
              </Grid>
            ))}
          </Grid>

          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            basePath="/jobs"
            searchParams={params}
          />
        </Box>
      )}
    </Container>
  );
}
