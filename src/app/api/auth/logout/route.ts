import { NextResponse } from 'next/server';

import { apiFetch } from '@/server/api-client';
import { crossOriginRejected, isSameOrigin } from '@/server/handlers';
import { clearSession, readTokens } from '@/server/session';

/**
 * Signs out.
 *
 * The local cookies are cleared **whatever the API says**. A logout that fails because the API is
 * down and leaves the user apparently still signed in is worse than a refresh token that outlives its
 * cookie: the token expires on its own in seven days, and the browser can no longer present it.
 *
 * The upstream call is what revokes it server-side, so it is still made — just not depended on.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return crossOriginRejected();

  const { refresh } = await readTokens();

  if (refresh) {
    try {
      await apiFetch({
        method: 'POST',
        path: 'auth/logout',
        body: JSON.stringify({ refreshToken: refresh }),
        contentType: 'application/json',
      });
    } catch {
      // Deliberately swallowed — see above.
    }
  }

  await clearSession();

  return new NextResponse(null, { status: 204, headers: { 'cache-control': 'no-store' } });
}
