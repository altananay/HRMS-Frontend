import 'server-only';

import { apiFetch, readData } from './api-client';
import { readTokens } from './session';
import type { PagedResult } from '@/contracts/envelope';

type Query = Record<string, string | number | boolean | undefined>;

export async function fetchPublic<T>(path: string, query: Query = {}): Promise<T | null> {
  try {
    const response = await apiFetch({ path, search: buildSearch(query) });

    if (!response.ok) return null;

    return await readData<T>(response);
  } catch {
    return null;
  }
}

export async function fetchMine<T>(path: string, query: Query = {}): Promise<T | null> {
  const { access } = await readTokens();

  if (!access) return null;

  const search = buildSearch(query);

  try {
    const response = await apiFetch({ path, search, accessToken: access });

    if (!response.ok) return null;

    return await readData<T>(response);
  } catch {
    return null;
  }
}

function buildSearch(query: Query): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === '') continue;
    search.set(key, String(value));
  }

  const qs = search.toString();

  return qs ? `?${qs}` : '';
}

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
