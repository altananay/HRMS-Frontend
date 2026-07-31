import { NextResponse } from 'next/server';

import { ensureAccessToken, getSession } from '@/server/session';

/**
 * Who is signed in, according to the API.
 *
 * The client has no other way to ask: the session lives in httpOnly cookies it cannot read, and the
 * user object it was handed at login goes stale the moment anything changes server-side. `getSession`
 * verifies against `/auth/me` rather than decoding the token, so a revoked session reports `null` here
 * even while the cookie is still technically present.
 *
 * `ensureAccessToken()` first, because this route is excluded from the proxy matcher — the
 * proactive refresh that covers every page render does not run here. Without it, a browser holding a
 * usable refresh token but no access token would be told it is signed out, and the only cure would be
 * signing in again.
 */
export async function GET() {
  await ensureAccessToken();

  const user = await getSession();

  return NextResponse.json({ user }, { headers: { 'cache-control': 'no-store' } });
}
