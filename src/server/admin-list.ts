import 'server-only';

import type { PagedResult } from '@/contracts/envelope';

import { emptyPage, fetchMine } from './queries';

/**
 * The paging every admin list screen shares.
 *
 * Nine screens read one endpoint, page it and hand the rows to `ServerDataGrid`. Repeating the
 * search-param parsing nine times is how one of them ends up defaulting to a different page size, or
 * accepting `?page=-1` and asking the API for a negative offset.
 */
export type AdminListParams = Record<string, string | string[] | undefined>;

const DEFAULT_PAGE_SIZE = 25;
/** `PageRequest` clamps server-side to 100; asking for more just gets silently reduced. */
const MAX_PAGE_SIZE = 100;

export function readPaging(params: AdminListParams): { page: number; pageSize: number } {
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

  const page = Math.max(1, Number(first(params.page) ?? 1) || 1);
  const requested = Number(first(params.pageSize) ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE;

  return { page, pageSize: Math.min(MAX_PAGE_SIZE, Math.max(1, requested)) };
}

/**
 * Reads one page for an admin list.
 *
 * A failed read becomes an empty page rather than an exception: the grid renders its "nothing here"
 * state and the rest of the panel stays usable, which beats a 500 screen for one table.
 */
export async function fetchAdminPage<T>(
  path: string,
  params: AdminListParams,
  extra: Record<string, string | number | boolean | undefined> = {},
): Promise<PagedResult<T>> {
  const { page, pageSize } = readPaging(params);

  const result = await fetchMine<PagedResult<T>>(path, { page, pageSize, ...extra });

  return result ?? { ...emptyPage<T>(pageSize), page };
}
