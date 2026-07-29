import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';

const FEATURES = [
  { id: 'cv', Icon: ArticleOutlinedIcon },
  { id: 'files', Icon: UploadFileOutlinedIcon },
  { id: 'postings', Icon: CampaignOutlinedIcon },
  { id: 'tracking', Icon: TimelineOutlinedIcon },
  { id: 'moderation', Icon: AdminPanelSettingsOutlinedIcon },
  { id: 'language', Icon: LanguageOutlinedIcon },
] as const;

export async function FeaturesSection() {
  const t = await getTranslations('home.features');

  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.subtle' }}>
      <Container>
        <Stack spacing={1.5} sx={{ mb: { xs: 5, md: 7 }, maxWidth: '60ch' }}>
          <Typography variant="h2">{t('title')}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {t('subtitle')}
          </Typography>
        </Stack>

        {/*
          A plain grid of bordered tiles, no cards: six elevated cards in a row is visual noise, and
          the section already sits on its own background tone.
        */}
        <Grid container spacing={3}>
          {FEATURES.map(({ id, Icon }) => (
            <Grid key={id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Stack
                spacing={1.5}
                sx={{
                  height: '100%',
                  p: 3,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  transition: 'border-color .2s, transform .2s',
                  '&:hover': { borderColor: 'primary.light', transform: 'translateY(-2px)' },
                }}
              >
                <Box sx={{ color: 'primary.main' }}>
                  <Icon />
                </Box>
                <Typography variant="h6">{t(`${id}Title`)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t(`${id}Body`)}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
