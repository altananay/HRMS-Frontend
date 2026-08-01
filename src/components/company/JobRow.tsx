import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getFormatter, getTranslations } from 'next-intl/server';

import { isDeadlinePassed } from '@/components/jobs/deadline';
import type { JobAdvertisementResponse } from '@/contracts/responses';

export async function JobRow({
  job,
  applicationCount,
}: {
  job: JobAdvertisementResponse;
  applicationCount?: number;
}) {
  const [t, tJobs, format] = await Promise.all([
    getTranslations('company'),
    getTranslations('jobs'),
    getFormatter(),
  ]);

  const closed = isDeadlinePassed(job.deadline);

  return (
    <Card>
      <CardActionArea href={`/company/jobs/${job.id}`}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-start' } }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {job.title}
              </Typography>

              <Stack
                direction="row"
                spacing={2}
                sx={{ flexWrap: 'wrap', rowGap: 0.5, mt: 0.75, color: 'text.secondary' }}
              >
                <Meta icon={<LocationOnOutlinedIcon />} text={job.city ?? tJobs('remoteCity')} />
                <Meta
                  icon={<AccessTimeRoundedIcon />}
                  text={tJobs('deadline', {
                    date: format.dateTime(new Date(job.deadline), 'short'),
                  })}
                />
                {applicationCount !== undefined ? (
                  <Meta
                    icon={<PeopleAltOutlinedIcon />}
                    text={t('applicationCount', { count: applicationCount })}
                  />
                ) : null}
              </Stack>
            </Box>

            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              {closed ? (
                <Chip label={tJobs('closed')} size="small" color="warning" variant="outlined" />
              ) : null}
              <Chip
                label={job.isActive ? t('active') : t('inactive')}
                size="small"
                color={job.isActive ? 'success' : 'default'}
                variant={job.isActive ? 'filled' : 'outlined'}
              />
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function Meta({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <Box sx={{ display: 'flex', '& svg': { fontSize: 16 } }}>{icon}</Box>
      <Typography variant="caption">{text}</Typography>
    </Stack>
  );
}
