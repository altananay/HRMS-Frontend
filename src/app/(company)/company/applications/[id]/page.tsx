import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getFormatter, getTranslations } from 'next-intl/server';

import { ApplicationStatusChip } from '@/components/applications/ApplicationStatusChip';
import { ApplicationStatusForm } from '@/components/company/ApplicationStatusForm';
import { CompanyAvatar } from '@/components/companies/CompanyAvatar';
import { CvView } from '@/components/cv/CvView';
import { PanelLayout } from '@/components/panel/PanelLayout';
import { companyNav } from '@/components/panel/company-nav';
import { Role } from '@/contracts/enums';
import type { CvResponse, JobApplicationResponse } from '@/contracts/responses';
import { requireRole } from '@/server/guard';
import { fetchMine } from '@/server/queries';

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('company');
  return { title: t('applicationDetail') };
}

/**
 * One application, with the candidate's résumé and files.
 *
 * **The employer sees this because the candidate applied to them** — `CandidateAccessPolicy` opens the
 * résumé to an employer holding an application from that seeker, and to nobody else. The CV read is
 * attempted rather than assumed: if the policy refuses, `fetchMine` returns `null` and the panel shows
 * "no résumé" instead of failing. That keeps an authorization decision on the server where it belongs.
 */
export default async function CompanyApplicationDetailPage({ params }: Params) {
  await requireRole(Role.Employer);

  const { id } = await params;

  const [t, tApplications, format, nav, application] = await Promise.all([
    getTranslations('company'),
    getTranslations('applications'),
    getFormatter(),
    companyNav(),
    fetchMine<JobApplicationResponse>(`JobApplications/getbyid/${id}`),
  ]);

  // `GetByIdJobApplicationQuery` refuses anyone who is not a party to it, so somebody else's
  // application and a non-existent one look identical from here — which is the right amount to tell
  // someone probing ids.
  if (!application) notFound();

  const cv = await fetchMine<CvResponse>(`Cvs/getbyjobseekerid/${application.jobSeekerId}`);

  return (
    <PanelLayout title={t('applicationDetail')} items={nav}>
      <Button
        href="/company/applications"
        startIcon={<ArrowBackRoundedIcon />}
        color="inherit"
        sx={{ mb: 2, px: 1 }}
      >
        {t('backToApplications')}
      </Button>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
                <CompanyAvatar name={application.jobSeekerFullName} size={52} />
                <Stack sx={{ minWidth: 0 }}>
                  <Typography variant="h6">{application.jobSeekerFullName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {application.jobAdvertisementTitle} ·{' '}
                    {tApplications('appliedAt', {
                      date: format.dateTime(new Date(application.createdAt), 'long'),
                    })}
                  </Typography>
                </Stack>
              </Stack>

              {application.jobSeekerNote ? (
                <>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="overline" color="text.secondary">
                    {tApplications('yourNote')}
                  </Typography>
                  <Typography sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>
                    {application.jobSeekerNote}
                  </Typography>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
              <Typography variant="overline" color="text.secondary">
                {t('candidateCv')}
              </Typography>
              <Divider sx={{ mt: 0.5, mb: 3 }} />

              {cv ? (
                <CvView cv={cv} />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('candidateNoCv')}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
                <Typography variant="overline" color="text.secondary">
                  {t('status')}
                </Typography>
                <ApplicationStatusChip status={application.status} />
              </Stack>

              <ApplicationStatusForm application={application} />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                {t('candidateFiles')}
              </Typography>

              {cv && cv.files.length > 0 ? (
                <List dense sx={{ mt: 1 }}>
                  {cv.files.map((file) => (
                    <ListItem
                      key={file.id}
                      secondaryAction={
                        // A link, not a fetch: the proxy streams the file with its content-disposition
                        // intact and the URL only works with this employer's session cookie.
                        <Button
                          component="a"
                          href={`/api/proxy/Cvs/files/${file.id}`}
                          size="small"
                          startIcon={<DownloadRoundedIcon />}
                        >
                          {t('download')}
                        </Button>
                      }
                    >
                      <ListItemIcon sx={{ minWidth: 34 }}>
                        <InsertDriveFileOutlinedIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.fileName}
                        slotProps={{ primary: { sx: { wordBreak: 'break-all' } } }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {t('candidateNoFiles')}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PanelLayout>
  );
}
