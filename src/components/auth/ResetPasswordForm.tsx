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
