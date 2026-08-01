import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { displayFontFamily } from '@/theme/tokens';

export function Logo({
  size = 32,
  showWordmark = true,
}: {
  size?: number;
  showWordmark?: boolean;
}) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
      <Box
        component="svg"
        viewBox="0 0 32 32"
        role="presentation"
        sx={{ width: size, height: size, display: 'block', color: 'primary.main', flexShrink: 0 }}
      >
        <path
          fillRule="evenodd"
          fill="currentColor"
          d="M8 0h16a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8V8a8 8 0 0 1 8-8zM10 8h3.5v6h5V8H22v16h-3.5v-6H13.5v6H10V8z"
        />
      </Box>

      {showWordmark ? (
        <Typography
          component="span"
          sx={{
            fontFamily: displayFontFamily,
            fontWeight: 800,
            fontSize: size * 0.6,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          HRMS
        </Typography>
      ) : null}
    </Stack>
  );
}
