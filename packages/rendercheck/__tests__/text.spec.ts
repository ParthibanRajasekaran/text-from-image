import { describe, expect, it } from 'vitest';
import { highlightDiff, normalizeText, similarity } from '../src/core/text';

describe('text helpers', () => {
  it('normalises whitespace and, optionally, case', () => {
    expect(normalizeText('  Total:\n  $14.00 ')).toBe('total: $14.00');
    expect(normalizeText('  Total:\n  $14.00 ', false)).toBe('Total: $14.00');
  });
  it('scores similarity', () => {
    expect(similarity('Total: $14.00', 'total:  $14.00')).toBe(1);
    expect(similarity('Total: $14.00', 'Total: €14.00')).toBeCloseTo(1 - 1 / 13, 5);
    expect(similarity('a', '')).toBe(0);
    expect(similarity('Pay', 'pay', false)).toBeLessThan(1);
  });
  it('highlights exactly where strings differ', () => {
    expect(highlightDiff('Total: $14.00', 'Total: €14.00')).toEqual({
      expected: 'Total: [$]14.00',
      actual: 'Total: [€]14.00',
    });
    expect(highlightDiff('Pay now', 'Pay noww')).toEqual({ expected: 'Pay no[]w', actual: 'Pay no[w]w' });
  });
  it('handles insertions and deletions', () => {
    const d = highlightDiff('Total 14', 'Total: 14');
    expect(d.expected.replace(/[[\]]/g, '')).toBe('Total 14');
    expect(d.actual.replace(/[[\]]/g, '')).toBe('Total: 14');
    expect(d.actual).toContain('[:]');
  });
  it('is identical for identical strings', () => {
    expect(highlightDiff('same', 'same')).toEqual({ expected: 'same', actual: 'same' });
  });
});
