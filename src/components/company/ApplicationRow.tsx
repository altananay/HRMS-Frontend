import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getFormatter, getTranslations } from 'next-intl/server';

import { ApplicationStatusChip } from '@/components/applications/ApplicationStatusChip';
import { CompanyAvatar } from '@/components/companies/CompanyAvatar';
import type { JobApplicationResponse } from '@/contracts/responses';

export async function ApplicationRow({
  application,
  showJob = true,
}: {
  application: JobApplicationResponse;
  showJob?: boolean;
}) {
  const [t, format] = await Promise.all([getTranslations('applications'), getFormatter()]);

  return (
    <Card>
      <CardActionArea href={`/company/applications/${application.id}`}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', minWidth: 0 }}>
              <CompanyAvatar name={application.jobSeekerFullName} size={40} />

              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {application.jobSeekerFullName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {showJob ? `${application.jobAdvertisementTitle} · ` : ''}
                  {t('appliedAt', {
                    date: format.dateTime(new Date(application.createdAt), 'short'),
                  })}
                </Typography>
              </Box>
            </Stack>

            <ApplicationStatusChip status={application.status} />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
