import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';

import { darkScheme } from '@/theme/tokens';

export async function PipelinePreview() {
  const t = await getTranslations('home.hero');

  const stages = [
    { key: 'stageSubmitted', done: true },
    { key: 'stageUnderReview', done: true },
    { key: 'stageInterview', done: true },
    { key: 'stageOffered', done: false },
  ] as const;

  return (
    <Card
      aria-hidden
      sx={{
        borderRadius: 4,
        boxShadow: 6,
        transform: { md: 'rotate(-1.2deg)' },
        backdropFilter: 'blur(6px)',
        backgroundColor: 'rgba(255,255,255,0.82)',
        [darkScheme]: { backgroundColor: 'rgba(17, 28, 46, 0.72)' },
      }}
    >
      <CardContent>
        <Typography variant="overline" color="primary">
          {t('pipelineTitle')}
        </Typography>

        <Stack spacing={0} sx={{ mt: 2 }}>
          {stages.map((stage, index) => (
            <Stack key={stage.key} direction="row" spacing={2}>
              <Stack sx={{ width: 28, alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    bgcolor: stage.done ? 'primary.main' : 'transparent',
                    color: stage.done ? 'primary.contrastText' : 'text.disabled',
                    border: stage.done ? 'none' : '2px dashed',
                    borderColor: 'divider',
                  }}
                >
                  {stage.done ? <CheckRoundedIcon sx={{ fontSize: 16 }} /> : null}
                </Box>

                {index < stages.length - 1 ? (
                  <Box
                    sx={{
                      width: 2,
                      flex: 1,
                      minHeight: 28,
                      bgcolor: stages[index + 1]?.done ? 'primary.light' : 'divider',
                    }}
                  />
                ) : null}
              </Stack>

              <Box sx={{ pb: index < stages.length - 1 ? 2.5 : 0 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: stage.done ? 'text.primary' : 'text.secondary' }}
                >
                  {t(stage.key)}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {t('pipelineCaption')}
        </Typography>
      </CardContent>
    </Card>
  );
}
