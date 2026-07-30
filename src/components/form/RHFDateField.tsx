'use client';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { useController, type FieldPath, type FieldValues } from 'react-hook-form';

/**
 * A date field whose form value is a plain `Date`, not a `Dayjs`.
 *
 * MUI's picker speaks `Dayjs`; the schemas and mappers speak `Date`. Converting at this boundary — in
 * one place — is what keeps `dayjs` out of `schemas/` and out of the mappers, where a `Dayjs` slipping
 * through would be serialized by `JSON.stringify` as a UTC ISO string and shift the date by a day in
 * UTC+3.
 *
 * `null` is the empty value throughout, never `undefined`: RHF treats `undefined` as "field absent"
 * and stops tracking it.
 */
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
