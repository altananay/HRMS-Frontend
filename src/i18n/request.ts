import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

import { defaultLocale, isAppLocale, timeZone } from './config';
import { formats } from './formats';
import { LOCALE_COOKIE } from './config';

/**
 * Resolves the request's locale and messages. Called by next-intl on every server render.
 *
 * An unrecognised cookie value falls back to the default rather than throwing — the cookie is user
 * input and a hand-edited `NEXT_LOCALE=de` must not 500 the site.
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const requested = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isAppLocale(requested) ? requested : defaultLocale;

  return {
    locale,
    timeZone,
    formats,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
