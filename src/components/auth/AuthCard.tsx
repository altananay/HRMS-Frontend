import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Card sx={{ borderRadius: 4, boxShadow: 5 }}>
      <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1">
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Stack>

        {children}

        {footer ? <Stack sx={{ mt: 3 }}>{footer}</Stack> : null}
      </CardContent>
    </Card>
  );
}
