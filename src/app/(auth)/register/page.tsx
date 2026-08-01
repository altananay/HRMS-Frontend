import type { Metadata } from 'next';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.register');
  return { title: t('title') };
}

const CHOICES = [
  {
    id: 'seeker',
    href: '/register/jobseeker',
    Icon: PersonSearchRoundedIcon,
    color: 'primary',
  },
  {
    id: 'employer',
    href: '/register/employer',
    Icon: ApartmentRoundedIcon,
    color: 'secondary',
  },
] as const;

export default async function RegisterPage() {
  const t = await getTranslations('auth.register');

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h3" component="h1">
          {t('title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('subtitle')}
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {CHOICES.map(({ id, href, Icon, color }) => (
          <Card key={id} sx={{ borderRadius: 4 }}>
            <CardActionArea href={href} sx={{ p: 0.5 }}>
              <CardContent>
                <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 3,
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      bgcolor: `${color}.lighter`,
                      color: `${color}.main`,
                    }}
                  >
                    <Icon />
                  </Box>

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{t(`${id}Title`)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t(`${id}Body`)}
                    </Typography>
                  </Box>

                  <ArrowForwardRoundedIcon sx={{ color: 'text.disabled' }} />
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        {t('haveAccount')} <MuiLink href="/login">{t('signIn')}</MuiLink>
      </Typography>
    </Stack>
  );
}
