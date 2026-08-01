import { NextResponse } from 'next/server';

import { apiFetch } from '@/server/api-client';
import { isAllowed, type AllowedMethod } from '@/server/allowlist';
import { apiErrorResponse, crossOriginRejected, isSameOrigin } from '@/server/handlers';
import { networkError, toApiError } from '@/server/problem-details';
import { ensureAccessToken } from '@/server/session';

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

function forward(upstream: Response): NextResponse {
  const headers = new Headers({ 'cache-control': 'private, no-store' });

  for (const name of ['content-type', 'content-disposition', 'content-length'] as const) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new NextResponse(upstream.body, { status: upstream.status, headers });
}
