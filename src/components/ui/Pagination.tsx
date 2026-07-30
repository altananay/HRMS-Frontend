import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';

/**
 * Server-rendered pagination: two links and a position, not a client component with page state.
 *
 * The page number belongs in the URL for the same reason the filters do — a shared link to page 3
 * should open page 3. Building the target from the *current* search params preserves whatever filters
 * are active, which is the bug this component exists to not have.
 */
export async function Pagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (totalPages <= 1) return null;

  const t = await getTranslations('pagination');

  const hrefFor = (target: number) => {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(searchParams)) {
      if (key === 'page' || value === undefined) continue;
      params.set(key, Array.isArray(value) ? (value[0] ?? '') : value);
    }

    if (target > 1) params.set('page', String(target));

    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      component="nav"
      aria-label={t('page', { page, total: totalPages })}
      sx={{ mt: 5, alignItems: 'center', justifyContent: 'center' }}
    >
      <Button
        href={hrefFor(page - 1)}
        disabled={page <= 1}
        startIcon={<ChevronLeftRoundedIcon />}
        color="inherit"
      >
        {t('previous')}
      </Button>

      <Typography variant="body2" color="text.secondary">
        {t('page', { page, total: totalPages })}
      </Typography>

      <Button
        href={hrefFor(page + 1)}
        disabled={page >= totalPages}
        endIcon={<ChevronRightRoundedIcon />}
        color="inherit"
      >
        {t('next')}
      </Button>
    </Stack>
  );
}
