import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { PanelNav, type PanelNavItem } from './PanelNav';

export function PanelLayout({
  title,
  description,
  items,
  actions,
  children,
}: {
  title: string;
  description?: string;
  items: readonly PanelNavItem[];
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      <Grid container spacing={{ xs: 3, md: 5 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <PanelNav items={items} />
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{
              mb: 4,
              justifyContent: 'space-between',
              alignItems: { sm: 'flex-start' },
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h3" component="h1">
                {title}
              </Typography>
              {description ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  {description}
                </Typography>
              ) : null}
            </Box>

            {actions ? <Box sx={{ flexShrink: 0 }}>{actions}</Box> : null}
          </Stack>

          {children}
        </Grid>
      </Grid>
    </Container>
  );
}
