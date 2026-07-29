import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';

import { Logo } from '@/components/ui/Logo';

const COLUMNS = [
  {
    heading: 'explore',
    links: [
      { href: '/jobs', key: 'jobs' },
      { href: '/companies', key: 'companies' },
      { href: '/contact', key: 'contact' },
    ],
  },
  {
    heading: 'account',
    links: [
      { href: '/login', key: 'signIn' },
      { href: '/register', key: 'signUp' },
    ],
  },
] as const;

/** A server component: nothing here is interactive, so none of it needs to reach the browser. */
export async function Footer() {
  const t = await getTranslations();
  // A string, not a number: ICU formats a numeric argument through `Intl.NumberFormat`, which in
  // `tr` renders 2026 as "2.026".
  const year = String(new Date().getFullYear());

  return (
    <Box component="footer" sx={{ mt: 'auto', bgcolor: 'background.subtle' }}>
      <Divider />

      <Container sx={{ py: { xs: 6, md: 8 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 5, md: 8 }}
          sx={{ justifyContent: 'space-between' }}
        >
          <Box sx={{ maxWidth: 380 }}>
            <Logo />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {t('footer.tagline')}
            </Typography>
          </Box>

          <Stack direction="row" spacing={{ xs: 6, sm: 10 }}>
            {COLUMNS.map((column) => (
              <Stack key={column.heading} spacing={1.25}>
                <Typography variant="overline" color="text.secondary">
                  {t(`footer.${column.heading}`)}
                </Typography>

                {column.links.map((link) => (
                  <MuiLink
                    key={link.href}
                    href={link.href}
                    variant="body2"
                    color="text.primary"
                  >
                    {t(`nav.${link.key}`)}
                  </MuiLink>
                ))}
              </Stack>
            ))}
          </Stack>
        </Stack>

        <Divider sx={{ my: 4 }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
        >
          <Typography variant="caption" color="text.secondary">
            © {t('footer.rights', { year })}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('footer.builtWith')}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
