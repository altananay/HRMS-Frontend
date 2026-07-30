import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import { gradients } from '@/theme/palette';
import { darkScheme } from '@/theme/tokens';

/**
 * The shell every auth screen sits in: a narrow, centred column on the same mesh gradient as the
 * hero, so signing in feels like part of the site rather than a separate application.
 *
 * The header and footer come from the root layout and stay — a visitor who lands on `/login` from an
 * email should still be able to navigate.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { md: 'calc(100vh - 76px)' },
        display: 'flex',
        alignItems: 'center',
        mt: { xs: -8, md: -9.5 },
        pt: { xs: 14, md: 18 },
        pb: { xs: 8, md: 12 },
        backgroundImage: gradients.heroLight,
        [darkScheme]: { backgroundImage: gradients.heroDark },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative' }}>
        {children}
      </Container>
    </Box>
  );
}
