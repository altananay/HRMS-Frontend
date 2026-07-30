/**
 * The single error shape the browser ever sees.
 *
 * Not a backend contract — it is *our* normalization of everything the API can answer with, produced
 * in `src/server/problem-details.ts` and returned verbatim by every BFF handler. The browser never
 * parses RFC 9457 `ProblemDetails`, never sees a Turkish `title`, and never has to guess whether a
 * 400 carried field errors.
 *
 * It lives in `contracts/` rather than `lib/` so `src/server/**` can import the type without pulling
 * in a client module.
 */

/**
 * Every code, as a runtime array — the type is derived from it, not the other way round.
 *
 * That direction matters: `api-error.test.ts` walks this array and asserts each entry has a message
 * in both bundles, so adding a code without translating it fails a test instead of rendering the key
 * path on screen. A hand-maintained list in the test would have to be remembered, and would not be.
 */
export const API_ERROR_CODES = [
  /** 400 with an `errors` dictionary. `fieldErrors` is populated. */
  'validation',
  /** 400 without field errors — a business rule refused the operation. `detail` is the reason. */
  'business',
  /** 401 where no session was presented at all. */
  'unauthorized',
  /**
   * A 401 from `login` or `register` specifically. Separate from `unauthorized` because that message
   * reads as "you need to sign in to sign in" on a sign-in form — a real thing the generic mapping
   * produced.
   *
   * One message for both a wrong password and an unknown address, matching the backend's own uniform
   * 401. Distinguishing them would turn the sign-in form into a way to test who has an account.
   */
  'invalid_credentials',
  /** 401 where a session was presented and rejected. The browser refreshes once, then signs out. */
  'session_expired',
  'forbidden',
  'not_found',
  /** 409. `detail` carries the specific clash and should be surfaced. */
  'conflict',
  'rate_limited',
  'server',
  /** The request never reached the API — DNS, TLS, connection refused, abort. */
  'network',
  'unknown',
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export type ApiError = {
  /** HTTP status, or 0 when the request never completed. */
  status: number;
  code: ApiErrorCode;
  /** The API's `title`, kept for logs. **Not** for display — it is Turkish prose. */
  title: string;
  /**
   * The API's `detail`. Only shown to the user for `business` and `conflict`, where it is the only
   * place the specific reason exists. Never shown for `server`: in Development it carries a .NET
   * stack trace.
   */
  detail?: string;
  /** Keyed by React Hook Form field path (`educations.0.school`), already translated. */
  fieldErrors?: Record<string, string[]>;
};

/** Narrowing helper — `catch` gives `unknown`, and every call site needs this. */
export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'status' in value &&
    typeof (value as ApiError).status === 'number'
  );
}
