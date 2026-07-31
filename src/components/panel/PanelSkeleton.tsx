import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

/**
 * What a panel route shows while its server component fetches.
 *
 * Every panel screen is dynamic and reads the API before it can render anything, so without this the
 * browser sits on the previous page after a click and the app feels stuck. The shape deliberately
 * matches `PanelLayout` — nav column, title block, content — so the real screen replaces it in place
 * instead of appearing to jump.
 *
 * `aria-busy` on the wrapper, and nothing readable inside: a screen reader should hear "busy", not a
 * list of empty boxes.
 */
export function PanelSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Container sx={{ py: { xs: 4, md: 6 } }} aria-busy>
      <Grid container spacing={{ xs: 3, md: 5 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Stack spacing={1.25}>
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} variant="rounded" height={40} />
            ))}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          <Skeleton variant="text" width="40%" height={44} />
          <Skeleton variant="text" width="60%" sx={{ mb: 4 }} />

          <Stack spacing={2}>
            {Array.from({ length: rows }, (_, index) => (
              <Skeleton key={index} variant="rounded" height={96} />
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
