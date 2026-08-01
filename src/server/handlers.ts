import 'server-only';

import { NextResponse } from 'next/server';

import type { ApiError } from '@/contracts/api-error';
import type { AuthenticatedUserResponse } from '@/contracts/responses';

import { apiFetch, readData } from './api-client';
import { networkError, toApiError } from './problem-details';
import { writeSession } from './session';
import type { SessionTokens } from './tokens';

export type AuthResponse = SessionTokens & {
  user: AuthenticatedUserResponse;
};

export function apiErrorResponse(error: ApiError): NextResponse {
  const status = error.status === 0 ? 502 : error.status;

  return NextResponse.json(error, { status, headers: { 'cache-control': 'no-store' } });
}

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;

  try {
    return new URL(origin).host === request.headers.get('host');
  } catch {
    return false;
  }
}

export function crossOriginRejected(): NextResponse {
  return apiErrorResponse({
    status: 403,
    code: 'forbidden',
    title: 'Cross-origin request rejected.',
  });
}

export async function forwardJson(
  path: string,
  request: Request,
  accessToken?: string,
): Promise<Response | ApiError> {
  try {
    return await apiFetch({
      method: 'POST',
      path,
      body: await request.text(),
      contentType: 'application/json',
      accessToken,
    });
  } catch (cause) {
    return networkError(cause);
  }
}

export async function authenticate(path: string, request: Request): Promise<NextResponse> {
  if (!isSameOrigin(request)) return crossOriginRejected();

  const result = await forwardJson(path, request);

  if (!(result instanceof Response)) return apiErrorResponse(result);

  if (!result.ok) {
    const error = await toApiError(result);

    return apiErrorResponse(
      error.status === 401 ? { ...error, code: 'invalid_credentials' } : error,
    );
  }

  const auth = await readData<AuthResponse>(result);

  if (!auth?.accessToken || !auth.refreshToken || !auth.user) {
    return apiErrorResponse({
      status: 502,
      code: 'server',
      title: 'The API returned an unexpected authentication payload.',
    });
  }

  await writeSession(auth);

  return NextResponse.json({ user: auth.user }, { headers: { 'cache-control': 'no-store' } });
}

export async function forwardAndNormalize(
  path: string,
  request: Request,
  accessToken?: string,
): Promise<NextResponse> {
  const result = await forwardJson(path, request, accessToken);

  if (!(result instanceof Response)) return apiErrorResponse(result);
  if (!result.ok) return apiErrorResponse(await toApiError(result, Boolean(accessToken)));

  const body: unknown = await result.json().catch(() => null);

  return NextResponse.json(body ?? {}, {
    status: result.status,
    headers: { 'cache-control': 'no-store' },
  });
}
