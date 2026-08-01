'use client';

import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import { useController, type FieldPath, type FieldValues } from 'react-hook-form';

export function RHFTagsField<T extends FieldValues>({
  name,
  label,
  placeholder,
  hint,
  options = [],
  disabled,
}: {
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  hint?: string;
  options?: readonly string[];
  disabled?: boolean;
}) {
  const { field, fieldState } = useController<T>({ name });
  const value: string[] = Array.isArray(field.value) ? field.value : [];

  return (
    <Autocomplete
      multiple
      freeSolo
      options={options}
      value={value}
      disabled={disabled}
      onChange={(_event, next) => {
        const cleaned = next
          .map((entry) => entry.trim())
          .filter((entry, index, all) => entry.length > 0 && all.indexOf(entry) === index);

        field.onChange(cleaned);
      }}
      onBlur={field.onBlur}
      renderValue={(items, getItemProps) =>
        items.map((item, index) => (
          <Chip size="small" label={item} {...getItemProps({ index })} key={item} />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={value.length === 0 ? placeholder : undefined}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message ?? hint ?? ' '}
          slotProps={{
            ...params.slotProps,
            formHelperText: { sx: { minHeight: '1.25rem' } },
          }}
        />
      )}
    />
  );
}
