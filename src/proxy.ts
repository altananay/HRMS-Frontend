import { NextResponse, type NextRequest } from 'next/server';

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  needsRefresh,
  refreshOnce,
} from '@/server/tokens';

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
    const response = isProtected
      ? redirectToLogin(request, pathname + search)
      : NextResponse.next();

    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);

    return response;
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest, next: string) {
  const url = request.nextUrl.clone();

  url.pathname = '/login';
  url.search = '';
  url.searchParams.set('next', next);

  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api/auth|favicon.ico|images|robots.txt|sitemap.xml).*)',
  ],
};
