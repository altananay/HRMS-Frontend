import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getFormatter, getTranslations } from 'next-intl/server';

import type { JobAdvertisementResponse } from '@/contracts/responses';

import { CompanyAvatar } from '@/components/companies/CompanyAvatar';
import { formatSalary } from './salary';

/**
 * One opening in a list. The whole card is the link — a small "view" button would be a smaller
 * target for no benefit.
 *
 * At most four skills are shown, with a count for the rest: a card with fourteen chips pushes the
 * next card off the screen and stops being scannable, which is the only job a card in a list has.
 */
export async function JobCard({ job }: { job: JobAdvertisementResponse }) {
  const t = await getTranslations('jobs');
  const format = await getFormatter();

  const visibleSkills = job.skills.slice(0, 4);
  const hiddenSkills = job.skills.length - visibleSkills.length;
  const salary = formatSalary(job, format, t);

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform .2s, box-shadow .2s, border-color .2s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 3, borderColor: 'primary.light' },
      }}
    >
      <CardActionArea href={`/jobs/${job.id}`} sx={{ height: '100%', alignItems: 'stretch' }}>
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'flex-start' }}>
            <CompanyAvatar name={job.companyName} />

            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="h6" sx={{ lineHeight: 1.3 }}>
                {job.title}
              </Typography>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mt: 0.5 }}>
                <ApartmentRoundedIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                <Typography variant="body2" color="text.secondary" noWrap>
                  {job.companyName}
                </Typography>
              </Stack>
            </Box>

            <Chip label={t(`jobType.${job.jobType}`)} size="small" variant="outlined" />
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            sx={{ flexWrap: 'wrap', rowGap: 0.5, mb: 2, color: 'text.secondary' }}
          >
            <Meta icon={<LocationOnOutlinedIcon />} text={job.city ?? t('remoteCity')} />
            <Meta icon={<PaymentsOutlinedIcon />} text={salary} />
            <Meta
              icon={<AccessTimeRoundedIcon />}
              text={t('deadline', { date: format.dateTime(new Date(job.deadline), 'short') })}
            />
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {job.description}
          </Typography>

          <Stack
            direction="row"
            spacing={0.75}
            sx={{ flexWrap: 'wrap', rowGap: 0.75, mt: 'auto', pt: 1 }}
          >
            {visibleSkills.map((skill) => (
              <Chip key={skill} label={skill} size="small" />
            ))}
            {hiddenSkills > 0 ? (
              <Chip label={`+${hiddenSkills}`} size="small" variant="outlined" />
            ) : null}
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
