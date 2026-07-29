import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';

import { displayFontFamily } from '@/theme/tokens';

export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <Container sx={{ py: { xs: 10, md: 16 } }}>
      <Stack spacing={3} sx={{ maxWidth: '52ch' }}>
        <Box
          aria-hidden
          sx={{
            fontFamily: displayFontFamily,
            fontWeight: 800,
            fontSize: 'clamp(4rem, 12vw, 8rem)',
            lineHeight: 1,
            letterSpacing: '-0.05em',
            color: 'primary.lighter',
          }}
        >
          404
        </Box>

        <Typography variant="h2">{t('title')}</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {t('description')}
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
          <Button href="/" variant="contained" size="large">
            {t('home')}
          </Button>
          <Button href="/jobs" variant="outlined" size="large">
            {t('jobs')}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
