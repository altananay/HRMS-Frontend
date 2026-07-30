'use client';

import { useCallback, useMemo, useState } from 'react';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { Form, SubmitButton } from '@/components/form/Form';
import { RHFTextField } from '@/components/form/RHFTextField';
import { useApiForm } from '@/components/form/useApiForm';
import { api } from '@/lib/http';
import {
  contactSchema,
  toCreateContactRequest,
  type ContactInput,
  type ContactValues,
} from '@/schemas/contact';

/** The public contact form. `POST Contacts` is anonymous upstream, so no session is involved. */
export function ContactForm() {
  const t = useTranslations();
  const [sent, setSent] = useState(false);

  const schema = useMemo(() => contactSchema(t), [t]);

  const submit = useCallback(async (values: ContactValues) => {
    await api('Contacts', { method: 'POST', body: toCreateContactRequest(values) });
    setSent(true);
  }, []);

  const form = useApiForm<ContactInput, ContactValues>({
    schema,
    defaultValues: { firstName: '', lastName: '', email: '', subject: '', message: '' },
    onSubmit: submit,
  });

  if (sent) {
    return (
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 3,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'success.main',
            color: 'common.white',
          }}
        >
          <MarkEmailReadOutlinedIcon />
        </Box>

        <Typography variant="h5">{t('contact.sentTitle')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t('contact.sentBody')}
        </Typography>

        <Button
          onClick={() => {
            form.reset();
            setSent(false);
          }}
          variant="outlined"
          sx={{ mt: 1 }}
        >
          {t('contact.another')}
        </Button>
      </Stack>
    );
  }

  return (
    <Form form={form}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <RHFTextField<ContactInput>
            name="firstName"
            label={t('auth.firstName')}
            autoComplete="given-name"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <RHFTextField<ContactInput>
            name="lastName"
            label={t('auth.lastName')}
            autoComplete="family-name"
          />
        </Grid>
        <Grid size={12}>
          <RHFTextField<ContactInput>
            name="email"
            label={t('auth.email')}
            type="email"
            autoComplete="email"
          />
        </Grid>
        <Grid size={12}>
          <RHFTextField<ContactInput> name="subject" label={t('contact.subject')} />
        </Grid>
        <Grid size={12}>
          <RHFTextField<ContactInput>
            name="message"
            label={t('contact.message')}
            multiline
            minRows={5}
          />
        </Grid>
      </Grid>

      <SubmitButton busy={form.formState.isSubmitting} sx={{ mt: 1, alignSelf: 'flex-start' }}>
        {t('contact.submit')}
      </SubmitButton>
    </Form>
  );
}
