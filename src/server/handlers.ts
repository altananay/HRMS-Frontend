import 'server-only';

import { NextResponse } from 'next/server';

import type { ApiError } from '@/contracts/api-error';
import type { AuthenticatedUserResponse } from '@/contracts/responses';

import { apiFetch, readData } from './api-client';
import { networkError, toApiError } from './problem-details';
import { writeSession } from './session';
import type { SessionTokens } from './tokens';

/**
 * Shared plumbing for the BFF route handlers.
 *
 * Every handler answers with either a domain payload or an `ApiError` — never with an upstream
 * ProblemDetails body, never with a bare status. The browser therefore has exactly one error shape to
 * understand, and `src/lib/http.ts` is the only thing that has to know it.
 */

/** What the API returns from login, register and refresh. **Never leaves this process intact.** */
export type AuthResponse = SessionTokens & {
  user: AuthenticatedUserResponse;
};

export function apiErrorResponse(error: ApiError): NextResponse {
  // 0 means the request never completed; there is no meaningful HTTP status to echo, and returning 0
  // would throw. 502 is the honest answer: this gateway could not reach its upstream.
  const status = error.status === 0 ? 502 : error.status;

  return NextResponse.json(error, { status, headers: { 'cache-control': 'no-store' } });
}

/**
 * Rejects a cross-origin mutation.
 *
 * `sameSite=lax` already stops the session cookie from riding along on a cross-site POST, so this is
 * the second layer rather than the only one. It matters because `lax` still permits top-level
 * GET navigations, and because a browser that mis-implements `lax` (or a user on an old one) would
 * otherwise leave an authenticated proxy wide open.
 *
 * A missing `Origin` is rejected, not waved through: browsers send it on every non-GET request, so an
 * absent one means the caller is not the browser this session belongs to.
 */
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

/**
 * Posts a JSON body upstream, passing the raw text straight through.
 *
 * The body is not parsed and re-serialised on the way: re-encoding is a chance to silently drop or
 * coerce a field, and the API's validators are the ones that decide whether it is well-formed.
 */
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

/**
 * The login / register flow: post upstream, and on success move the tokens into httpOnly cookies and
 * hand the browser only the user.
 *
 * The tokens stop here. That is the single property this whole layer exists to provide, so it is
 * enforced in one function that all three entry points call rather than repeated three times.
 */
export async function authenticate(path: string, request: Request): Promise<NextResponse> {
  if (!isSameOrigin(request)) return crossOriginRejected();

  const result = await forwardJson(path, request);

  if (!(result instanceof Response)) return apiErrorResponse(result);
  if (!result.ok) return apiErrorResponse(await toApiError(result));

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

/** For handlers whose only job is to forward and normalize, with no cookie side effects. */
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
