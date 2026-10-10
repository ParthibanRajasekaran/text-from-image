import { describe, expect, it } from 'vitest';
import { parseDiff } from '../../components/DiffView';

describe('parseDiff', () => {
  it('splits highlightDiff markup into plain and differing segments', () => {
    expect(parseDiff('Total: [$]14.00')).toEqual([
      { text: 'Total: ', diff: false },
      { text: '$', diff: true },
      { text: '14.00', diff: false },
    ]);
  });

  it('keeps an empty [] as a differing segment (a character the other string lacks)', () => {
    expect(parseDiff('Pay now[]')).toEqual([
      { text: 'Pay now', diff: false },
      { text: '', diff: true },
    ]);
  });

  it('handles text with no differences, and several differences', () => {
    expect(parseDiff('same')).toEqual([{ text: 'same', diff: false }]);
    expect(parseDiff('[a]b[c]')).toEqual([
      { text: 'a', diff: true },
      { text: 'b', diff: false },
      { text: 'c', diff: true },
    ]);
  });
});
