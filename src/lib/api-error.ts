import type { ApiError, ApiErrorCode } from '@/contracts/api-error';

const PREFER_DETAIL: ReadonlySet<ApiErrorCode> = new Set(['business', 'conflict']);

export function errorMessageKey(code: ApiErrorCode): `errors.${ApiErrorCode}` {
  return `errors.${code}`;
}

export function apiErrorMessage(
  error: ApiError,
  translate: (key: `errors.${ApiErrorCode}`) => string,
): string {
  if (PREFER_DETAIL.has(error.code) && error.detail?.trim()) {
    return error.detail;
  }

  return translate(errorMessageKey(error.code));
}

export function hasFieldErrors(error: ApiError): boolean {
  return error.code === 'validation' && Object.keys(error.fieldErrors ?? {}).length > 0;
}
