import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

import { defaultLocale, isAppLocale, timeZone } from './config';
import { formats } from './formats';
import { LOCALE_COOKIE } from './config';

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
