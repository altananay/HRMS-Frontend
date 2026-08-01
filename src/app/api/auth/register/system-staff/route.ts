import { NextResponse } from 'next/server';

import { readData } from '@/server/api-client';
import {
  apiErrorResponse,
  crossOriginRejected,
  forwardJson,
  isSameOrigin,
  type AuthResponse,
} from '@/server/handlers';
import { toApiError } from '@/server/problem-details';
import { ensureAccessToken } from '@/server/session';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return crossOriginRejected();

  const accessToken = await ensureAccessToken();

  if (!accessToken) {
    return apiErrorResponse({ status: 401, code: 'unauthorized', title: 'Not signed in.' });
  }

  const result = await forwardJson('auth/register/system-staff', request, accessToken);

  if (!(result instanceof Response)) return apiErrorResponse(result);
  if (!result.ok) return apiErrorResponse(await toApiError(result, true));

  const auth = await readData<AuthResponse>(result);

  return NextResponse.json(
    { user: auth?.user ?? null },
    { status: 201, headers: { 'cache-control': 'no-store' } },
  );
}
