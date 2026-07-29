import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ToastProvider, useToast, useToasts } from './ToastProvider';

function Trigger({ onRender }: { onRender?: (show: ReturnType<typeof useToast>) => void }) {
  const show = useToast();
  const toasts = useToasts();

  onRender?.(show);

  return (
    <>
      <button onClick={() => show('bir mesaj')}>single</button>
      <button onClick={() => toasts.error('hata oldu')}>error</button>
      <button
        onClick={() => {
          // Both in one tick — this is the case that used to drop the first message.
          show('birinci');
          show('ikinci');
        }}
      >
        burst
      </button>
      <button
        onClick={() => {
          show('birinci', { duration: 20 });
          show('ikinci', { duration: 20 });
        }}
      >
        burst-short
      </button>
    </>
  );
}

describe('ToastProvider', () => {
  it('should_ShowTheMessage_WhenShowIsCalled', async () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    await userEvent.click(screen.getByText('single'));

    expect(await screen.findByText('bir mesaj')).toBeInTheDocument();
  });

  it('should_RenderAsAnAlert_ForErrors', async () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    await userEvent.click(screen.getByText('error'));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('hata oldu');
    // Matched loosely on purpose — MUI has moved this class name between majors, and the assertion
    // that matters is "styled as an error", not the exact slot name.
    expect(alert.className).toMatch(/error/i);
  });

  it('should_ShowTheFirstMessage_WhenTwoAreQueuedInTheSameTick', async () => {
    // Regression test, and it caught two different bugs in a row. First `show` branched on the `open`
    // *state*, stale within a tick, so both calls concluded nothing was showing and the second
    // replaced the first before it rendered. Switching that flag to a ref then made the second call
    // close a Snackbar that had not finished opening, and *neither* message appeared. Both failures
    // were silent.
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    await userEvent.click(screen.getByText('burst'));

    expect(await screen.findByText('birinci')).toBeInTheDocument();
    expect(screen.queryByText('ikinci')).not.toBeInTheDocument();
  });

  it('should_ShowTheSecondMessage_AfterTheFirstAutoHides', async () => {
    // The queue actually draining, end to end: the head is dropped on `onExited`, and the next message
    // takes its place. Without this, "shows the first one" would pass even if the second never came.
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    await userEvent.click(screen.getByText('burst-short'));

    expect(await screen.findByText('birinci')).toBeInTheDocument();
    expect(await screen.findByText('ikinci', undefined, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.queryByText('birinci')).not.toBeInTheDocument();
  });

  it('should_KeepShowStable_AcrossRenders', async () => {
    // `show` lands in `useEffect` dependency arrays. When it changed identity on every open/close, an
    // effect that fired a toast re-fired forever.
    const seen: unknown[] = [];

    render(
      <ToastProvider>
        <Trigger onRender={(show) => seen.push(show)} />
      </ToastProvider>,
    );

    await userEvent.click(screen.getByText('single'));

    expect(new Set(seen).size).toBe(1);
  });

  it('should_Throw_WhenUsedOutsideTheProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<Trigger />)).toThrow(/useToast must be used inside/);

    consoleError.mockRestore();
  });
});
