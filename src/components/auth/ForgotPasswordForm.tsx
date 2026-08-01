'use client';

import { useCallback, useMemo, useState } from 'react';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { Form, SubmitButton } from '@/components/form/Form';
import { RHFTextField } from '@/components/form/RHFTextField';
import { useApiForm } from '@/components/form/useApiForm';
import { auth } from '@/lib/http';
import {
  forgotPasswordSchema,
  toForgotPasswordRequest,
  type ForgotPasswordInput,
  type ForgotPasswordValues,
} from '@/schemas/auth';

export function ForgotPasswordForm() {
  const t = useTranslations();
  const [sent, setSent] = useState(false);
  const schema = useMemo(() => forgotPasswordSchema(t), [t]);

  const submit = useCallback(async (values: ForgotPasswordValues) => {
    await auth('forgot-password', { method: 'POST', body: toForgotPasswordRequest(values) });
    setSent(true);
  }, []);

  const form = useApiForm<ForgotPasswordInput, ForgotPasswordValues>({
    schema,
    defaultValues: { email: '' },
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

        <Typography variant="h5">{t('auth.forgot.sentTitle')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t('auth.forgot.sentBody')}
        </Typography>

        <Button href="/login" variant="outlined" sx={{ mt: 1 }}>
          {t('auth.forgot.backToLogin')}
        </Button>
      </Stack>
    );
  }

  return (
    <Form form={form}>
      <RHFTextField<ForgotPasswordInput>
        name="email"
        label={t('auth.email')}
        type="email"
        autoComplete="email"
        autoFocus
      />

      <SubmitButton busy={form.formState.isSubmitting} fullWidth sx={{ mt: 1 }}>
        {t('auth.forgot.submit')}
      </SubmitButton>

      <Button href="/login" sx={{ mt: 2 }}>
        {t('auth.forgot.backToLogin')}
      </Button>
    </Form>
  );
}
