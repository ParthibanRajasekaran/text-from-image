import { describe, expect, it } from 'vitest';
import { confidenceHeat } from './heat';

describe('confidenceHeat', () => {
  it('uses the stop colours at the stops', () => {
    expect(confidenceHeat(50)).toBe('#FB7185');
    expect(confidenceHeat(80)).toBe('#FBBF24');
    expect(confidenceHeat(95)).toBe('#4ADE80');
  });

  it('clamps outside the scale', () => {
    expect(confidenceHeat(0)).toBe('#FB7185');
    expect(confidenceHeat(-20)).toBe('#FB7185');
    expect(confidenceHeat(100)).toBe('#4ADE80');
    expect(confidenceHeat(250)).toBe('#4ADE80');
    expect(confidenceHeat(Number.NaN)).toBe('#FB7185');
  });

  it('blends between stops', () => {
    // halfway between amber and green
    expect(confidenceHeat(87.5)).toBe('#A3CF52');
    // and between rose and amber: red stays FB, green is halfway between 71 and BF (= 0x98), blue halfway between 85 and 24 (= 0x54 or 0x55)
    const mid = confidenceHeat(65);
    expect(mid.slice(1, 3)).toBe('FB');
    expect(mid.slice(3, 5)).toBe('98');
  });

  it('is monotonic in green and red channel direction: more confident is greener', () => {
    const g = (c: number) => parseInt(confidenceHeat(c).slice(3, 5), 16);
    expect(g(60)).toBeLessThan(g(80));
    expect(g(80)).toBeLessThanOrEqual(g(95));
  });
});
