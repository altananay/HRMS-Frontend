'use server';

import { cookies } from 'next/headers';

import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, isAppLocale } from './config';

export async function setLocaleCookie(locale: string): Promise<void> {
  if (!isAppLocale(locale)) return;

  const cookieStore = await cookies();

  cookieStore.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: 'lax',
    httpOnly: false,
  });
}
