import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';

import { CompanyAvatar } from '@/components/companies/CompanyAvatar';
import { JobCard } from '@/components/jobs/JobCard';
import { EmptyState } from '@/components/ui/EmptyState';
import type { PagedResult } from '@/contracts/envelope';
import type { EmployerDetailResponse, JobAdvertisementResponse } from '@/contracts/responses';
import { fetchPublic } from '@/server/queries';

type Params = { params: Promise<{ id: string }> };

const loadCompany = (id: string) =>
  fetchPublic<EmployerDetailResponse>(`Employers/getbyemployerid/${id}`);

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const company = await loadCompany(id);

  if (!company) return {};

  return {
    title: company.companyName,
    description: company.description?.slice(0, 160),
  };
}

export default async function CompanyDetailPage({ params }: Params) {
  const { id } = await params;

  const [company, jobs, t] = await Promise.all([
    loadCompany(id),
    fetchPublic<PagedResult<JobAdvertisementResponse>>('JobAdvertisements/getall', {
      employerId: id,
      isActive: true,
      pageSize: 50,
    }),
    getTranslations('companies'),
  ]);

  if (!company) notFound();

  const openings = jobs?.items ?? [];

  return (
    <Container sx={{ py: { xs: 4, md: 7 } }}>
      <Button
        href="/companies"
        startIcon={<ArrowBackRoundedIcon />}
        color="inherit"
        sx={{ mb: 3, px: 1 }}
      >
        {t('backToCompanies')}
      </Button>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack direction="row" spacing={2.5} sx={{ mb: 3, alignItems: 'flex-start' }}>
            <CompanyAvatar name={company.companyName} size={72} />

            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h2" component="h1" sx={{ mb: 1 }}>
                {company.companyName}
              </Typography>

              <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', rowGap: 0.75 }}>
                {company.sectors.map((sector) => (
                  <Chip key={sector} label={sector} size="small" />
                ))}
              </Stack>
            </Box>
          </Stack>

          {company.description ? (
            <>
              <Typography variant="h4" sx={{ mb: 1.5 }}>
                {t('about')}
              </Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap', mb: 4 }}>{company.description}</Typography>
            </>
          ) : null}

          {company.departments.length > 0 ? (
            <>
              <Typography variant="h4" sx={{ mb: 1.5 }}>
                {t('departments')}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, mb: 4 }}>
                {company.departments.map((department) => (
                  <Chip
                    key={department.id}
                    label={
                      department.numberOfEmployees
                        ? `${department.name} · ${department.numberOfEmployees}`
                        : department.name
                    }
                    variant="outlined"
                  />
                ))}
              </Stack>
            </>
          ) : null}

          <Divider sx={{ my: 4 }} />

          <Typography variant="h4" sx={{ mb: 2.5 }}>
            {t('openings')}
          </Typography>

          {openings.length === 0 ? (
            <EmptyState title={t('noOpenings')} icon={<WorkOutlineRoundedIcon />} />
          ) : (
            <Grid container spacing={3}>
              {openings.map((job) => (
                <Grid key={job.id} size={12}>
                  <JobCard job={job} />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ position: { md: 'sticky' }, top: { md: 96 } }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                {t('contact')}
              </Typography>

              <Stack spacing={2} sx={{ mt: 2 }}>
                <ContactRow icon={<EmailOutlinedIcon />}>
                  <MuiLink href={`mailto:${company.email}`} sx={{ wordBreak: 'break-all' }}>
                    {company.email}
                  </MuiLink>
                </ContactRow>

                {company.companyPhone ? (
                  <ContactRow icon={<LocalPhoneOutlinedIcon />}>
                    <MuiLink href={`tel:${company.companyPhone}`}>{company.companyPhone}</MuiLink>
                  </ContactRow>
                ) : null}

                {company.webSite ? (
                  <ContactRow icon={<LanguageOutlinedIcon />}>
                    <MuiLink
                      href={company.webSite}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      sx={{ wordBreak: 'break-all' }}
                    >
                      {company.webSite}
                    </MuiLink>
                  </ContactRow>
                ) : null}

                {company.numberOfEmployees ? (
                  <ContactRow icon={<GroupsOutlinedIcon />}>
                    <Typography variant="body2">
                      {t('employees', { count: company.numberOfEmployees })}
                    </Typography>
                  </ContactRow>
                ) : null}
              </Stack>

              {openings.length > 0 ? (
                <Button
                  href={`/jobs?search=${encodeURIComponent(company.companyName)}`}
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 3 }}
                >
                  {t('viewJobs')}
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

function ContactRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <Box sx={{ color: 'text.disabled', display: 'flex', mt: 0.25, '& svg': { fontSize: 20 } }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, fontSize: '0.9375rem' }}>{children}</Box>
    </Stack>
  );
}
