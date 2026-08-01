'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Snackbar from '@mui/material/Snackbar';

export type ToastSeverity = 'success' | 'info' | 'warning' | 'error';

export type ToastOptions = {
  severity?: ToastSeverity;
  title?: string;
  duration?: number | null;
};

type Toast = ToastOptions & {
  id: number;
  message: string;
};

type ShowToast = (message: string, options?: ToastOptions) => void;

const ToastContext = createContext<ShowToast | null>(null);

const DEFAULT_DURATION = 5000;
const ERROR_DURATION = 8000;

const MAX_QUEUED = 4;

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<Toast[]>([]);
  const [dismissedId, setDismissedId] = useState<number | null>(null);

  const current = queue[0];

  const open = current !== undefined && current.id !== dismissedId;

  const show = useCallback<ShowToast>((message, options) => {
    setQueue((pending) =>
      pending.length >= MAX_QUEUED
        ? pending
        : [...pending, { id: (nextId += 1), message, ...options }],
    );
  }, []);

  const dismiss = useCallback((_event: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setQueue((pending) => {
      const head = pending[0];
      if (head) setDismissedId(head.id);
      return pending;
    });
  }, []);

  if (!current) {
    return <ToastContext.Provider value={show}>{children}</ToastContext.Provider>;
  }

  const severity = current.severity ?? 'info';
  const duration =
    current.duration === null
      ? null
      : (current.duration ?? (severity === 'error' ? ERROR_DURATION : DEFAULT_DURATION));

  return (
    <ToastContext.Provider value={show}>
      {children}

      <Snackbar
        key={current.id}
        open={open}
        autoHideDuration={duration}
        onClose={dismiss}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        slotProps={{ transition: { onExited: () => setQueue((pending) => pending.slice(1)) } }}
        sx={{ maxWidth: { sm: 480 } }}
      >
        <Alert
          severity={severity}
          variant="filled"
          onClose={dismiss}
          sx={{ width: '100%', boxShadow: 6 }}
        >
          {current.title ? <AlertTitle>{current.title}</AlertTitle> : null}
          {current.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast(): ShowToast {
  const show = useContext(ToastContext);

  if (!show) {
    throw new Error('useToast must be used inside <ToastProvider>.');
  }

  return show;
}

export function useToasts() {
  const show = useToast();

  return useMemo(
    () => ({
      success: (message: string, title?: string) => show(message, { severity: 'success', title }),
      error: (message: string, title?: string) => show(message, { severity: 'error', title }),
      info: (message: string, title?: string) => show(message, { severity: 'info', title }),
      warning: (message: string, title?: string) => show(message, { severity: 'warning', title }),
    }),
    [show],
  );
}
