import type { Metadata } from 'next';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTranslations } from 'next-intl/server';

import { ContactForm } from '@/components/contact/ContactForm';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('contact');
  return { title: t('title') };
}

export default async function ContactPage() {
  const t = await getTranslations('contact');

  return (
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h2" component="h1">
          {t('title')}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {t('subtitle')}
        </Typography>
      </Stack>

      <Card>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <ContactForm />
        </CardContent>
      </Card>
    </Container>
  );
}
