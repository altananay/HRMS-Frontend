'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button, { type ButtonProps } from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import type { SxProps, Theme } from '@mui/material/styles';
import { FormProvider, type FieldValues } from 'react-hook-form';

import type { ApiFormReturn } from './useApiForm';

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
