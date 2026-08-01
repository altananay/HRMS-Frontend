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
    expect(alert.className).toMatch(/error/i);
  });

  it('should_ShowTheFirstMessage_WhenTwoAreQueuedInTheSameTick', async () => {
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
