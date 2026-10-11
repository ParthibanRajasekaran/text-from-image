import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { HeroDemo, STATUS_COLORS } from '../../components/HeroDemo';
import type { OCRResult } from '../core/ocr/types';

const W = 400;
const H = 100;
// Left half dark text on white, right half white on #FEFEFE.
const data = new Uint8ClampedArray(W * H * 4);
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    const left = x < W / 2;
    const stroke = x % 6 < 2 && y > 5 && y < 95;
    const v = left ? (stroke ? 0 : 255) : stroke ? 255 : 254;
    data[i] = data[i + 1] = data[i + 2] = v;
    data[i + 3] = 255;
  }

const box = (x0: number, y0 = 10, w = 90) => ({ x0, y0, x1: x0 + w, y1: y0 + 80 });
const result: OCRResult = {
  text: 'Total: €14.00 Hello ghost',
  words: [
    { text: 'Total:', bbox: box(10, 10, 80), confidence: 96 },
    { text: '€14.00', bbox: box(100, 10, 90), confidence: 96 },
    { text: 'Hello', bbox: box(210, 10, 80), confidence: 60 }, // right half, low confidence AND low contrast
    { text: 'ghost', bbox: box(300, 10, 80), confidence: 98 }, // right half, low contrast
  ],
  lines: [
    { text: 'Total: €14.00', bbox: { x0: 10, y0: 10, x1: 190, y1: 90 }, confidence: 96 },
    { text: 'Hello ghost', bbox: { x0: 210, y0: 10, x1: 380, y1: 90 }, confidence: 80 },
  ],
  metrics: { durationMs: 12 },
};
const network = { totalOutboundBytes: 0, requests: [], verifiedZeroUpload: true };

const mockReducedMotion = (reduce: boolean) => {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
};

function setup() {
  const recognize = vi.fn(async () => ({ result, network }));
  const init = vi.fn(async () => undefined);
  const engine = { init, recognize, terminate: vi.fn(async () => undefined), isReady: false };
  init.mockImplementation(async () => {
    engine.isReady = true;
  });
  const utils = render(
    <HeroDemo
      createEngine={() => engine as never}
      readPixels={async () => ({ image: { data, width: W, height: H }, width: W, height: H, scale: 1 })}
    />
  );
  return { engine, recognize, init, ...utils };
}

const upload = (container: HTMLElement) => {
  const input = container.querySelector('[data-testid="hero-demo-input"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [new File(['x'], 'shot.png', { type: 'image/png' })] } });
};

beforeEach(() => {
  mockReducedMotion(false);
  URL.createObjectURL = vi.fn(() => 'blob:test');
  URL.revokeObjectURL = vi.fn();
});
afterEach(cleanup);

describe('<HeroDemo />', () => {
  it('starts with a dropzone and no overlay', () => {
    setup();
    expect(screen.getByTestId('hero-demo-dropzone')).toBeTruthy();
    expect(screen.queryByTestId('hero-demo-overlay')).toBeNull();
  });

  it('loads the engine once, then draws one box per word with the right colours', async () => {
    const { container, init, recognize } = setup();
    upload(container);
    await waitFor(() => expect(screen.getAllByTestId('hero-demo-box')).toHaveLength(4));

    expect(init).toHaveBeenCalledTimes(1);
    expect(recognize).toHaveBeenCalledWith(expect.any(File), expect.objectContaining({ offline: false }));

    const boxes = screen.getAllByTestId('hero-demo-box');
    const by = Object.fromEntries(boxes.map((b) => [b.getAttribute('data-text'), b]));
    expect(by['Total:'].getAttribute('data-status')).toBe('pass');
    expect(by['Total:'].getAttribute('stroke')).toBe(STATUS_COLORS.pass); // #4ADE80
    // Right half is white on #FEFEFE: contrast failure, even for the 98%-confidence word.
    expect(by['ghost'].getAttribute('data-status')).toBe('fail');
    expect(by['ghost'].getAttribute('data-reason')).toBe('contrast');
    expect(by['ghost'].getAttribute('stroke')).toBe('#FB7185');
    // Contrast failure wins over low confidence.
    expect(by['Hello'].getAttribute('data-status')).toBe('fail');
    expect(STATUS_COLORS['low-confidence']).toBe('#FBBF24');
  });

  it('sizes the overlay to the image aspect ratio', async () => {
    const { container } = setup();
    upload(container);
    const overlay = await screen.findByTestId('hero-demo-overlay');
    expect(overlay.getAttribute('viewBox')).toBe(`0 0 ${W} ${H}`);
    expect((screen.getByTestId('hero-demo-stage') as HTMLElement).style.aspectRatio).toBe(`${W} / ${H}`);
  });

  it('uses a 700ms scan-line transition with the specified easing', async () => {
    const { container } = setup();
    upload(container);
    const line = await screen.findByTestId('hero-demo-scanline');
    expect(line.style.transition).toContain('700ms');
    expect(line.style.transition).toContain('cubic-bezier(.2,.8,.2,1)');
  });

  it('drops the animation when the user prefers reduced motion', async () => {
    mockReducedMotion(true);
    const { container } = setup();
    upload(container);
    const line = await screen.findByTestId('hero-demo-scanline');
    await waitFor(() => expect(line.style.transition).toContain('0s'));
    expect(line.style.transition).not.toContain('700ms');
  });

  it('reports expected-vs-read when the closest line differs', async () => {
    const { container } = setup();
    upload(container);
    await screen.findByTestId('hero-demo-overlay');
    fireEvent.change(screen.getByTestId('hero-demo-expected'), { target: { value: 'Total: $14.00' } });
    await waitFor(() =>
      expect(screen.getByTestId('hero-demo-status').textContent).toContain(
        'Expected to find text "[Total: $14.00]" but OCR read "[Total: €14.00]" (Confidence: 96%)'
      )
    );
    const total = screen.getAllByTestId('hero-demo-box').find((b) => b.getAttribute('data-text') === 'Total:')!;
    expect(total.getAttribute('data-status')).toBe('fail');
    expect(total.getAttribute('data-reason')).toBe('mismatch');
    // The snippet follows the expected text and the matched line's region.
    expect(screen.getByTestId('snippet-export').textContent).toContain("toShowText('Total: $14.00'");
    expect(screen.getByTestId('snippet-export').textContent).toContain('region: { x: 10, y: 10, width: 180, height: 80 }');
  });

  it('passes the Offline Mode toggle to the engine', async () => {
    const { container, recognize } = setup();
    fireEvent.click(screen.getByTestId('hero-demo-offline-toggle'));
    upload(container);
    await screen.findByTestId('hero-demo-overlay');
    expect(recognize).toHaveBeenCalledWith(expect.any(File), expect.objectContaining({ offline: true }));
  });

  it('shows the audit as verified after a run', async () => {
    const { container } = setup();
    upload(container);
    await screen.findByTestId('hero-demo-overlay');
    expect(screen.getByTestId('hero-demo-verified').textContent).toContain('0 bytes uploaded');
  });

  it('shows an error when OCR fails', async () => {
    const { container, recognize } = setup();
    recognize.mockRejectedValueOnce(new Error('engine exploded'));
    upload(container);
    await waitFor(() => expect(screen.getByTestId('hero-demo-status').textContent).toContain('engine exploded'));
    expect(screen.getByTestId('hero-demo-status').getAttribute('data-phase')).toBe('error');
  });
});

describe('<HeroDemo /> confidence heatmap and diff view (PRD N5)', () => {
  it('switches the overlay to a confidence heatmap without re-running OCR', async () => {
    const { container, recognize } = setup();
    upload(container);
    await waitFor(() => expect(screen.getAllByTestId('hero-demo-box')).toHaveLength(4));
    expect(screen.getByTestId('hero-demo-view-boxes').getAttribute('aria-pressed')).toBe('true');
    expect(screen.queryByTestId('hero-demo-heat-legend')).toBeNull();

    fireEvent.click(screen.getByTestId('hero-demo-view-heatmap'));

    const by = Object.fromEntries(screen.getAllByTestId('hero-demo-box').map((b) => [b.getAttribute('data-text'), b]));
    // 96% -> near the green end, 60% -> between rose and amber, 98% -> exactly green
    expect(by['ghost'].getAttribute('fill')).toBe('#4ADE80');
    expect(by['Hello'].getAttribute('fill')).not.toBe(by['ghost'].getAttribute('fill'));
    expect(by['Hello'].getAttribute('data-heat')).toBe(by['Hello'].getAttribute('fill'));
    expect(screen.getByTestId('hero-demo-heat-legend')).toBeTruthy();
    expect(screen.getByTestId('hero-demo-view-heatmap').getAttribute('aria-pressed')).toBe('true');
    expect(recognize).toHaveBeenCalledTimes(1);

    // Back to boxes: the verdict colours return.
    fireEvent.click(screen.getByTestId('hero-demo-view-boxes'));
    const back = Object.fromEntries(screen.getAllByTestId('hero-demo-box').map((b) => [b.getAttribute('data-text'), b]));
    expect(back['ghost'].getAttribute('stroke')).toBe('#FB7185');
    expect(back['ghost'].getAttribute('data-heat')).toBeNull();
  });

  it('shows no view toggle before there is a result', () => {
    setup();
    expect(screen.queryByTestId('hero-demo-view-heatmap')).toBeNull();
  });

  it('marks the differing characters when the expected text does not match the pixels', async () => {
    const { container } = setup();
    upload(container);
    await waitFor(() => expect(screen.getAllByTestId('hero-demo-box')).toHaveLength(4));

    fireEvent.change(screen.getByTestId('hero-demo-expected'), { target: { value: 'Total: $14.00' } });

    const view = await screen.findByTestId('diff-view');
    const marks = Array.from(view.querySelectorAll('[data-testid="diff-mark"]')).map((m) => m.textContent);
    expect(marks).toEqual(['$', '€']); // expected row, then on-screen row
    expect(view.textContent).toContain('Total: ');
    expect(view.textContent).toContain('14.00');
  });

  it('says so when the pixels match exactly', async () => {
    const { container } = setup();
    upload(container);
    await waitFor(() => expect(screen.getAllByTestId('hero-demo-box')).toHaveLength(4));
    fireEvent.change(screen.getByTestId('hero-demo-expected'), { target: { value: 'Total: €14.00' } });
    const view = await screen.findByTestId('diff-view');
    expect(view.textContent).toMatch(/match the expected text exactly/i);
    expect(view.querySelector('[data-testid="diff-mark"]')).toBeNull();
  });
});
