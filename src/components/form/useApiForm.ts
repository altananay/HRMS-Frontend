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

/**
 * One place where a form talks to the server and an `ApiError` comes back.
 *
 * Every form in the app uses this, so the three things that are easy to get subtly wrong are decided
 * once: which errors land on fields, which land in a banner, and which become a toast.
 *
 * **Two value types, not one.** `TInput` is what the fields hold — a number box holds a string, a
 * cleared optional field holds `''`. `TOutput` is what the schema produces after parsing and is what
 * the submit handler receives. Collapsing them makes `defaultValues: { numberOfEmployees: '' }` fail
 * to compile against a `number | undefined` field, and the usual fix — widening the schema — throws
 * away exactly the parsing the schema exists to do.
 */

export type ApiFormOptions<TInput extends FieldValues, TOutput extends FieldValues> = {
  schema: ZodType<TOutput, TInput>;
  defaultValues: DefaultValues<TInput>;
  onSubmit: (values: TOutput) => Promise<void>;
  /** Toast text on success. Omit for a form that navigates away instead. */
  successMessage?: string;
};

export type ApiFormReturn<
  TInput extends FieldValues,
  TOutput extends FieldValues = TInput,
> = UseFormReturn<TInput, unknown, TOutput> & {
  /** Give this to `<Form onSubmit>`. Handles validation, submission and error placement. */
  submit: (event?: React.BaseSyntheticEvent) => Promise<void>;
  /** Server-side message that belongs to no single field. Rendered above the fields by `<Form>`. */
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
    // Validate on blur, re-validate on change. Validating from the first keystroke flags a half-typed
    // email as invalid before the user has finished typing it.
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

          // A path the form does not have is the silent failure this whole layer exists to prevent:
          // `setError` on an unregistered field stores the message and renders nothing at all. Rather
          // than trust the translation, check the path against the actual values and promote anything
          // that does not resolve into the form-level banner, where it is at least visible.
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

        // A toast as well for anything that is not about this form's fields — a rate limit, a network
        // failure, a 500. Those are easy to miss in a banner above the fold.
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

/**
 * Whether `path` names something the form actually holds. Walks the values rather than the schema,
 * because the values are what `setError` will be matched against.
 */
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
