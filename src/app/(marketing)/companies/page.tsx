import type { Metadata } from 'next';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';

import { CompanyAvatar } from '@/components/companies/CompanyAvatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import type { PagedResult } from '@/contracts/envelope';
import type { EmployerSummaryResponse } from '@/contracts/responses';
import { emptyPage, fetchPublic } from '@/server/queries';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('companies');
  return { title: t('title') };
}

const PAGE_SIZE = 12;

/**
 * The public company directory.
 *
 * Reads `Employers/public`, **not** `Employers/getall`. The two differ deliberately: `getall` is
 * admin-only and its response carries the employer's email address and account status, neither of
 * which belongs in an anonymous, paged, scrapeable list. The address does appear — on the company's
 * own page, one at a time, which is a different thing entirely.
 */
export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const t = await getTranslations('companies');

  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Math.max(1, Number(rawPage ?? 1) || 1);

  const result =
    (await fetchPublic<PagedResult<EmployerSummaryResponse>>('Employers/public', {
      page,
      pageSize: PAGE_SIZE,
    })) ?? emptyPage<EmployerSummaryResponse>(PAGE_SIZE);

  return (
    <Container sx={{ py: { xs: 5, md: 8 } }}>
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h2" component="h1">
          {t('title')}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {t('subtitle')}
        </Typography>
      </Stack>

      {result.items.length === 0 ? (
        <EmptyState title={t('empty')} icon={<ApartmentRoundedIcon />} />
      ) : (
        <Box>
          <Grid container spacing={3}>
            {result.items.map((company) => (
              <Grid key={company.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform .2s, box-shadow .2s, border-color .2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                      borderColor: 'primary.light',
                    },
                  }}
                >
                  <CardActionArea
                    href={`/companies/${company.id}`}
                    sx={{ height: '100%', alignItems: 'stretch' }}
                  >
                    <CardContent
                      sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}
                    >
                      <CompanyAvatar name={company.companyName} size={52} />

                      <Typography variant="h6" sx={{ lineHeight: 1.3 }}>
                        {company.companyName}
                      </Typography>

                      {company.numberOfEmployees ? (
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                          <GroupsOutlinedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.secondary">
                            {t('employees', { count: company.numberOfEmployees })}
                          </Typography>
                        </Stack>
                      ) : null}

                      {company.description ? (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {company.description}
                        </Typography>
                      ) : null}

                      <Stack
                        direction="row"
                        spacing={0.75}
                        sx={{ flexWrap: 'wrap', rowGap: 0.75, mt: 'auto', pt: 1 }}
                      >
                        {company.sectors.slice(0, 3).map((sector) => (
                          <Chip key={sector} label={sector} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            basePath="/companies"
            searchParams={params}
          />
        </Box>
      )}
    </Container>
  );
}
