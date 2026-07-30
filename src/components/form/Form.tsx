'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button, { type ButtonProps } from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import type { SxProps, Theme } from '@mui/material/styles';
import { FormProvider, type FieldValues } from 'react-hook-form';

import type { ApiFormReturn } from './useApiForm';

/**
 * Wraps a form's fields in RHF context and renders the server-side banner above them.
 *
 * The banner has `role="alert"` so a screen reader announces it — a message that only appears
 * visually, above a viewport the user has already scrolled past, is a message nobody reads.
 */
export function Form<TInput extends FieldValues, TOutput extends FieldValues>({
  form,
  children,
  sx,
}: {
  form: ApiFormReturn<TInput, TOutput>;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}) {
  return (
    <FormProvider {...form}>
      <Box component="form" noValidate onSubmit={form.submit} sx={sx}>
        {form.formError ? (
          <Alert severity="error" role="alert" sx={{ mb: 3 }}>
            {form.formError}
          </Alert>
        ) : null}

        <Stack spacing={0.5}>{children}</Stack>
      </Box>
    </FormProvider>
  );
}

/**
 * The submit button.
 *
 * `busy`, not `form` — `form` is already an HTML attribute on `<button>` and MUI types it as the id
 * of the form to submit, so passing the RHF object under that name silently type-errors into
 * `string`. MUI's own `loading` prop handles the spinner and the disabled state, and keeps the label
 * in place so the button does not resize under the pointer at the moment the user might click again.
 */
export function SubmitButton({
  busy,
  children,
  ...props
}: { busy: boolean; children: React.ReactNode } & Omit<ButtonProps, 'type' | 'loading'>) {
  return (
    <Button type="submit" variant="contained" size="large" loading={busy} {...props}>
      {children}
    </Button>
  );
}
