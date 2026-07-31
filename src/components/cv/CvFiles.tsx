'use client';

import { useCallback, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { useFormatter, useTranslations } from 'next-intl';

import { useToasts } from '@/components/ui/ToastProvider';
import { EmptyState } from '@/components/ui/EmptyState';
import { isApiError } from '@/contracts/api-error';
import type { CvFileResponse } from '@/contracts/responses';
import { apiErrorMessage } from '@/lib/api-error';
import { api } from '@/lib/http';

/**
 * Résumé file management.
 *
 * The limits below mirror `CvFileManager` exactly. They are checked here so the user is told
 * immediately rather than after uploading five megabytes over a slow connection — but the server is
 * still the one that decides, and it rejects anything that gets past this with a 409.
 */
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 5;
const ACCEPTED = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export function CvFiles({ files }: { files: readonly CvFileResponse[] }) {
  const t = useTranslations('files');
  const tRoot = useTranslations();
  const format = useFormatter();
  const toasts = useToasts();
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setUploading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<CvFileResponse | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const report = useCallback(
    (error: unknown) => {
      toasts.error(isApiError(error) ? apiErrorMessage(error, (key) => tRoot(key)) : tRoot('errors.unknown'));
    },
    [toasts, tRoot],
  );

  const upload = useCallback(
    async (file: File) => {
      if (files.length >= MAX_FILES) {
        toasts.error(t('tooMany', { maxFiles: MAX_FILES }));
        return;
      }

      if (file.size > MAX_FILE_BYTES) {
        toasts.error(t('tooLarge', { maxMb: MAX_FILE_BYTES / 1024 / 1024 }));
        return;
      }

      if (!ACCEPTED.includes(file.type as (typeof ACCEPTED)[number])) {
        toasts.error(t('wrongType'));
        return;
      }

      setUploading(true);

      try {
        // `FormData`, and `lib/http` deliberately does not set `content-type` for it — the browser has
        // to add the multipart boundary. The field name is `files` because the controller binds an
        // `IFormFileCollection` parameter of that name.
        const body = new FormData();
        body.append('files', file, file.name);

        await api('Cvs/uploadfile', { method: 'POST', body });

        toasts.success(t('uploaded'));
        router.refresh();
      } catch (error) {
        report(error);
      } finally {
        setUploading(false);
        // Reset the input, or picking the same file twice in a row fires no `change` event and the
        // second attempt appears to do nothing.
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [files.length, report, router, t, toasts],
  );

  const confirmDelete = useCallback(() => {
    const file = pendingDelete;
    if (!file) return;

    startDelete(async () => {
      try {
        await api(`Cvs/files/${file.id}`, { method: 'DELETE' });
        toasts.success(t('deleted'));
        setPendingDelete(null);
        router.refresh();
      } catch (error) {
        report(error);
      }
    });
  }, [pendingDelete, report, router, t, toasts]);

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          onClick={() => inputRef.current?.click()}
          variant="contained"
          startIcon={<UploadFileRoundedIcon />}
          loading={isUploading}
          disabled={files.length >= MAX_FILES}
        >
          {isUploading ? t('uploading') : t('upload')}
        </Button>

        <Box
          component="input"
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
          sx={{ display: 'none' }}
        />
      </Box>

      {files.length === 0 ? (
        <EmptyState
          title={t('empty')}
          description={t('emptyHint')}
          icon={<InsertDriveFileOutlinedIcon />}
        />
      ) : (
        <Card>
          <List>
            {files.map((file) => (
              <ListItem
                key={file.id}
                secondaryAction={
                  <Stack direction="row" spacing={0.5}>
                    {/*
                      A plain link, not a fetch. The proxy streams the file with its
                      `content-disposition` intact, so the browser's own download handling takes over —
                      and the URL only works with the session cookie attached.
                    */}
                    <Tooltip title={t('download')}>
                      <IconButton
                        component="a"
                        href={`/api/proxy/Cvs/files/${file.id}`}
                        aria-label={`${t('download')}: ${file.fileName}`}
                      >
                        <DownloadRoundedIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={t('delete')}>
                      <IconButton
                        onClick={() => setPendingDelete(file)}
                        aria-label={`${t('delete')}: ${file.fileName}`}
                        sx={{ '&:hover': { color: 'error.main' } }}
                      >
                        <DeleteOutlineRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                }
              >
                <ListItemIcon>
                  <InsertDriveFileOutlinedIcon />
                </ListItemIcon>
                <ListItemText
                  primary={file.fileName}
                  secondary={`${formatBytes(file.sizeBytes)} · ${t('uploadedAt', {
                    date: format.dateTime(new Date(file.createdAt), 'short'),
                  })}`}
                  slotProps={{ primary: { sx: { fontWeight: 500, wordBreak: 'break-all' } } }}
                />
              </ListItem>
            ))}
          </List>
        </Card>
      )}

      <Dialog open={pendingDelete !== null} onClose={() => setPendingDelete(null)}>
        <DialogTitle>{t('confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingDelete?.fileName}
            <br />
            {t('confirmDeleteBody')}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPendingDelete(null)} color="inherit">
            {t('cancel')}
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" loading={isDeleting}>
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

/** Bytes as KB or MB. Sizes here are small and bounded, so two units are enough. */
function formatBytes(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
