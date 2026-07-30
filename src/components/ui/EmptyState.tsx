import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * What a list looks like when there is nothing in it.
 *
 * Worth a component rather than a `<p>No results</p>`: an empty region with no explanation is
 * indistinguishable from a page that failed to load, and the difference matters to whoever is looking
 * at it. Every empty state here says what is missing and, where there is one, what to do about it.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Stack
      spacing={2}
      sx={{
        alignItems: 'center',
        textAlign: 'center',
        py: { xs: 6, md: 10 },
        px: 3,
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 4,
        bgcolor: 'background.subtle',
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          color: 'text.disabled',
        }}
      >
        {icon ?? <SearchOffRoundedIcon />}
      </Box>

      <Typography variant="h6">{title}</Typography>

      {description ? (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '44ch' }}>
          {description}
        </Typography>
      ) : null}

      {action}
    </Stack>
  );
}
