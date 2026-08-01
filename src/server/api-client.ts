import 'server-only';

import { API_BASE_URL } from './env';

export type ApiRequest = {
  method?: string;
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

  if (contentType) requestHeaders.set('content-type', contentType);

  return fetch(`${API_BASE_URL}/api/${path}${search}`, {
    method,
    headers: requestHeaders,
    body,
    signal,
    cache: 'no-store',
    ...(body instanceof ReadableStream ? { duplex: 'half' } : {}),
  } as RequestInit);
}

export async function readData<T>(response: Response): Promise<T | null> {
  try {
    const body: unknown = await response.json();
    return ((body as { data?: T }).data ?? null) as T | null;
  } catch {
    return null;
  }
}
