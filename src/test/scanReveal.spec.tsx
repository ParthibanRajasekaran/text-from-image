import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ScanReveal } from '../../components/tool/ScanReveal';
import ImageToTextTool from '../../components/tool/ImageToTextTool';
import type { OCRResult } from '../core/ocr/types';

const result: OCRResult = {
  text: 'Total 42\nPay now',
  words: [
    { text: 'Total', bbox: { x0: 10, y0: 10, x1: 60, y1: 30 }, confidence: 95 },
    { text: '42', bbox: { x0: 70, y0: 10, x1: 90, y1: 30 }, confidence: 40 },
    { text: 'Pay', bbox: { x0: 10, y0: 50, x1: 40, y1: 70 }, confidence: 90 },
  ],
  lines: [
    { text: 'Total 42', bbox: { x0: 10, y0: 10, x1: 90, y1: 30 }, confidence: 80 },
    { text: 'Pay now', bbox: { x0: 10, y0: 50, x1: 100, y1: 70 }, confidence: 90 },
  ],
  metrics: { durationMs: 10 },
};

beforeAll(() => {
  (globalThis as any).matchMedia ??= vi.fn().mockReturnValue({ matches: false, addEventListener() {}, removeEventListener() {} });
});

describe('ScanReveal', () => {
  const setup = (active: number | null, onActive = vi.fn()) =>
    render(<ScanReveal imageUrl="blob:x" width={200} height={100} words={result.words} lines={result.lines} activeLine={active} onActiveLine={onActive} />);

  it('outlines every word and flags low confidence ones', () => {
    setup(null);
    const boxes = screen.getAllByTestId('scan-box');
    expect(boxes).toHaveLength(3);
    expect(boxes.filter((b) => b.getAttribute('data-low-confidence'))).toHaveLength(1);
    expect(screen.queryByTestId('scan-selection')).toBeNull();
  });

  it('links a text line to its box, by hover and by keyboard focus', () => {
    const onActive = vi.fn();
    setup(null, onActive);
    const line = screen.getByRole('button', { name: 'Pay now' });
    fireEvent.mouseEnter(line);
    expect(onActive).toHaveBeenLastCalledWith(1);
    fireEvent.focus(screen.getByRole('button', { name: 'Total 42' }));
    expect(onActive).toHaveBeenLastCalledWith(0);
    fireEvent.mouseLeave(line);
    expect(onActive).toHaveBeenLastCalledWith(null);
  });

  it('draws the selection for the active line, and hovering a box selects its line', () => {
    const onActive = vi.fn();
    setup(1, onActive);
    expect(screen.getByTestId('scan-selection')).toBeTruthy();
    fireEvent.mouseEnter(screen.getAllByTestId('scan-box')[2]);
    expect(onActive).toHaveBeenLastCalledWith(1);
  });
});

describe('ImageToTextTool', () => {
  it('reads a file with the engine, shows the proof and the scan result', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:x');
    URL.revokeObjectURL = vi.fn();
    (globalThis as any).Image = class {
      naturalWidth = 200;
      naturalHeight = 100;
      onload: null | (() => void) = null;
      set src(_v: string) {
        queueMicrotask(() => this.onload?.());
      }
    };
    const engine: any = {
      isReady: false,
      init: vi.fn(async () => {
        engine.isReady = true;
      }),
      recognize: vi.fn(async () => ({ result, network: { totalOutboundBytes: 0, requests: [], verifiedZeroUpload: true } })),
      terminate: vi.fn(async () => {}),
    };
    render(<ImageToTextTool createEngine={() => engine} />);
    const input = screen.getByLabelText('Drop image or click to upload') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { files: [new File([new Uint8Array(8)], 'shot.png', { type: 'image/png' })] } });
    });
    await waitFor(() => expect(screen.getByTestId('scan-reveal')).toBeTruthy());
    expect(engine.init).toHaveBeenCalledWith('eng');
    expect(screen.getAllByTestId('scan-box')).toHaveLength(3);
    expect(screen.getByTestId('proof-status').textContent).toMatch(/nothing was uploaded/);
  });
});
