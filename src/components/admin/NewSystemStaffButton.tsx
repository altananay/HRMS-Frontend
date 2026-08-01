'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { Form, SubmitButton } from '@/components/form/Form';
import { RHFPasswordField } from '@/components/form/RHFPasswordField';
import { RHFTextField } from '@/components/form/RHFTextField';
import { useApiForm } from '@/components/form/useApiForm';
import { auth } from '@/lib/http';
import { MAX, email, newPassword, requiredText, PASSWORD_MIN_LENGTH, type Translate } from '@/schemas/rules';

function schemaFor(t: Translate) {
  return z.object({
    email: email(t),
    password: newPassword(t),
    firstName: requiredText(t, { min: 2, max: MAX.name }),
    lastName: requiredText(t, { min: 2, max: MAX.name }),
  });
}

type Values = z.output<ReturnType<typeof schemaFor>>;
type Input = z.input<ReturnType<typeof schemaFor>>;

export function NewSystemStaffButton() {
  const t = useTranslations('admin');
  const tRoot = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const schema = useMemo(() => schemaFor(tRoot), [tRoot]);

  const submit = useCallback(
    async (values: Values) => {
      await auth('register/system-staff', { method: 'POST', body: values });
      setOpen(false);
      router.refresh();
    },
    [router],
  );

  const form = useApiForm<Input, Values>({
    schema,
    defaultValues: { email: '', password: '', firstName: '', lastName: '' },
    onSubmit: submit,
    successMessage: t('systemStaffCreated'),
  });

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="contained">
        {t('newSystemStaff')}
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('newSystemStaffTitle')}</DialogTitle>
        <DialogContent>
          <Form form={form} sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFTextField<Input> name="firstName" label={tRoot('auth.firstName')} autoFocus />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFTextField<Input> name="lastName" label={tRoot('auth.lastName')} />
              </Grid>
              <Grid size={12}>
                <RHFTextField<Input> name="email" label={tRoot('auth.email')} type="email" />
              </Grid>
              <Grid size={12}>
                <RHFPasswordField<Input>
                  name="password"
                  label={tRoot('auth.password')}
                  hint={tRoot('auth.passwordHint', { min: PASSWORD_MIN_LENGTH })}
                />
              </Grid>
            </Grid>

            <SubmitButton busy={form.formState.isSubmitting} sx={{ alignSelf: 'flex-end', mt: 1 }}>
              {t('create')}
            </SubmitButton>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
