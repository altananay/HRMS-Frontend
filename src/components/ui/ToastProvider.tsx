'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Snackbar from '@mui/material/Snackbar';

/**
 * Toasts, on MUI's own `Snackbar` + `Alert`. `react-toastify` was a dependency of the old app; it
 * brings its own stylesheet and its own theming model, which then has to be kept in step with the MUI
 * palette by hand. This is the whole feature in one file.
 */

export type ToastSeverity = 'success' | 'info' | 'warning' | 'error';

export type ToastOptions = {
  severity?: ToastSeverity;
  title?: string;
  /** Milliseconds. Errors default to longer, and `null` keeps it open until dismissed. */
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

/**
 * Queue length, including the visible message. A UI action produces one toast, so a queue this long
 * already means something is firing in a loop; dropping the overflow is better than holding the user
 * hostage to a minute of notifications.
 */
const MAX_QUEUED = 4;

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  /** The head of the queue is the visible message. */
  const [queue, setQueue] = useState<Toast[]>([]);
  /** The id of the message the user (or the timer) has dismissed, so `open` can be derived. */
  const [dismissedId, setDismissedId] = useState<number | null>(null);

  const current = queue[0];

  /**
   * `open` is **derived**, and that is what makes this component correct.
   *
   * Two earlier shapes both failed silently. Branching inside `show()` on an `open` *state* reads a
   * closure one render stale, so two calls in the same tick each concluded nothing was on screen and
   * the first message was overwritten before it rendered. Replacing that flag with a ref fixed the
   * read and broke something worse: the second call closed a Snackbar that had not finished opening,
   * and neither message appeared. Driving it from an effect works but cascades renders, which is
   * exactly what `react-hooks/set-state-in-effect` objects to.
   *
   * With `open` computed from the queue there is no flag to go stale: appending is the only write,
   * the head is the visible toast by definition, and dismissal is recorded per id rather than as a
   * boolean that outlives the message it referred to.
   */
  const open = current !== undefined && current.id !== dismissedId;

  const show = useCallback<ShowToast>((message, options) => {
    setQueue((pending) =>
      pending.length >= MAX_QUEUED
        ? pending
        : [...pending, { id: (nextId += 1), message, ...options }],
    );
  }, []);

  const dismiss = useCallback((_event: unknown, reason?: string) => {
    // Clicking away should not dismiss a message the user may not have read yet.
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
        // Remounts per message, so each one plays its own enter transition instead of the text
        // swapping inside a Snackbar that is already on screen.
        key={current.id}
        open={open}
        autoHideDuration={duration}
        onClose={dismiss}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        // Dropping the head only after the exit transition has finished is what keeps the outgoing and
        // incoming toasts from overlapping.
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

/** Convenience wrappers, so call sites read as intent rather than as configuration. */
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
