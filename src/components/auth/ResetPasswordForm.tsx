'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { Form, SubmitButton } from '@/components/form/Form';
import { RHFPasswordField } from '@/components/form/RHFPasswordField';
import { useApiForm } from '@/components/form/useApiForm';
import { auth } from '@/lib/http';
import { PASSWORD_MIN_LENGTH } from '@/schemas/rules';
import {
  resetPasswordSchema,
  toResetPasswordRequest,
  type ResetPasswordInput,
  type ResetPasswordValues,
} from '@/schemas/auth';

/**
 * Consumes the emailed token and sets a new password.
 *
 * The token comes from the query string and is never rendered — not in a hidden input, not in a
 * message. It is a single-use credential; putting it in the DOM would leak it to anything that can
 * read the page, and echoing it into an error message would leak it into logs and screenshots.
 *
 * The token is *not* validated client-side beyond "present". Whether it is genuine, unexpired and
 * unused is the server's decision, and a client-side guess would only produce a second, contradictory
 * source of truth.
 */
export function ResetPasswordForm() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [done, setDone] = useState(false);
  const schema = useMemo(() => resetPasswordSchema(t), [t]);

  const submit = useCallback(
    async (values: ResetPasswordValues) => {
      await auth('reset-password', {
        method: 'POST',
        body: toResetPasswordRequest(values, token),
      });
      setDone(true);
    },
    [token],
  );

  const form = useApiForm<ResetPasswordInput, ResetPasswordValues>({
    schema,
    defaultValues: { newPassword: '', confirmPassword: '' },
    onSubmit: submit,
  });

  if (!token) {
    return (
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Alert severity="warning" sx={{ width: '100%' }}>
          {t('auth.reset.missingToken')}
        </Alert>
        <Button href="/forgot-password" variant="contained">
          {t('auth.reset.requestAgain')}
        </Button>
      </Stack>
    );
  }

  if (done) {
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
          <CheckCircleOutlineRoundedIcon />
        </Box>

        <Typography variant="h5">{t('auth.reset.successTitle')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t('auth.reset.successBody')}
        </Typography>

        <Button href="/login" variant="contained" sx={{ mt: 1 }}>
          {t('auth.login.submit')}
        </Button>
      </Stack>
    );
  }

  return (
    <Form form={form}>
      <RHFPasswordField<ResetPasswordInput>
        name="newPassword"
        label={t('auth.newPassword')}
        autoComplete="new-password"
        hint={t('auth.passwordHint', { min: PASSWORD_MIN_LENGTH })}
        autoFocus
      />

      {/*
        The one place a confirmation box earns its keep: the user cannot see what they typed, cannot
        sign in to check it, and a typo locks them out of the account they are trying to recover.
      */}
      <RHFPasswordField<ResetPasswordInput>
        name="confirmPassword"
        label={t('auth.confirmPassword')}
        autoComplete="new-password"
      />

      <SubmitButton busy={form.formState.isSubmitting} fullWidth sx={{ mt: 1 }}>
        {t('auth.reset.submit')}
      </SubmitButton>
    </Form>
  );
}
