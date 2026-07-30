import type { ApiError, ApiErrorCode } from '@/contracts/api-error';

/**
 * Turning an `ApiError` into something a person should read.
 *
 * The rule everywhere else is that user-facing text comes from an i18n key, never from a raw backend
 * message — the API speaks Turkish and the UI may be English. Two codes are exceptions, and they are
 * exceptions for a reason rather than for convenience:
 *
 *   `business`  "Bu ilana zaten başvurdunuz." — the specific rule that refused.
 *   `conflict`  the specific clash.
 *
 * For both, the reason exists only on the server. Replacing it with the generic key would tell the
 * user "that action could not be completed" and leave them with no idea which action or why, which is
 * a worse outcome than a Turkish sentence in an English UI. Localizing them properly would mean
 * duplicating the backend's business rules into the message bundles, where they would rot.
 *
 * **Known limitation, deliberately taken.** Everything else — including every 5xx, whose `detail`
 * carries a .NET stack trace in Development — resolves from the key and never shows backend text.
 */

const PREFER_DETAIL: ReadonlySet<ApiErrorCode> = new Set(['business', 'conflict']);

/** The i18n key for a code. Every `ApiErrorCode` has one; see `messages/*.json` → `errors`. */
export function errorMessageKey(code: ApiErrorCode): `errors.${ApiErrorCode}` {
  return `errors.${code}`;
}

/**
 * @param translate typically `useTranslations()` from a client component, or `getTranslations()`
 * on the server. Passed in rather than imported so this stays a pure function with a unit test.
 */
export function apiErrorMessage(
  error: ApiError,
  translate: (key: `errors.${ApiErrorCode}`) => string,
): string {
  if (PREFER_DETAIL.has(error.code) && error.detail?.trim()) {
    return error.detail;
  }

  return translate(errorMessageKey(error.code));
}

/**
 * Whether this error belongs on the fields rather than in a toast. A validation error with no usable
 * field paths still needs a toast, or it vanishes entirely.
 */
export function hasFieldErrors(error: ApiError): boolean {
  return error.code === 'validation' && Object.keys(error.fieldErrors ?? {}).length > 0;
}
