import { NextResponse } from 'next/server';

import { apiErrorResponse, crossOriginRejected, forwardJson, isSameOrigin } from '@/server/handlers';
import { toApiError } from '@/server/problem-details';
import { clearSession, ensureAccessToken } from '@/server/session';

/**
 * Changes the password, then signs this browser out.
 *
 * `AuthManager.ChangePasswordAsync` calls `RevokeEverythingAsync`: it rotates the user's security
 * stamp and revokes every refresh token. The API validates that stamp on **every** request, so the
 * access token in our cookie is dead the instant this succeeds and the refresh token cannot renew it.
 *
 * Clearing the cookies is therefore not a policy choice — it is telling the truth about what just
 * happened. Leaving them would give the user a session that 401s on the next click for no visible
 * reason. The response says `signedOut` so the client can route to the sign-in screen deliberately
 * rather than discovering it by failing.
 */
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
