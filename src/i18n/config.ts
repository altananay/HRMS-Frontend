/**
 * i18n configuration. No URL prefix: the locale lives in a cookie, so `/jobs/abc` is one URL in both
 * languages. A `[locale]` segment would restructure every route and add a redirect to every entry
 * point, for a two-language local application whose URLs are never shared across locales.
 */

export const locales = ['tr', 'en'] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = 'tr';

/**
 * `NEXT_LOCALE` is the name Next.js itself uses for locale detection. Keeping it means the framework
 * and next-intl read the same value instead of drifting apart.
 */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** All dates and times are rendered in this zone; the API's timestamps are UTC. */
export const timeZone = 'Europe/Istanbul';

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}
