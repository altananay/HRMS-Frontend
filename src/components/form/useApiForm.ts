'use client';

import { useCallback, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Path,
  type UseFormReturn,
} from 'react-hook-form';
import type { ZodType } from 'zod';

import { isApiError } from '@/contracts/api-error';
import { useToasts } from '@/components/ui/ToastProvider';
import { apiErrorMessage, hasFieldErrors } from '@/lib/api-error';

export type ApiFormOptions<TInput extends FieldValues, TOutput extends FieldValues> = {
  schema: ZodType<TOutput, TInput>;
  defaultValues: DefaultValues<TInput>;
  onSubmit: (values: TOutput) => Promise<void>;
  successMessage?: string;
};

export type ApiFormReturn<
  TInput extends FieldValues,
  TOutput extends FieldValues = TInput,
> = UseFormReturn<TInput, unknown, TOutput> & {
  submit: (event?: React.BaseSyntheticEvent) => Promise<void>;
  formError: string | undefined;
};

export function useApiForm<TInput extends FieldValues, TOutput extends FieldValues = TInput>({
  schema,
  defaultValues,
  onSubmit,
  successMessage,
}: ApiFormOptions<TInput, TOutput>): ApiFormReturn<TInput, TOutput> {
  const t = useTranslations();
  const toasts = useToasts();

  const form = useForm<TInput, unknown, TOutput>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onTouched',
  });

  const { setError, getValues } = form;

  const handleError = useCallback(
    (error: unknown) => {
      if (!isApiError(error)) {
        toasts.error(t('errors.unknown'));
        throw error;
      }

      const unplaceable: string[] = [];

      if (hasFieldErrors(error)) {
        for (const [path, messages] of Object.entries(error.fieldErrors ?? {})) {
          const message = messages.join(' ');

          if (resolves(getValues(), path)) {
            setError(path as Path<TInput>, { type: 'server', message });
          } else {
            unplaceable.push(message);
          }
        }
      }

      if (unplaceable.length > 0 || !hasFieldErrors(error)) {
        const message =
          unplaceable.length > 0 ? unplaceable.join(' ') : apiErrorMessage(error, (key) => t(key));

        setError('root.server', { type: 'server', message });

        if (!hasFieldErrors(error)) toasts.error(message);
      }
    },
    [getValues, setError, t, toasts],
  );

  const submit = useMemo(
    () =>
      form.handleSubmit(async (values) => {
        form.clearErrors('root');

        try {
          await onSubmit(values);
          if (successMessage) toasts.success(successMessage);
        } catch (error) {
          handleError(error);
        }
      }),
    [form, handleError, onSubmit, successMessage, toasts],
  );

  return {
    ...form,
    submit,
    formError: form.formState.errors.root?.server?.message,
  };
}

function resolves(values: unknown, path: string): boolean {
  let node: unknown = values;

  for (const segment of path.split('.')) {
    if (node === null || typeof node !== 'object') return false;

    const container = node as Record<string, unknown>;
    if (!(segment in container)) return false;

    node = container[segment];
  }

  return true;
}
