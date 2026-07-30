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

export type ApiErrorCode =
  /** 400 with an `errors` dictionary. `fieldErrors` is populated. */
  | 'validation'
  /** 400 without field errors — a business rule refused the operation. `detail` is the reason. */
  | 'business'
  /** 401 where no session was presented at all. */
  | 'unauthorized'
  /** 401 where a session was presented and rejected. The browser refreshes once, then signs out. */
  | 'session_expired'
  | 'forbidden'
  | 'not_found'
  /** 409. `detail` carries the specific clash and should be surfaced. */
  | 'conflict'
  | 'rate_limited'
  | 'server'
  /** The request never reached the API — DNS, TLS, connection refused, abort. */
  | 'network'
  | 'unknown';

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
