import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';

const SIDES = [
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

const STEPS = ['stepOne', 'stepTwo', 'stepThree'] as const;

/** `id="how-it-works"` is the header's anchor target; `:target` scroll-margin is set in the theme. */
export async function AudienceSection() {
  const t = await getTranslations('home.audience');

  return (
    <Box component="section" id="how-it-works" sx={{ py: { xs: 8, md: 12 } }}>
      <Container>
        <Stack spacing={1.5} sx={{ mb: { xs: 5, md: 7 }, maxWidth: '60ch' }}>
          <Typography variant="h2">{t('title')}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {t('subtitle')}
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {SIDES.map(({ id, href, Icon, color }) => (
            <Grid key={id} size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform .2s, box-shadow .2s, border-color .2s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: 4,
                    borderColor: `${color}.light`,
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Stack direction="row" spacing={2} sx={{ mb: 2.5, alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 3,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: `${color}.lighter`,
                        color: `${color}.main`,
                        flexShrink: 0,
                      }}
                    >
                      <Icon />
                    </Box>
                    <Typography variant="overline" color="text.secondary">
                      {t(`${id}.label`)}
                    </Typography>
                  </Stack>

                  <Typography variant="h4" sx={{ mb: 3 }}>
                    {t(`${id}.title`)}
                  </Typography>

                  <Stack component="ol" spacing={2.5} sx={{ m: 0, p: 0, listStyle: 'none' }}>
                    {STEPS.map((step, index) => (
                      <Stack
                        key={step}
                        component="li"
                        direction="row"
                        spacing={2}
                        sx={{ alignItems: 'flex-start' }}
                      >
                        <Box
                          aria-hidden
                          sx={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0,
                            mt: 0.25,
                            border: '1px solid',
                            borderColor: 'divider',
                            fontSize: 13,
                            fontWeight: 700,
                            color: 'text.secondary',
                          }}
                        >
                          {index + 1}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {t(`${id}.${step}`)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>

                  <Button
                    href={href}
                    color={color}
                    endIcon={<ArrowForwardRoundedIcon />}
                    sx={{ mt: 3.5, px: 0, '&:hover': { background: 'transparent' } }}
                  >
                    {t(`${id}.cta`)}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
