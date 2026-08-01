import Box from '@mui/material/Box';
import { getTranslations } from 'next-intl/server';

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
