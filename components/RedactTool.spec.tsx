import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { RedactTool } from './RedactTool';
import type { OCRResult } from '../src/core/ocr/types';

const w = (text: string, x0: number, x1: number) => ({ text, bbox: { x0, y0: 10, x1, y1: 30 }, confidence: 95 });

function fakeResult(): OCRResult {
  const words = [w('Mail', 0, 40), w('jane@example.com', 50, 200), w('Card', 0, 40), w('4242', 50, 90), w('4242', 95, 135), w('4242', 140, 180), w('4242', 185, 225)];
  return {
    text: 'Mail jane@example.com\nCard 4242 4242 4242 4242',
    words,
    lines: [
      { text: 'Mail jane@example.com', bbox: { x0: 0, y0: 5, x1: 200, y1: 35 } },
      { text: 'Card 4242 4242 4242 4242', bbox: { x0: 0, y0: 5, x1: 225, y1: 35 } },
    ],
    metrics: {},
  } as unknown as OCRResult;
}

function setup() {
  // Both lines share a y range in this fixture, so give the card line its own band.
  const r = fakeResult();
  r.words.forEach((x, i) => { if (i >= 2) { x.bbox.y0 = 60; x.bbox.y1 = 80; } });
  (r.lines as any)[1].bbox = { x0: 0, y0: 55, x1: 225, y1: 85 };
  const engine = {
    isReady: false,
    init: vi.fn(async () => {}),
    recognize: vi.fn(async () => ({ result: r, network: { totalOutboundBytes: 0, requests: [], verifiedZeroUpload: true } })),
    terminate: vi.fn(async () => {}),
  };
  const renderFn = vi.fn(async () => new Blob(['x'], { type: 'image/png' }));
  render(<RedactTool createEngine={() => engine as any} readSize={async () => ({ width: 300, height: 120 })} render={renderFn} />);
  return { engine, renderFn };
}

async function upload() {
  const file = new File(['img'], 'shot.png', { type: 'image/png' });
  fireEvent.change(screen.getByTestId('redact-input'), { target: { files: [file] } });
  await waitFor(() => expect(screen.getByTestId('redact-findings')).toBeTruthy());
}

describe('RedactTool', () => {
  it('finds the email and the card and draws a box for each', async () => {
    setup();
    await upload();
    const list = screen.getByTestId('redact-findings');
    expect(list.textContent).toContain('jane@example.com');
    expect(list.textContent).toContain('4242 4242 4242 4242');
    expect(screen.getAllByTestId('redact-box')).toHaveLength(2);
  });

  it('unchecking a finding removes its box', async () => {
    setup();
    await upload();
    const boxes = screen.getAllByTestId('redact-box').length;
    const first = within(screen.getByTestId('redact-findings')).getAllByRole('checkbox')[0];
    fireEvent.click(first);
    expect(screen.getAllByTestId('redact-box').length).toBe(boxes - 1);
  });

  it('exports with every active box and never leaves the browser', async () => {
    const { renderFn } = setup();
    URL.createObjectURL = vi.fn(() => 'blob:x');
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    await upload();
    const button = screen.getByRole('button', { name: 'Download redacted image' });
    await waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false), { timeout: 5000 });
    fireEvent.click(button);
    await waitFor(() => expect(renderFn).toHaveBeenCalled(), { timeout: 5000 });
    expect((renderFn.mock.calls[0] as any)[1]).toHaveLength(2);
  });
});
