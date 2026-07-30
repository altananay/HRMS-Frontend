import { type ApiError, isApiError } from '@/contracts/api-error';

/**
 * The browser's only way to reach the server. Every request goes to this app's own origin — the .NET
 * API is not reachable from here and its address is not in this bundle.
 *
 * Two jobs: turn any failure into a thrown `ApiRequestError`, and own **layer three of the
 * single-flight refresh**.
 */

/**
 * Thrown for every non-2xx response and every network failure.
 *
 * A real `Error` subclass rather than a bare object, so it keeps a stack and satisfies
 * `instanceof Error` — and it carries the `ApiError` fields directly, so `isApiError(caught)` is true
 * and call sites read `error.fieldErrors` without unwrapping anything.
 */
export class ApiRequestError extends Error implements ApiError {
  readonly status: number;
  readonly code: ApiError['code'];
  readonly title: string;
  readonly detail?: string;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(error: ApiError) {
    super(error.title);
    this.name = 'ApiRequestError';
    this.status = error.status;
    this.code = error.code;
    this.title = error.title;
    if (error.detail !== undefined) this.detail = error.detail;
    if (error.fieldErrors !== undefined) this.fieldErrors = error.fieldErrors;
  }
}

/**
 * The one in-flight refresh for this tab.
 *
 * Ten components rendering at once and all getting `session_expired` must produce **one** call to
 * `/api/auth/refresh-session`, not ten. The API revokes the entire token chain and bumps the security
 * stamp when a rotated refresh token is presented twice, so a burst of parallel refreshes signs the
 * user out of every device — and it arrives looking like an ordinary 401.
 *
 * A module-level variable is enough because a tab is single-threaded. Two *tabs* can still race; that
 * is what the process-wide `refreshOnce` on the server is for.
 */
let refreshInFlight: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshInFlight ??= fetch('/api/auth/refresh-session', {
    method: 'POST',
    credentials: 'same-origin',
  })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

export type RequestOptions = Omit<RequestInit, 'body'> & {
  /** Serialized as JSON unless it is already a `FormData` or a string. */
  body?: unknown;
  /** Query parameters. `undefined` and `''` entries are dropped rather than sent empty. */
  query?: Record<string, string | number | boolean | undefined | null>;
};

/** Calls an allow-listed API endpoint through the proxy. `path` is the upstream path, no leading slash. */
export function api<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  return request<T>(`/api/proxy/${path}`, options);
}

/** Calls one of this app's own auth handlers — `login`, `logout`, `session`, … */
export function auth<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  return request<T>(`/api/auth/${path}`, options);
}

async function request<T>(url: string, options: RequestOptions, allowRetry = true): Promise<T> {
  const { body, query, headers, ...rest } = options;
  const init: RequestInit = {
    ...rest,
    credentials: 'same-origin',
    headers: new Headers(headers),
  };

  if (body !== undefined && body !== null) {
    if (body instanceof FormData || typeof body === 'string') {
      // `content-type` is deliberately left unset for FormData — the browser has to add the
      // multipart boundary, and setting it by hand produces a body the server cannot parse.
      init.body = body;
    } else {
      init.body = JSON.stringify(body);
      (init.headers as Headers).set('content-type', 'application/json');
    }
  }

  let response: Response;

  try {
    response = await fetch(withQuery(url, query), init);
  } catch (cause) {
    throw new ApiRequestError({
      status: 0,
      code: 'network',
      title: cause instanceof Error ? cause.message : 'Network request failed',
    });
  }

  if (response.ok) return parse<T>(response);

  const error = await readError(response);

  // Exactly one retry, and only for a session that *was* valid. `unauthorized` means no session was
  // presented at all — refreshing that would be a guaranteed-useless round trip on every anonymous
  // 401. `allowRetry` guarantees the recursion is one level deep whatever the second attempt returns.
  if (allowRetry && error.code === 'session_expired' && (await refreshSession())) {
    return request<T>(url, options, false);
  }

  throw new ApiRequestError(error);
}

async function parse<T>(response: Response): Promise<T> {
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('json')) return (await response.blob()) as T;

  return (await response.json()) as T;
}

async function readError(response: Response): Promise<ApiError> {
  try {
    const body: unknown = await response.json();
    if (isApiError(body)) return body;
  } catch {
    // Falls through — a BFF handler always answers with an ApiError, so reaching here means something
    // upstream of the handlers (Next itself) produced the response.
  }

  return {
    status: response.status,
    code: response.status >= 500 ? 'server' : 'unknown',
    title: response.statusText || 'Request failed',
  };
}

function withQuery(url: string, query: RequestOptions['query']): string {
  if (!query) return url;

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }

  const search = params.toString();

  return search ? `${url}?${search}` : url;
}

/** Test seam. Nothing in the application calls this. */
export function __resetRefreshState(): void {
  refreshInFlight = null;
}
