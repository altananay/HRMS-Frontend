import type { MetadataRoute } from 'next';

import type { PagedResult } from '@/contracts/envelope';
import type { EmployerSummaryResponse, JobAdvertisementResponse } from '@/contracts/responses';
import { fetchPublic } from '@/server/queries';
import { SITE_URL } from '@/server/site';

/**
 * Every page a crawler should know about: the four public screens, plus one entry per open posting
 * and per listed company.
 *
 * Capped at one page of each. A sitemap is allowed 50,000 URLs, but this is generated on request and
 * an unbounded walk of the API would turn a crawler's polling into a load test. If the board ever
 * outgrows this, split it into a sitemap index — do not raise the page size.
 *
 * `fetchPublic` answers `null` when the API is unreachable, so an outage costs the dynamic entries
 * and still serves a valid sitemap rather than a 500.
 */
const PAGE_SIZE = 200;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [jobs, companies] = await Promise.all([
    fetchPublic<PagedResult<JobAdvertisementResponse>>('JobAdvertisements/getall', {
      pageSize: PAGE_SIZE,
      isActive: true,
    }),
    fetchPublic<PagedResult<EmployerSummaryResponse>>('Employers/public', { pageSize: PAGE_SIZE }),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/jobs`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/companies`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  return [
    ...staticRoutes,
    ...(jobs?.items ?? []).map((job) => ({
      url: `${SITE_URL}/jobs/${job.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...(companies?.items ?? []).map((company) => ({
      url: `${SITE_URL}/companies/${company.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];
}
