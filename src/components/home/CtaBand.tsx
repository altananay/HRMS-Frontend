import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';

import { brand } from '@/theme/palette';

export async function CtaBand() {
  const t = await getTranslations('home.cta');

  return (
    <Box component="section" sx={{ py: { xs: 6, md: 10 } }}>
      <Container>
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 5,
            px: { xs: 4, md: 8 },
            py: { xs: 6, md: 8 },
            // The one saturated surface on the page. It stays dark in both colour schemes on
            // purpose: an inverted band is what makes it read as the end of the page.
            backgroundImage: `linear-gradient(135deg, ${brand[900]}, ${brand[700]} 55%, ${brand[600]})`,
            color: '#FFFFFF',
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              top: -120,
              right: -80,
              width: 380,
              height: 380,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(255,255,255,0.18), transparent 65%)`,
              pointerEvents: 'none',
            }}
          />

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={4}
            sx={{
              position: 'relative',
              alignItems: { md: 'center' },
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ maxWidth: '46ch' }}>
              <Typography variant="h3" sx={{ mb: 1.5 }}>
                {t('title')}
              </Typography>
              <Typography sx={{ opacity: 0.86 }}>{t('subtitle')}</Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ flexShrink: 0 }}>
              <Button
                href="/register"
                size="large"
                variant="contained"
                sx={{
                  bgcolor: '#FFFFFF',
                  color: brand[800],
                  '&:hover': { bgcolor: brand[50] },
                }}
              >
                {t('primary')}
              </Button>

              <Button
                href="/jobs"
                size="large"
                variant="outlined"
                sx={{
                  color: '#FFFFFF',
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': { borderColor: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.08)' },
                }}
              >
                {t('secondary')}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
