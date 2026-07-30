import { NextResponse } from 'next/server';

import { apiErrorResponse, crossOriginRejected, isSameOrigin } from '@/server/handlers';
import { API_BASE_URL } from '@/server/env';
import { clearSession, readTokens, writeSession } from '@/server/session';
import { refreshOnce } from '@/server/tokens';

/**
 * The **only** refresh the browser can reach. `auth/refresh` upstream is never proxied.
 *
 * Layer three of the single-flight design. `src/lib/http.ts` calls this at most once per browser after
 * a `session_expired`, everybody waits on that one call, and each caller then retries once. The
 * process-wide `refreshOnce` behind it collapses whatever still slips through.
 *
 * Why all three layers: `AuthManager.RefreshAsync` treats a replayed refresh token as theft and
 * revokes the entire chain plus the security stamp. So two parallel refreshes do not cost a wasted
 * request — they sign the user out of every device, and it arrives as an ordinary 401 with nothing to
 * explain it.
 *
 * The three outcomes are distinct on purpose:
 *
 *   204  refreshed — retry the original request
 *   401  the refresh token is spent or revoked; the session is over, cookies cleared
 *   502  the API could not be reached; **cookies untouched**, because the session is probably fine
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return crossOriginRejected();

  const { refresh } = await readTokens();

  if (!refresh) {
    await clearSession();
    return apiErrorResponse({ status: 401, code: 'session_expired', title: 'No refresh token.' });
  }

  const outcome = await refreshOnce(refresh, API_BASE_URL);

  if (outcome.status === 'refreshed') {
    await writeSession(outcome.tokens);
    return new NextResponse(null, { status: 204, headers: { 'cache-control': 'no-store' } });
  }

  if (outcome.status === 'rejected') {
    await clearSession();
    return apiErrorResponse({
      status: 401,
      code: 'session_expired',
      title: 'The refresh token was rejected.',
    });
  }

  return apiErrorResponse({
    status: 0,
    code: 'network',
    title: 'The API could not be reached.',
  });
}
