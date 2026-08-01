import { NextResponse } from 'next/server';

import { apiFetch } from '@/server/api-client';
import { apiErrorResponse, crossOriginRejected, isSameOrigin } from '@/server/handlers';
import { toApiError } from '@/server/problem-details';
import { clearSession, ensureAccessToken } from '@/server/session';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return crossOriginRejected();

  const accessToken = await ensureAccessToken();

  if (!accessToken) {
    await clearSession();
    return new NextResponse(null, { status: 204 });
  }

  const response = await apiFetch({ method: 'POST', path: 'auth/logout-all', accessToken });

  if (!response.ok) return apiErrorResponse(await toApiError(response, true));

  await clearSession();

  return new NextResponse(null, { status: 204, headers: { 'cache-control': 'no-store' } });
}
