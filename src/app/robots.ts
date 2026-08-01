import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/server/site';

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
