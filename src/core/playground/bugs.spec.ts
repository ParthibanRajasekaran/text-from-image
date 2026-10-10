import { describe, expect, it } from 'vitest';
import { domVerdict } from './bugs';

describe('domVerdict', () => {
  it('passes when text matches and the element is displayed', () => {
    expect(domVerdict({ text: 'Total: $14.00', displayed: true, hasSize: true }).pass).toBe(true);
  });
  it('fails when the DOM text differs or the element is hidden', () => {
    expect(domVerdict({ text: 'Total: €14.00', displayed: true, hasSize: true }).pass).toBe(false);
    expect(domVerdict({ text: 'Total: $14.00', displayed: false, hasSize: true }).pass).toBe(false);
  });
});
