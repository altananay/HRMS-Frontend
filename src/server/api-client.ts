import 'server-only';

import { API_BASE_URL } from './env';

/**
 * The only place a request leaves for the .NET API. Everything the BFF does goes through here.
 *
 * Returns the raw `Response` rather than parsed JSON: the proxy forwards bodies straight through
 * (including a 30 MB CV upload and a PDF download), and buffering them into memory just to hand them
 * back would defeat the point.
 */

export type ApiRequest = {
  method?: string;
  /** Path *without* the leading slash — `Cvs/getall`, `auth/login`. */
  path: string;
  search?: string;
  accessToken?: string | undefined;
  body?: BodyInit | null;
  contentType?: string | null;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export async function apiFetch({
  method = 'GET',
  path,
  search = '',
  accessToken,
  body,
  contentType,
  headers = {},
  signal,
}: ApiRequest): Promise<Response> {
  const requestHeaders = new Headers(headers);

  if (accessToken) requestHeaders.set('authorization', `Bearer ${accessToken}`);

  // Forwarded verbatim when present. A multipart upload's boundary lives in this header, so
  // reconstructing it — or letting fetch guess — corrupts the body.
  if (contentType) requestHeaders.set('content-type', contentType);

  return fetch(`${API_BASE_URL}/api/${path}${search}`, {
    method,
    headers: requestHeaders,
    body,
    signal,
    // Nothing from the API is cacheable by Next: it is all per-user and behind a bearer token.
    cache: 'no-store',
    // Required by undici whenever `body` is a stream rather than a buffer, which is how uploads
    // arrive. Harmless for every other request.
    ...(body instanceof ReadableStream ? { duplex: 'half' } : {}),
  } as RequestInit);
}

/** Reads `{ data }` out of the API's success envelope. Returns `null` on any surprise. */
export async function readData<T>(response: Response): Promise<T | null> {
  try {
    const body: unknown = await response.json();
    return ((body as { data?: T }).data ?? null) as T | null;
  } catch {
    return null;
  }
}
