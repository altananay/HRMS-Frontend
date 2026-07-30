import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * A labelled group of fields.
 *
 * A `<fieldset>` with a `<legend>` rather than a heading and a `<div>`: assistive technology
 * announces the legend when focus enters any field in the group, which is what turns "Name" into
 * "Company details, Name" for someone who cannot see the layout. The browser's default fieldset
 * border and padding are reset — the visual grouping comes from spacing.
 */
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
