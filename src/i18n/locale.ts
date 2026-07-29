'use server';

import { cookies } from 'next/headers';

import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, isAppLocale } from './config';

/**
 * Writes the locale cookie. A **Server Action**, and the only one in the codebase.
 *
 * The rule elsewhere is that the browser talks to the server over `fetch` to a BFF Route Handler —
 * that rule exists so there is exactly one path to the .NET API and E2E covers it. This touches no
 * API: it sets a cookie and lets the router re-render with the other message bundle. A Route Handler
 * would need an extra `router.refresh()` and an allow-list entry for something that is not a proxy.
 */
export async function setLocaleCookie(locale: string): Promise<void> {
  if (!isAppLocale(locale)) return;

  const cookieStore = await cookies();

  cookieStore.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: 'lax',
    // Deliberately readable: a language preference is not a secret, and no security decision is
    // taken from it. The session cookies are the httpOnly ones.
    httpOnly: false,
  });
}
