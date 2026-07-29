/**
 * The API's success envelope, from `Core/Application/Common/Models/Result.cs` and `PagedResult.cs`.
 * Names mirror the backend's own.
 */

/** `IResult` — what updates and deletes return. There is no `data` key at all. */
export type Result = {
  isSuccess: boolean;
  message: string | null;
};

/** `IDataResult<T>` — reads and creates. */
export type DataResult<T> = Result & {
  data: T;
};

/**
 * `PagedResult<T>`.
 *
 * `totalPages`, `hasPreviousPage` and `hasNextPage` are computed C# properties, so they *are*
 * serialized — no need to derive them here. Note `page` is **1-based**, while MUI's DataGrid is
 * 0-based; `ServerDataGrid` owns that single adaptation.
 */
export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

/** `PageRequest` clamps server-side to 1..100, default 20. Mirrored so callers can respect it. */
export const PAGE_SIZE_DEFAULT = 20;
export const PAGE_SIZE_MAX = 100;

/**
 * A GUID on the wire. Kept as a distinct alias so a signature reads `employerId: Guid` rather than
 * `employerId: string` — three same-typed string parameters in a row is how ids get swapped.
 */
export type Guid = string;

/** `DateOnly` — `"2026-09-01"`. Never build one with `toISOString()`; see `lib/format.ts`. */
export type DateOnlyString = string;

/** `DateTime` — ISO 8601 with `Z`. The API's timestamps are always UTC. */
export type DateTimeString = string;
