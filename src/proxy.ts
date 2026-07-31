import { NextResponse, type NextRequest } from 'next/server';

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  needsRefresh,
  refreshOnce,
} from '@/server/tokens';

/**
 * Runs before every matched request. This was `middleware.ts` until Next 16 renamed the convention;
 * the file, the exported function and the runtime all changed, the behaviour did not. Proxy always
 * runs on **Node.js**, so there is no Edge sandbox and no route segment config here.
 *
 * Two jobs, and it is important to be precise about which is which.
 *
 * **1. A presence check, not an authorization check.** It looks at whether a session cookie exists,
 * nothing more. It does not verify the JWT: that would mean holding the backend's signing key in this
 * app, which is a genuine regression — a second place that can mint or trust credentials. Anyone can
 * send a cookie called `hrms_at` containing rubbish and get past this. That is fine and expected: the
 * point is to send a signed-out visitor to the sign-in screen instead of to a panel that renders
 * empty, not to protect anything. **Role checks live in the segment layouts against a verified
 * `/auth/me`, and the API is the only real authority.**
 *
 * **2. Proactive refresh.** This is the one place that runs *before* a render and can still write a
 * cookie. During a Server Component render `cookies().set()` throws, so a page that discovers its
 * access token expired mid-render has no way to renew it — and it must not refresh without
 * persisting, because the API rotates refresh tokens and treats the old one's reappearance as theft.
 * Refreshing here keeps every subsequent render working with a token that is good for at least
 * another minute.
 *
 * The refreshed token is written to **both** the outgoing response and the forwarded request
 * headers. Only setting it on the response would leave this render still holding the expired one.
 */

/** Prefixes that require a session. Everything else — the public job board, auth screens — is open. */
const PROTECTED = ['/profile', '/company', '/admin'] as const;

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const access = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const isProtected = PROTECTED.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!access && !refresh) {
    return isProtected ? redirectToLogin(request, pathname + search) : NextResponse.next();
  }

  if (!refresh || !needsRefresh(access)) return NextResponse.next();

  const apiBaseUrl = process.env.API_BASE_URL?.replace(/\/+$/, '');

  if (!apiBaseUrl) return NextResponse.next();

  const outcome = await refreshOnce(refresh, apiBaseUrl);

  if (outcome.status === 'refreshed') {
    const { tokens } = outcome;

    // The forwarded request carries the new token, so this render sees it too.
    request.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken);
    request.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken);

    const response = NextResponse.next({ request: { headers: request.headers } });
    const expires = new Date(tokens.refreshTokenExpiresAt);
    const options = {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.SESSION_COOKIE_SECURE !== 'false',
      path: '/',
      ...(Number.isNaN(expires.getTime()) ? {} : { expires }),
    } as const;

    response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, options);
    response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, options);

    return response;
  }

  if (outcome.status === 'rejected') {
    // The refresh token is spent or revoked. Clearing here rather than letting every downstream call
    // 401 is what turns "the app is broken" into "you have been signed out".
    const response = isProtected
      ? redirectToLogin(request, pathname + search)
      : NextResponse.next();

    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);

    return response;
  }

  // `unavailable` — the API could not be reached. Cookies untouched: the session is probably fine and
  // signing someone out because a container was restarting would be inexcusable.
  return NextResponse.next();
}

function redirectToLogin(request: NextRequest, next: string) {
  const url = request.nextUrl.clone();

  url.pathname = '/login';
  url.search = '';
  // Relative and same-origin by construction — `next` comes from this request's own path, so it
  // cannot be turned into an open redirect by a crafted query string.
  url.searchParams.set('next', next);

  return NextResponse.redirect(url);
}

export const config = {
  /**
   * Everything except Next's own assets and the auth handlers.
   *
   * `api/auth` is excluded deliberately: `refresh-session` would otherwise be preceded by a
   * proactive refresh of the very token it is about to spend, and `login` would be pointless work.
   * `api/proxy` **is** included, so a data call benefits from the proactive refresh too.
   */
  matcher: [
    '/((?!_next/static|_next/image|api/auth|favicon.ico|images|robots.txt|sitemap.xml).*)',
  ],
};
