import { describe, expect, it } from 'vitest';
import { renderVerdict } from './verdict';

const line = (text: string) => ({ text, confidence: 90, bbox: { x0: 0, y0: 0, x1: 100, y1: 20 } });
const word = (text: string) => ({ text, confidence: 90, bbox: { x0: 0, y0: 0, x1: 40, y1: 20 } });
const fail = { ratio: 1.02, flag: 'INSUFFICIENT_CONTRAST' } as never;

describe('renderVerdict', () => {
  it('passes when the expected text is on screen', () => {
    const v = renderVerdict({ lines: [line('Total: $14.00')], words: [word('Total:')], contrasts: [null], expected: 'Total: $14.00' });
    expect(v.pass).toBe(true);
  });
  it('fails as not-visible when nothing resembles the text', () => {
    const v = renderVerdict({ lines: [line('Order summary')], words: [], contrasts: [], expected: 'Total: $14.00' });
    expect(v).toMatchObject({ pass: false, reason: 'not-visible', seen: null });
  });
  it('fails as mismatch and reports what was read', () => {
    const v = renderVerdict({ lines: [line('Total: €14.00')], words: [word('Total:')], contrasts: [null], expected: 'Total: $14.00' });
    expect(v).toMatchObject({ pass: false, reason: 'mismatch', seen: 'Total: €14.00' });
  });
  it('fails on low contrast inside the matched line', () => {
    const v = renderVerdict({ lines: [line('Total: $14.00')], words: [word('Total:')], contrasts: [fail], expected: 'Total: $14.00' });
    expect(v).toMatchObject({ pass: false, reason: 'low-contrast' });
  });
});
