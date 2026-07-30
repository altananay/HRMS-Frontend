import 'server-only';

import type { ApiError, ApiErrorCode } from '@/contracts/api-error';

import { toFieldErrors } from './field-errors';

/**
 * Turns anything the API can answer with into one `ApiError`. The only place in the codebase that
 * knows RFC 9457 exists.
 *
 * Every parse here is defensive, because three of the responses we must handle are **not**
 * ProblemDetails at all:
 *
 *   401 / 403 from the JWT and authorization middleware — these short-circuit before MVC runs, so
 *     `GlobalExceptionHandler` never sees them and the body is empty.
 *   429 from the rate limiter — `RejectionStatusCode` is written directly; `UseStatusCodePages()`
 *     then fills in a plain-text body like `Status Code: 429; Too Many Requests`.
 *   Anything from a reverse proxy or a crash before the handler is wired.
 *
 * A `response.json()` that assumes a JSON body would throw inside the error path itself, turning a
 * clean 403 into an unhandled 500.
 */

type ProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string[]>;
};

/**
 * @param hadSession whether the request carried an access token. Splits 401 into "you are not signed
 * in" and "your session stopped working" — the second is what the browser retries once after a
 * refresh, and retrying the first would be a pointless round trip on every anonymous 401.
 */
export async function toApiError(response: Response, hadSession = false): Promise<ApiError> {
  const problem = await readProblemDetails(response);
  const code = toCode(response.status, problem, hadSession);

  const error: ApiError = {
    status: response.status,
    code,
    title: problem?.title ?? response.statusText ?? 'Error',
  };

  if (problem?.detail) error.detail = problem.detail;

  if (code === 'validation' && problem?.errors) {
    error.fieldErrors = toFieldErrors(problem.errors);
  }

  return error;
}

/** For a request that never completed — DNS, TLS, connection refused, abort. */
export function networkError(cause: unknown): ApiError {
  return {
    status: 0,
    code: 'network',
    title: cause instanceof Error ? cause.message : 'Network request failed',
  };
}

async function readProblemDetails(response: Response): Promise<ProblemDetails | null> {
  const contentType = response.headers.get('content-type') ?? '';

  // `application/problem+json` is the documented one; plain `application/json` covers a handler that
  // did not set the profile.
  if (!contentType.includes('json')) return null;

  try {
    const body: unknown = await response.json();
    return typeof body === 'object' && body !== null ? (body as ProblemDetails) : null;
  } catch {
    // A truncated or empty body with a JSON content type. Nothing to recover; the status still tells
    // us what happened.
    return null;
  }
}

function toCode(status: number, problem: ProblemDetails | null, hadSession: boolean): ApiErrorCode {
  switch (status) {
    case 400:
      // The presence of `errors` is the only thing separating a field-level failure from a business
      // rule — both are 400, and the backend's own titles ("Doğrulama hatası." vs "İş kuralı
      // ihlali.") are display text, not something to branch on.
      return problem?.errors && Object.keys(problem.errors).length > 0 ? 'validation' : 'business';
    case 401:
      return hadSession ? 'session_expired' : 'unauthorized';
    case 403:
      return 'forbidden';
    case 404:
      return 'not_found';
    case 409:
      return 'conflict';
    case 429:
      return 'rate_limited';
    default:
      if (status >= 500) return 'server';
      return 'unknown';
  }
}
