'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Card from '@mui/material/Card';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import { useTranslations } from 'next-intl';

/**
 * The admin panel's table. Paged by the **server**, driven by the URL.
 *
 * Two conversions live here and nowhere else, because getting either wrong is quiet rather than loud:
 *
 *   **Page numbering.** The API is 1-based, DataGrid is 0-based. One place does the arithmetic; a
 *   second copy would eventually drift and show page 2 while asking for page 3.
 *
 *   **State location.** The page lives in the query string, not in component state, so a reload or a
 *   shared link lands on the same page — and the rows are rendered on the server, which is what keeps
 *   these screens fast with a large table behind them.
 */
export type ServerDataGridProps<Row extends { id: string }> = {
  rows: readonly Row[];
  columns: GridColDef<Row>[];
  rowCount: number;
  page: number;
  pageSize: number;
  /** Called when a row is clicked. Omit to leave rows inert. */
  onRowClick?: (row: Row) => void;
};

const PAGE_SIZES = [10, 25, 50, 100];

export function ServerDataGrid<Row extends { id: string }>({
  rows,
  columns,
  rowCount,
  page,
  pageSize,
  onRowClick,
}: ServerDataGridProps<Row>) {
  const t = useTranslations('admin');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const paginationModel = useMemo<GridPaginationModel>(
    // The API's page 1 is the grid's page 0.
    () => ({ page: Math.max(0, page - 1), pageSize }),
    [page, pageSize],
  );

  const onPaginationModelChange = useCallback(
    (model: GridPaginationModel) => {
      const params = new URLSearchParams(searchParams.toString());

      params.set('page', String(model.page + 1));
      params.set('pageSize', String(model.pageSize));

      router.push(`${pathname}?${params}`);
    },
    [pathname, router, searchParams],
  );

  return (
    <Card>
      <DataGrid
        rows={rows as Row[]}
        columns={columns}
        rowCount={rowCount}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={PAGE_SIZES}
        disableColumnFilter
        // Sorting is client-side in the grid but the data is one server page, so a sort would only
        // order the visible rows and read as if it ordered everything. The API has no sort parameter
        // for these lists, so it is off rather than misleading.
        disableColumnSorting
        disableRowSelectionOnClick
        onRowClick={onRowClick ? (params) => onRowClick(params.row as Row) : undefined}
        localeText={{ noRowsLabel: t('empty') }}
        autoHeight
        sx={{
          border: 0,
          '& .MuiDataGrid-columnHeaders': { bgcolor: 'background.subtle' },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none' },
          ...(onRowClick && { '& .MuiDataGrid-row': { cursor: 'pointer' } }),
        }}
      />
    </Card>
  );
}
