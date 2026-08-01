import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box component="fieldset" sx={{ border: 0, p: 0, m: 0, mb: 2, minInlineSize: 0 }}>
      <Typography component="legend" variant="overline" color="text.secondary" sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}
