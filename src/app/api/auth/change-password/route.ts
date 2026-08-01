import { NextResponse } from 'next/server';

import { apiErrorResponse, crossOriginRejected, forwardJson, isSameOrigin } from '@/server/handlers';
import { toApiError } from '@/server/problem-details';
import { clearSession, ensureAccessToken } from '@/server/session';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return crossOriginRejected();

  const accessToken = await ensureAccessToken();

  if (!accessToken) {
    return apiErrorResponse({ status: 401, code: 'unauthorized', title: 'Not signed in.' });
  }

  const result = await forwardJson('auth/change-password', request, accessToken);

  if (!(result instanceof Response)) return apiErrorResponse(result);
  if (!result.ok) return apiErrorResponse(await toApiError(result, true));

  await clearSession();

  return NextResponse.json({ signedOut: true }, { headers: { 'cache-control': 'no-store' } });
}
