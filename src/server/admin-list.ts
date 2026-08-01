import 'server-only';

import type { PagedResult } from '@/contracts/envelope';

import { emptyPage, fetchMine } from './queries';

export type AdminListParams = Record<string, string | string[] | undefined>;

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

export function readPaging(params: AdminListParams): { page: number; pageSize: number } {
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

  const page = Math.max(1, Number(first(params.page) ?? 1) || 1);
  const requested = Number(first(params.pageSize) ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE;

  return { page, pageSize: Math.min(MAX_PAGE_SIZE, Math.max(1, requested)) };
}

export async function fetchAdminPage<T>(
  path: string,
  params: AdminListParams,
  extra: Record<string, string | number | boolean | undefined> = {},
): Promise<PagedResult<T>> {
  const { page, pageSize } = readPaging(params);

  const result = await fetchMine<PagedResult<T>>(path, { page, pageSize, ...extra });

  return result ?? { ...emptyPage<T>(pageSize), page };
}
