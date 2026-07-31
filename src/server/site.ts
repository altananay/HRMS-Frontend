/**
 * The app's own public address.
 *
 * Needed by `sitemap.ts`, `robots.ts` and `metadataBase`, all of which must emit **absolute** URLs —
 * a relative one in a sitemap is silently ignored by crawlers, and Next warns on every build without
 * a `metadataBase`.
 *
 * Unlike `env.ts` this has a default and never throws: the deployment target is localhost, and a
 * missing variable should not take down the whole site over a canonical URL.
 */
export const SITE_URL = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
