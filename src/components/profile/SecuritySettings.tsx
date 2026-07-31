'use client';

import { useCallback, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { Form, SubmitButton } from '@/components/form/Form';
import { RHFPasswordField } from '@/components/form/RHFPasswordField';
import { useApiForm } from '@/components/form/useApiForm';
import { useToasts } from '@/components/ui/ToastProvider';
import { isApiError } from '@/contracts/api-error';
import { apiErrorMessage } from '@/lib/api-error';
import { auth } from '@/lib/http';
import { PASSWORD_MIN_LENGTH } from '@/schemas/rules';
import {
  changePasswordSchema,
  type ChangePasswordInput,
  type ChangePasswordValues,
} from '@/schemas/profile';

/**
 * Password and session management.
 *
 * **Both actions end this browser's session**, and the screen says so before either is taken.
 * `ChangePasswordAsync` rotates the security stamp and revokes every refresh token, so the access
 * token in our cookie is dead the moment it succeeds — the BFF handler clears the cookies and answers
 * `{ signedOut: true }` rather than leaving a session that 401s on the next click for no visible
 * reason.
 */
export function SecuritySettings() {
  const t = useTranslations('security');
  const tRoot = useTranslations();
  const router = useRouter();
  const toasts = useToasts();
  const [confirmSignOutAll, setConfirmSignOutAll] = useState(false);
  const [isSigningOut, startSignOut] = useTransition();

  const schema = useMemo(() => changePasswordSchema(tRoot), [tRoot]);

  const submit = useCallback(
    async (values: ChangePasswordValues) => {
      await auth('change-password', {
        method: 'POST',
        body: { currentPassword: values.currentPassword, newPassword: values.newPassword },
      });

      // Straight to sign-in: the session is already gone server-side, so anywhere else would just
      // bounce them there via a failed request.
      router.replace('/login');
      router.refresh();
    },
    [router],
  );

  const form = useApiForm<ChangePasswordInput, ChangePasswordValues>({
    schema,
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    onSubmit: submit,
  });

  const signOutEverywhere = useCallback(() => {
    startSignOut(async () => {
      try {
        await auth('logout-all', { method: 'POST' });
        router.replace('/');
        router.refresh();
      } catch (error) {
        toasts.error(
          isApiError(error) ? apiErrorMessage(error, (key) => tRoot(key)) : tRoot('errors.unknown'),
        );
      } finally {
        setConfirmSignOutAll(false);
      }
    });
  }, [router, toasts, tRoot]);

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {t('changePassword')}
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            {t('changeHint')}
          </Alert>

          <Form form={form}>
            <RHFPasswordField<ChangePasswordInput>
              name="currentPassword"
              label={t('currentPassword')}
              autoComplete="current-password"
            />
            <RHFPasswordField<ChangePasswordInput>
              name="newPassword"
              label={tRoot('auth.newPassword')}
              autoComplete="new-password"
              hint={tRoot('auth.passwordHint', { min: PASSWORD_MIN_LENGTH })}
            />
            <RHFPasswordField<ChangePasswordInput>
              name="confirmPassword"
              label={tRoot('auth.confirmPassword')}
              autoComplete="new-password"
            />

            <SubmitButton busy={form.formState.isSubmitting} sx={{ alignSelf: 'flex-start', mt: 1 }}>
              {t('submit')}
            </SubmitButton>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {t('signOutAll')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {t('signOutAllHint')}
          </Typography>

          <Button onClick={() => setConfirmSignOutAll(true)} variant="outlined" color="error">
            {t('signOutAll')}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmSignOutAll} onClose={() => setConfirmSignOutAll(false)}>
        <DialogTitle>{t('signOutAllConfirm')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('signOutAllBody')}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmSignOutAll(false)} color="inherit">
            {tRoot('common.cancel')}
          </Button>
          <Button
            onClick={signOutEverywhere}
            variant="contained"
            color="error"
            loading={isSigningOut}
          >
            {t('confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
