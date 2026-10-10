import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BreakTheUI } from '../../components/BreakTheUI';

const pixels = { image: { data: new Uint8ClampedArray(4), width: 1, height: 1 } as never, width: 1, height: 1, scale: 1 };
const line = (text: string) => ({ text, confidence: 90, bbox: { x0: 0, y0: 0, x1: 100, y1: 20 } });

function setup(lines: ReturnType<typeof line>[]) {
  const engine = {
    isReady: false,
    init: vi.fn().mockResolvedValue(undefined),
    terminate: vi.fn(),
    recognize: vi.fn().mockResolvedValue({
      result: { text: '', words: [], lines, metrics: { durationMs: 1 } },
      network: { requests: [], blocked: 0 },
    }),
  };
  render(
    <BreakTheUI
      rasterize={async () => new Blob(['x'])}
      readPixels={async () => pixels}
      createEngine={() => engine as never}
      readDomSnapshot={() => ({ text: 'Total: $14.00', displayed: true, hasSize: true })}
    />
  );
  return engine;
}

describe('BreakTheUI', () => {
  it('passes both checks on an unbroken card', async () => {
    setup([line('Total: $14.00')]);
    fireEvent.click(screen.getByTestId('btu-run'));
    await waitFor(() => expect(screen.getByTestId('btu-pixels')).toBeInTheDocument());
    expect(screen.getByTestId('btu-dom')).toHaveAttribute('data-pass', 'true');
    expect(screen.getByTestId('btu-pixels')).toHaveAttribute('data-pass', 'true');
    expect(screen.queryByTestId('btu-gap')).toBeNull();
  });

  it('shows the gap and a diff when the DOM passes and the pixels differ', async () => {
    setup([line('Total: €14.00')]);
    fireEvent.click(screen.getByTestId('btu-bug-currency'));
    expect(screen.getByTestId('btu-card')).toHaveClass('b-currency');
    fireEvent.click(screen.getByTestId('btu-run'));
    await waitFor(() => expect(screen.getByTestId('btu-gap')).toBeInTheDocument());
    expect(screen.getByTestId('btu-dom')).toHaveAttribute('data-pass', 'true');
    expect(screen.getByTestId('btu-pixels')).toHaveAttribute('data-pass', 'false');
    expect(screen.getByTestId('diff-view')).toBeInTheDocument();
  });

  it('clears stale results when a bug is toggled', async () => {
    setup([line('Total: $14.00')]);
    fireEvent.click(screen.getByTestId('btu-run'));
    await waitFor(() => expect(screen.getByTestId('btu-results')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('btu-bug-covered'));
    expect(screen.queryByTestId('btu-results')).toBeNull();
  });
});
