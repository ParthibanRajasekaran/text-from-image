import { describe, expect, it } from 'vitest';
import { classifyWords, findTargetLine, similarity, LOW_CONFIDENCE } from './classify';
import type { OCRLine, OCRWord } from '../ocr/types';
import type { ContrastResult } from './contrast';

const bb = (x0: number, y0 = 0, x1 = x0 + 40, y1 = y0 + 20) => ({ x0, y0, x1, y1 });
const word = (text: string, x0: number, y0 = 0, confidence = 95): OCRWord => ({ text, bbox: bb(x0, y0), confidence });
const ok: ContrastResult = { ratio: 12, threshold: 4.5, isLargeText: false, passes: true, sampledPixels: 10 };
const bad: ContrastResult = { ...ok, ratio: 1.2, passes: false, flag: 'INSUFFICIENT_CONTRAST' };

describe('similarity', () => {
  it('is 1 for equal text ignoring case and spacing', () => {
    expect(similarity('Total:  $14.00', 'total: $14.00')).toBe(1);
  });
  it('drops by edit distance and is 0 against empty', () => {
    expect(similarity('Total: $14.00', 'Total: €14.00')).toBeCloseTo(1 - 1 / 13, 5);
    expect(similarity('abc', '')).toBe(0);
  });
});

describe('findTargetLine', () => {
  const lines: OCRLine[] = [
    { text: 'Subtotal $12.00', bbox: bb(0, 0, 200, 20), confidence: 95 },
    { text: 'Total: €14.00', bbox: bb(0, 40, 200, 60), confidence: 96 },
  ];
  it('finds the closest line even with a mismatch', () => {
    const m = findTargetLine(lines, 'Total: $14.00');
    expect(m?.line.text).toBe('Total: €14.00');
    expect(m?.contained).toBe(false);
  });
  it('prefers a line that contains the text', () => {
    const m = findTargetLine(lines, '$12.00');
    expect(m?.contained).toBe(true);
    expect(m?.line.text).toBe('Subtotal $12.00');
  });
  it('returns null for nothing similar, or an empty expectation', () => {
    expect(findTargetLine(lines, 'zzzzzzzzzzzzzzzzzz')).toBeNull();
    expect(findTargetLine(lines, '  ')).toBeNull();
  });
});

describe('classifyWords', () => {
  it('maps confidence and contrast to pass / low-confidence / fail', () => {
    const words = [word('a', 0, 0, 95), word('b', 100, 0, LOW_CONFIDENCE - 1), word('c', 200, 0, 99)];
    const out = classifyWords({ words, contrasts: [ok, ok, bad] });
    expect(out.map((w) => w.status)).toEqual(['pass', 'low-confidence', 'fail']);
    expect(out[2].reason).toBe('contrast');
  });

  it('contrast failure wins over low confidence', () => {
    const [w] = classifyWords({ words: [word('x', 0, 0, 10)], contrasts: [bad] });
    expect(w.status).toBe('fail');
  });

  it('treats unmeasurable contrast as not a contrast failure', () => {
    const [w] = classifyWords({ words: [word('x', 0)], contrasts: [null] });
    expect(w.status).toBe('pass');
  });

  it('marks the words of a mismatching target line as fail, and leaves others alone', () => {
    const line: OCRLine = { text: 'Total: €14.00', bbox: bb(0, 40, 200, 60), confidence: 96 };
    const words = [word('Total:', 0, 40), word('€14.00', 60, 40), word('Subtotal', 0, 0)];
    const target = { line, similarity: 0.92, contained: false };
    const out = classifyWords({ words, contrasts: [ok, ok, ok], target });
    expect(out.map((w) => [w.status, w.reason])).toEqual([
      ['fail', 'mismatch'],
      ['fail', 'mismatch'],
      ['pass', undefined],
    ]);
  });

  it('does not fail a line that contains the expected text', () => {
    const line: OCRLine = { text: 'Total: $14.00', bbox: bb(0, 40, 200, 60), confidence: 96 };
    const out = classifyWords({
      words: [word('Total:', 0, 40)],
      contrasts: [ok],
      target: { line, similarity: 1, contained: true },
    });
    expect(out[0].status).toBe('pass');
  });
});
