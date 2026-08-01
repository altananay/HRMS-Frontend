'use client';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { useController, type FieldPath, type FieldValues } from 'react-hook-form';

export function RHFDateField<T extends FieldValues>({
  name,
  label,
  hint,
  minDate,
  maxDate,
  disabled,
}: {
  name: FieldPath<T>;
  label: string;
  hint?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}) {
  const { field, fieldState } = useController<T>({ name });
  const value: Dayjs | null = field.value ? dayjs(field.value as Date) : null;

  return (
    <DatePicker
      label={label}
      value={value}
      disabled={disabled}
      minDate={minDate ? dayjs(minDate) : undefined}
      maxDate={maxDate ? dayjs(maxDate) : undefined}
      onChange={(next) => field.onChange(next ? next.toDate() : null)}
      slotProps={{
        textField: {
          fullWidth: true,
          onBlur: field.onBlur,
          error: Boolean(fieldState.error),
          helperText: fieldState.error?.message ?? hint ?? ' ',
        },
      }}
    />
  );
}
