'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useTranslations } from 'next-intl';

import { useToasts } from '@/components/ui/ToastProvider';
import { isApiError } from '@/contracts/api-error';
import { apiErrorMessage } from '@/lib/api-error';
import { api } from '@/lib/http';

/**
 * Deletes one record, behind a confirmation.
 *
 * `path` is the full proxy path so each screen names its own endpoint — they are not uniform
 * (`deletebyid/{id}` for most, `deletecv/{id}` for résumés), and inventing a convention here would
 * have hidden that.
 *
 * `label` names the record in the dialog and in the button's accessible name. In a table of identical
 * rows, "Delete" alone tells a screen-reader user nothing about which one they are about to remove.
 */
export function DeleteRecordButton({ path, label }: { path: string; label: string }) {
  const t = useTranslations('admin');
  const tRoot = useTranslations();
  const router = useRouter();
  const toasts = useToasts();
  const [open, setOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  const confirm = useCallback(() => {
    startDelete(async () => {
      try {
        await api(path, { method: 'DELETE' });
        toasts.success(t('deleted'));
        setOpen(false);
        router.refresh();
      } catch (error) {
        toasts.error(
          isApiError(error) ? apiErrorMessage(error, (key) => tRoot(key)) : tRoot('errors.unknown'),
        );
      }
    });
  }, [path, router, t, tRoot, toasts]);

  return (
    <>
      <Tooltip title={t('delete')}>
        <IconButton
          size="small"
          onClick={(event) => {
            // The row itself may navigate; deleting must not also open the record.
            event.stopPropagation();
            setOpen(true);
          }}
          aria-label={`${t('delete')}: ${label}`}
          sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
        >
          <DeleteOutlineRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} onClick={(event) => event.stopPropagation()}>
        <DialogTitle>{t('deleteConfirm')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {label}
            <br />
            {t('deleteConfirmBody')}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">
            {t('cancel')}
          </Button>
          <Button onClick={confirm} color="error" variant="contained" loading={isDeleting}>
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
