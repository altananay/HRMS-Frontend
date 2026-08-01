import { type ApiError, isApiError } from '@/contracts/api-error';

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
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
};

export function api<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  return request<T>(`/api/proxy/${path}`, options);
}

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

export function __resetRefreshState(): void {
  refreshInFlight = null;
}
