'use client';

import { useEffect } from 'react';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

/**
 * The route error boundary. It sits inside the root layout, so the header, footer and the i18n and
 * theme providers are all still mounted — which is why `useTranslations` works here.
 *
 * The `error` object is deliberately not rendered. In production Next replaces the message with a
 * digest anyway, and in development it can carry a .NET exception message straight from the API.
 * It goes to the console and nowhere else.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('errorPage');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container sx={{ py: { xs: 10, md: 16 } }}>
      <Stack spacing={3} sx={{ maxWidth: '52ch' }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'error.main',
            color: 'error.contrastText',
          }}
        >
          <ErrorOutlineRoundedIcon />
        </Box>

        <Typography variant="h2">{t('title')}</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {t('description')}
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
          <Button
            onClick={reset}
            variant="contained"
            size="large"
            startIcon={<RefreshRoundedIcon />}
          >
            {t('retry')}
          </Button>
          <Button href="/" variant="outlined" size="large">
            {t('home')}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
