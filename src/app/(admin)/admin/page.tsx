import type { Metadata } from 'next';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';

import { PanelLayout } from '@/components/panel/PanelLayout';
import { adminNav } from '@/components/panel/admin-nav';
import { Role } from '@/contracts/enums';
import type { PagedResult } from '@/contracts/envelope';
import type {
  ContactResponse,
  JobAdvertisementResponse,
  JobApplicationResponse,
  UserSummaryResponse,
} from '@/contracts/responses';
import { requireRole } from '@/server/guard';
import { fetchMine } from '@/server/queries';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin');
  return { title: t('title') };
}

/**
 * The admin panel's front door: how much of everything there is, and the way in to each list.
 *
 * The counts come from `totalCount` on a one-row page rather than by reading the tables — the API has
 * no aggregate endpoint, and pulling four full lists to count them would get slower every month.
 */
export default async function AdminOverviewPage() {
  await requireRole(Role.Admin);

  const [t, nav, users, jobs, applications, contacts] = await Promise.all([
    getTranslations('admin'),
    adminNav(),
    fetchMine<PagedResult<UserSummaryResponse>>('Users/getall', { pageSize: 1 }),
    fetchMine<PagedResult<JobAdvertisementResponse>>('JobAdvertisements/getall', { pageSize: 1 }),
    fetchMine<PagedResult<JobApplicationResponse>>('JobApplications/getall', { pageSize: 1 }),
    // Contacts has no `isHandled` filter upstream, so the open ones are counted from a page rather
    // than asked for. A hundred rows is plenty for a mailbox nobody has triaged yet.
    fetchMine<PagedResult<ContactResponse>>('Contacts', { pageSize: 100 }),
  ]);

  const openMessages = (contacts?.items ?? []).filter((contact) => !contact.isHandled).length;

  const stats = [
    { label: t('totalUsers'), value: users?.totalCount ?? 0, href: '/admin/users' },
    { label: t('totalJobs'), value: jobs?.totalCount ?? 0, href: '/admin/job-advertisements' },
    {
      label: t('totalApplications'),
      value: applications?.totalCount ?? 0,
      href: '/admin/job-applications',
    },
    { label: t('unhandledContacts'), value: openMessages, href: '/admin/contacts', highlight: true },
  ];

  return (
    <PanelLayout title={t('title')} description={t('subtitle')} items={nav}>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid key={stat.href} size={{ xs: 6, md: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea href={stat.href} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography
                    variant="h3"
                    sx={{
                      color: stat.highlight && stat.value > 0 ? 'warning.main' : 'text.primary',
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        {nav
          .filter((item) => !item.exact)
          .map((item) => (
            <Grid key={item.href} size={{ xs: 12, sm: 6 }}>
              <Card>
                <CardActionArea href={item.href}>
                  <CardContent>
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Stack sx={{ color: 'primary.main' }}>{item.icon}</Stack>
                        <Typography variant="subtitle1">{item.label}</Typography>
                      </Stack>
                      <ArrowForwardRoundedIcon sx={{ color: 'text.disabled' }} />
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
      </Grid>
    </PanelLayout>
  );
}
