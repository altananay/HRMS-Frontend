import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/server/site';

/**
 * Replaces the static `public/robots.txt` the CRA app shipped, which allowed everything.
 *
 * The panels are behind a session, so a crawler could never read them — but it can still queue and
 * request them, and every one of those requests costs a redirect to `/login`. Disallowing them keeps
 * the crawl on the pages that are actually public.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/company', '/profile', '/api/', '/login', '/register', '/reset-password'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
