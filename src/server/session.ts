import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';

import type { AuthenticatedUserResponse } from '@/contracts/responses';

import { apiFetch, readData } from './api-client';
import { API_BASE_URL, SESSION_COOKIE_SECURE } from './env';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  needsRefresh,
  refreshOnce,
  type SessionTokens,
} from './tokens';

/**
 * The session, as Route Handlers and Server Components see it.
 *
 * **Only a Route Handler or a Server Action may write cookies.** During a Server Component render
 * `cookies().set()` throws — Next has already begun streaming the response by then. That single
 * constraint shapes the whole design: `getSession()` reads and never refreshes, `ensureAccessToken()`
 * refreshes and is only ever called from a handler, and the *proactive* refresh lives in
 * `middleware.ts`, which is the one place that runs before a render and can still set a cookie.
 */

const BASE_COOKIE = {
  httpOnly: true,
  sameSite: 'lax',
  secure: SESSION_COOKIE_SECURE,
  path: '/',
} as const;

export async function writeSession(tokens: SessionTokens): Promise<void> {
  const store = await cookies();
  // Both cookies share the refresh token's lifetime so they expire together. An access-token cookie
  // that outlived its refresh token would leave the browser holding a credential it can never renew.
  const expires = parseExpiry(tokens.refreshTokenExpiresAt);

  store.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, { ...BASE_COOKIE, ...expires });
  store.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, { ...BASE_COOKIE, ...expires });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();

  // `delete` rather than an empty value: an empty string still satisfies "cookie present", which is
  // exactly what the middleware guard checks.
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
}

export async function readTokens(): Promise<{ access?: string; refresh?: string }> {
  const store = await cookies();

  return {
    access: store.get(ACCESS_TOKEN_COOKIE)?.value,
    refresh: store.get(REFRESH_TOKEN_COOKIE)?.value,
  };
}

/**
 * The access token to send upstream, refreshing and persisting first if it is due.
 *
 * **Route Handlers only.** Calling this from a Server Component throws on the cookie write.
 */
export async function ensureAccessToken(): Promise<string | undefined> {
  const { access, refresh } = await readTokens();

  if (!needsRefresh(access)) return access;
  if (!refresh) return undefined;

  const outcome = await refreshOnce(refresh, API_BASE_URL);

  if (outcome.status === 'refreshed') {
    await writeSession(outcome.tokens);
    return outcome.tokens.accessToken;
  }

  if (outcome.status === 'rejected') {
    await clearSession();
    return undefined;
  }

  // `unavailable` — the API could not be reached. Keep the cookies and send the token we have; the
  // upstream call is about to fail anyway, and it will fail with a truthful error rather than
  // looking like a sign-out.
  return access;
}

/**
 * The signed-in user, verified by the API — not decoded from the token.
 *
 * Reading roles out of the JWT locally would be faster and wrong: the backend re-checks the security
 * stamp on every request, so a token can be structurally valid and belong to a session that was
 * revoked seconds ago by a password change. `/auth/me` is the authority.
 *
 * `cache()` scopes the call to one request, so the root layout and a page segment asking for the
 * session cost one upstream call between them.
 */
export const getSession = cache(async (): Promise<AuthenticatedUserResponse | null> => {
  const store = await cookies();
  const accessToken = store.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) return null;

  try {
    const response = await apiFetch({ path: 'auth/me', accessToken });

    if (!response.ok) return null;

    return await readData<AuthenticatedUserResponse>(response);
  } catch {
    // The API is unreachable. Rendering as signed-out is the only option left, but nothing is
    // cleared: the cookies stay so the session survives the outage.
    return null;
  }
});

/** `true` when the user holds every one of the given roles. Roles are lower-case on the wire. */
export function hasRole(user: AuthenticatedUserResponse | null, ...roles: string[]): boolean {
  if (!user) return false;
  return roles.some((role) => user.roles.includes(role));
}

function parseExpiry(value: string): { expires?: Date } {
  const parsed = new Date(value);

  // A malformed timestamp makes it a session cookie rather than a cookie that expires in 1970 —
  // `new Date('nonsense')` is `Invalid Date`, and handing that to `set()` would drop the cookie
  // immediately and log the user out on the next request.
  return Number.isNaN(parsed.getTime()) ? {} : { expires: parsed };
}
