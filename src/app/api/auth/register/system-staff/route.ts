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

/**
 * An **admin** creating a system staff account. Deliberately not `authenticate()`, and not on the
 * generic proxy allow-list.
 *
 * The API answers this the same way it answers a self-registration: with a token pair for the newly
 * created user. Running it through `authenticate()` would write those tokens into the *admin's*
 * cookies and silently swap their session for the new account's. Passing it through the generic proxy
 * would be no better — it would hand the tokens to the browser. So the response is opened here, the
 * tokens are dropped, and only the user comes back.
 */
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
