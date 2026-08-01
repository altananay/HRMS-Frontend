'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Card from '@mui/material/Card';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import { useTranslations } from 'next-intl';

export type ServerDataGridProps<Row extends { id: string }> = {
  rows: readonly Row[];
  columns: GridColDef<Row>[];
  rowCount: number;
  page: number;
  pageSize: number;
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
