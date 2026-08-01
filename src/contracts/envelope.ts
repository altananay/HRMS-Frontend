export type Result = {
  isSuccess: boolean;
  message: string | null;
};

export type DataResult<T> = Result & {
  data: T;
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export const PAGE_SIZE_DEFAULT = 20;
export const PAGE_SIZE_MAX = 100;

export type Guid = string;

export type DateOnlyString = string;

export type DateTimeString = string;
