import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';

import { Logo } from '@/components/ui/Logo';
import { DASHBOARD_BY_USER_TYPE } from '@/lib/dashboards';
import { getSession } from '@/server/session';

const EXPLORE = {
  heading: 'explore',
  links: [
    { href: '/jobs', key: 'jobs' },
    { href: '/companies', key: 'companies' },
    { href: '/contact', key: 'contact' },
  ],
} as const;

const ANONYMOUS_ACCOUNT = {
  heading: 'account',
  links: [
    { href: '/login', key: 'signIn' },
    { href: '/register', key: 'signUp' },
  ],
} as const;

export async function Footer() {
  const [t, user] = await Promise.all([getTranslations(), getSession()]);
  const year = String(new Date().getFullYear());

  const columns = [
    EXPLORE,
    user
      ? {
          heading: 'account' as const,
          links: [
            { href: DASHBOARD_BY_USER_TYPE[user.userType] ?? '/', key: 'dashboard' as const },
          ],
        }
      : ANONYMOUS_ACCOUNT,
  ];

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
            {columns.map((column) => (
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
                    {link.key === 'dashboard' ? t('auth.dashboard') : t(`nav.${link.key}`)}
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
