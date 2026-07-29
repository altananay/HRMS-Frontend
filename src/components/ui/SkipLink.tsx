import Box from '@mui/material/Box';
import { getTranslations } from 'next-intl/server';

/**
 * The first focusable element on the page: jumps a keyboard user past the header navigation.
 *
 * Positioned off-screen rather than `display: none` — a hidden element is not focusable, so the
 * usual `visibility`/`display` trick removes the very affordance this exists to provide.
 */
export async function SkipLink({ targetId = 'main' }: { targetId?: string }) {
  const t = await getTranslations('common');

  return (
    <Box
      component="a"
      href={`#${targetId}`}
      sx={{
        position: 'absolute',
        left: 16,
        top: -80,
        // Literal rather than `theme.zIndex.tooltip`: a function value inside `sx` is a function prop,
        // and this is a server component. 1500 is that token's value.
        zIndex: 1500,
        px: 2,
        py: 1.25,
        borderRadius: 2,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        fontWeight: 600,
        textDecoration: 'none',
        boxShadow: 6,
        transition: 'top .18s',
        '&:focus-visible': { top: 16 },
      }}
    >
      {t('skipToContent')}
    </Box>
  );
}
