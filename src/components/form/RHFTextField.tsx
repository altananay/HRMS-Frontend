'use client';

import { useController, type FieldPath, type FieldValues } from 'react-hook-form';
import TextField, { type TextFieldProps } from '@mui/material/TextField';

export type RHFTextFieldProps<T extends FieldValues> = Omit<
  TextFieldProps,
  'name' | 'value' | 'onChange' | 'onBlur' | 'error' | 'helperText'
> & {
  name: FieldPath<T>;
  hint?: string;
};

export function RHFTextField<T extends FieldValues>({ name, hint, ...props }: RHFTextFieldProps<T>) {
  const { field, fieldState } = useController<T>({ name });

  return (
    <TextField
      {...props}
      {...field}
      value={field.value ?? ''}
      error={Boolean(fieldState.error)}
      helperText={fieldState.error?.message ?? hint ?? ' '}
      fullWidth={props.fullWidth ?? true}
      slotProps={{
        ...props.slotProps,
        formHelperText: { sx: { minHeight: '1.25rem' }, ...props.slotProps?.formHelperText },
      }}
    />
  );
}
