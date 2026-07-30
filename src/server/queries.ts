import 'server-only';

import { apiFetch, readData } from './api-client';
import type { PagedResult } from '@/contracts/envelope';

/**
 * Reads the public site's Server Components make.
 *
 * These call the API **directly**, not through `/api/proxy`. The proxy exists so the *browser* can
 * reach the API with a cookie it cannot read; a server component is already on the server, and
 * routing it back through our own HTTP layer would add a hop, require an absolute URL and mean
 * forwarding cookies to ourselves.
 *
 * Everything here is anonymous — the public job board and company directory are `[AllowAnonymous]`
 * upstream — so no token is attached and nothing is user-specific.
 */

type Query = Record<string, string | number | boolean | undefined>;

/**
 * @returns `null` when the API answered with anything other than success. Callers decide whether that
 * means `notFound()` or an empty section; throwing here would take out a whole page because one
 * optional panel could not load.
 */
export async function fetchPublic<T>(path: string, query: Query = {}): Promise<T | null> {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === '') continue;
    search.set(key, String(value));
  }

  const qs = search.toString();

  try {
    const response = await apiFetch({ path, search: qs ? `?${qs}` : '' });

    if (!response.ok) return null;

    return await readData<T>(response);
  } catch {
    // The API is down. The page still renders — with an empty section and no stack trace.
    return null;
  }
}

/** An empty page, for when a read fails and the caller wants to render the shell regardless. */
export function emptyPage<T>(pageSize = 20): PagedResult<T> {
  return {
    items: [],
    page: 1,
    pageSize,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  };
}
