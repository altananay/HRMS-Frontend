'use client';

import { useController, type FieldPath, type FieldValues } from 'react-hook-form';
import TextField, { type TextFieldProps } from '@mui/material/TextField';

/**
 * The default field. Everything in every form goes through one of these wrappers rather than through
 * a bare `TextField`.
 *
 * The point is that error display, the `undefined`/`''` boundary and accessibility wiring are decided
 * once. A bare `TextField` inside a form means this component is missing a feature — add it here.
 *
 * `value ?? ''` is not cosmetic: an optional field whose schema transforms empty input to `undefined`
 * would otherwise flip the input from controlled to uncontrolled mid-edit, and React resets the
 * cursor to the end of the text when that happens.
 */
export type RHFTextFieldProps<T extends FieldValues> = Omit<
  TextFieldProps,
  'name' | 'value' | 'onChange' | 'onBlur' | 'error' | 'helperText'
> & {
  name: FieldPath<T>;
  /** Shown when there is no error, so the space does not collapse and shift the layout. */
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
