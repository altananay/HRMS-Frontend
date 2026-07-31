'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useTranslations } from 'next-intl';

import { useToasts } from '@/components/ui/ToastProvider';
import { isApiError } from '@/contracts/api-error';
import { apiErrorMessage } from '@/lib/api-error';
import { api } from '@/lib/http';

/**
 * Deleting a posting.
 *
 * Behind a confirmation because it cascades: the posting's applications go with it, and the candidates
 * who made them are not asked. The dialog says so rather than just asking "are you sure".
 */
export function DeleteJobButton({ jobId }: { jobId: string }) {
  const t = useTranslations('company');
  const tRoot = useTranslations();
  const router = useRouter();
  const toasts = useToasts();
  const [open, setOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  const confirm = useCallback(() => {
    startDelete(async () => {
      try {
        await api(`JobAdvertisements/deletebyid/${jobId}`, { method: 'DELETE' });
        toasts.success(t('deleted'));
        setOpen(false);
        router.push('/company/jobs');
        router.refresh();
      } catch (error) {
        toasts.error(
          isApiError(error) ? apiErrorMessage(error, (key) => tRoot(key)) : tRoot('errors.unknown'),
        );
      }
    });
  }, [jobId, router, t, tRoot, toasts]);

  return (
    <>
      <Button onClick={() => setOpen(true)} color="error" variant="outlined">
        {t('delete')}
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{t('deleteConfirm')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('deleteConfirmBody')}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">
            {tRoot('common.cancel')}
          </Button>
          <Button onClick={confirm} color="error" variant="contained" loading={isDeleting}>
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
