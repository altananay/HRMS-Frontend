'use client';

import { useState } from 'react';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { useTranslations } from 'next-intl';
import type { FieldPath, FieldValues } from 'react-hook-form';

import { RHFTextField, type RHFTextFieldProps } from './RHFTextField';

export function RHFPasswordField<T extends FieldValues>(
  props: Omit<RHFTextFieldProps<T>, 'type'> & { name: FieldPath<T> },
) {
  const t = useTranslations('auth');
  const [visible, setVisible] = useState(false);

  return (
    <RHFTextField<T>
      {...props}
      type={visible ? 'text' : 'password'}
      slotProps={{
        ...props.slotProps,
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setVisible((shown) => !shown)}
                edge="end"
                size="small"
                tabIndex={-1}
                aria-label={visible ? t('hidePassword') : t('showPassword')}
              >
                {visible ? (
                  <VisibilityOffOutlinedIcon fontSize="small" />
                ) : (
                  <VisibilityOutlinedIcon fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ),
          ...props.slotProps?.input,
        },
      }}
    />
  );
}
