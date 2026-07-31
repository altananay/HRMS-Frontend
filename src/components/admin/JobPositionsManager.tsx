'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import type { GridColDef } from '@mui/x-data-grid';
import { useTranslations } from 'next-intl';

import { useToasts } from '@/components/ui/ToastProvider';
import { isApiError } from '@/contracts/api-error';
import type { JobPositionResponse } from '@/contracts/responses';
import { apiErrorMessage } from '@/lib/api-error';
import { api } from '@/lib/http';

import { DeleteRecordButton } from './DeleteRecordButton';
import { ServerDataGrid } from './ServerDataGrid';

/**
 * Job positions: full CRUD in one screen.
 *
 * The entity is a single name, so a dialog beats two routes and a form component. Creating one here is
 * a convenience, not the main path — positions are usually created implicitly when an employer types a
 * new one into a posting and `ResolveOrCreateAsync` picks it up.
 *
 * ⚠ Names are unique in the database. Adding one that already exists comes back as a 409 with a
 * specific message, which the toast surfaces as-is rather than replacing with a generic one.
 */
export function JobPositionsManager({
  page,
}: {
  page: { items: JobPositionResponse[]; totalCount: number; page: number; pageSize: number };
}) {
  const t = useTranslations('admin');
  const tRoot = useTranslations();
  const router = useRouter();
  const toasts = useToasts();

  const [editing, setEditing] = useState<JobPositionResponse | 'new' | null>(null);
  const [name, setName] = useState('');
  const [isSaving, startSaving] = useTransition();

  const open = useCallback((target: JobPositionResponse | 'new') => {
    setEditing(target);
    setName(target === 'new' ? '' : target.name);
  }, []);

  const save = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed || !editing) return;

    startSaving(async () => {
      try {
        if (editing === 'new') {
          // `addjobposition`, not `add` — this controller does not follow the others' naming.
          await api('JobPosition/addjobposition', { method: 'POST', body: { name: trimmed } });
          toasts.success(t('jobPositionCreated'));
        } else {
          await api('JobPosition/update', {
            method: 'PUT',
            body: { id: editing.id, name: trimmed },
          });
          toasts.success(t('jobPositionSaved'));
        }

        setEditing(null);
        router.refresh();
      } catch (error) {
        toasts.error(
          isApiError(error) ? apiErrorMessage(error, (key) => tRoot(key)) : tRoot('errors.unknown'),
        );
      }
    });
  }, [editing, name, router, t, tRoot, toasts]);

  const columns: GridColDef<JobPositionResponse>[] = [
    { field: 'name', headerName: t('jobPositionName'), flex: 1, minWidth: 240 },
    {
      field: 'id',
      headerName: t('columns.actions'),
      width: 130,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', height: '100%' }}>
          <Tooltip title={t('edit')}>
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                open(row);
              }}
              aria-label={`${t('edit')}: ${row.name}`}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <DeleteRecordButton path={`JobPosition/deletebyid/${row.id}`} label={row.name} />
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <Button onClick={() => open('new')} variant="contained" sx={{ alignSelf: 'flex-start' }}>
        {t('newJobPosition')}
      </Button>

      <ServerDataGrid
        rows={page.items}
        columns={columns}
        rowCount={page.totalCount}
        page={page.page}
        pageSize={page.pageSize}
      />

      <Dialog open={editing !== null} onClose={() => setEditing(null)} fullWidth maxWidth="xs">
        <DialogTitle>{editing === 'new' ? t('newJobPosition') : t('edit')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label={t('jobPositionName')}
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') save();
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditing(null)} color="inherit">
            {t('cancel')}
          </Button>
          <Button
            onClick={save}
            variant="contained"
            loading={isSaving}
            disabled={name.trim().length === 0}
          >
            {editing === 'new' ? t('create') : t('save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
