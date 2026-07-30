import { NextResponse } from 'next/server';

import { apiFetch } from '@/server/api-client';
import { isAllowed, type AllowedMethod } from '@/server/allowlist';
import { apiErrorResponse, crossOriginRejected, isSameOrigin } from '@/server/handlers';
import { networkError, toApiError } from '@/server/problem-details';
import { ensureAccessToken } from '@/server/session';

/**
 * The single authenticated passage from the browser to the .NET API.
 *
 * Shape of one request:
 *
 *   1. allow-list — anything not in `src/server/allowlist.ts` is 404, before a socket is opened
 *   2. same-origin — mutations only, on top of `sameSite=lax`
 *   3. token — read from the httpOnly cookie, refreshed and re-persisted if it is due
 *   4. forward — body and `content-type` passed through untouched, response streamed back
 *   5. normalize — any failure becomes one `ApiError`; a 401 becomes `session_expired`
 *
 * **This handler never refreshes on a 401.** That is layer three's job, in the browser, behind a
 * single promise. Refreshing here would mean ten parallel proxy calls firing ten refreshes with the
 * same token, and the API treats a replayed refresh token as theft: it revokes the whole chain and
 * bumps the security stamp, signing the user out everywhere. The 401 is reported honestly instead.
 */

type Context = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, context: Context) {
  return proxy(request, context, 'GET');
}

export async function POST(request: Request, context: Context) {
  return proxy(request, context, 'POST');
}

export async function PUT(request: Request, context: Context) {
  return proxy(request, context, 'PUT');
}

export async function DELETE(request: Request, context: Context) {
  return proxy(request, context, 'DELETE');
}

async function proxy(request: Request, context: Context, method: AllowedMethod) {
  const { path } = await context.params;

  if (!isAllowed(method, path)) {
    // 404, not 403: a rejected path should be indistinguishable from one that does not exist, so the
    // allow-list cannot be probed to map the API surface.
    return apiErrorResponse({ status: 404, code: 'not_found', title: 'Unknown endpoint.' });
  }

  if (method !== 'GET' && !isSameOrigin(request)) return crossOriginRejected();

  const accessToken = await ensureAccessToken();
  const { search } = new URL(request.url);

  let upstream: Response;

  try {
    upstream = await apiFetch({
      method,
      path: path.join('/'),
      search,
      accessToken,
      // The raw stream, not a re-built `FormData`. A multipart upload carries its boundary in
      // `content-type`, and re-encoding the body would invalidate it; streaming also keeps a 30 MB CV
      // out of this process's memory.
      body: method === 'GET' ? null : request.body,
      contentType: request.headers.get('content-type'),
      signal: request.signal,
    });
  } catch (cause) {
    return apiErrorResponse(networkError(cause));
  }

  if (!upstream.ok) {
    return apiErrorResponse(await toApiError(upstream, Boolean(accessToken)));
  }

  return forward(upstream);
}

/**
 * Streams the upstream response back, carrying only the headers the browser needs.
 *
 * Copying every upstream header would leak server identity headers and, worse, could pass through a
 * caching directive. Everything here is per-user data behind a bearer token — CV files in particular
 * are personal data — so `no-store` is set unconditionally rather than trusted from upstream.
 */
function forward(upstream: Response): NextResponse {
  const headers = new Headers({ 'cache-control': 'private, no-store' });

  for (const name of ['content-type', 'content-disposition', 'content-length'] as const) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new NextResponse(upstream.body, { status: upstream.status, headers });
}
