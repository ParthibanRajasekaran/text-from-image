import { describe, expect, it } from 'vitest';
import {
  QUESTIONS, MAX_TOTAL, rawScore, score100, bandOf, axisValues, biggestRisk, encodeAnswers, decodeAnswers,
} from './model';

const riskiest = QUESTIONS.map((q) => q.options.findIndex((o) => o.points === Math.max(...q.options.map((x) => x.points))));
const safest = QUESTIONS.map((q) => q.options.findIndex((o) => o.points === 0));

describe('score', () => {
  it('is 0 for the safest answers and exactly 100 for the riskiest', () => {
    expect(score100(safest)).toBe(0);
    expect(score100(riskiest)).toBe(100);
    expect(rawScore(riskiest)).toBe(MAX_TOTAL);
  });
  it('makes every band reachable (the raw total alone could never reach "critical")', () => {
    expect(bandOf(score100(safest))).toBe('low');
    expect(bandOf(score100(riskiest))).toBe('critical');
  });
  it('counts only the questions answered so far', () => {
    expect(rawScore([riskiest[0]])).toBe(QUESTIONS[0].options[riskiest[0]].points);
  });
  it('puts the band edges where the page says they are', () => {
    expect([25, 26, 50, 51, 75, 76].map(bandOf)).toEqual(['low', 'moderate', 'moderate', 'high', 'high', 'critical']);
  });
});

describe('axes', () => {
  it('leaves unanswered questions null and scales answered ones to 0..1', () => {
    const v = axisValues([riskiest[0], safest[1]]);
    expect(v[0].value).toBe(1);
    expect(v[1].value).toBe(0);
    expect(v[2].value).toBeNull();
  });
  it('names the biggest risk, or none when there is no debt', () => {
    expect(biggestRisk(safest)).toBeNull();
    expect(biggestRisk(riskiest)?.value).toBe(1);
    const only = safest.map((a, i) => (i === 3 ? riskiest[3] : a));
    expect(biggestRisk(only)?.id).toBe(QUESTIONS[3].id);
  });
});

describe('share link encoding', () => {
  it('round-trips a complete result', () => {
    expect(decodeAnswers(encodeAnswers(riskiest))).toEqual(riskiest);
  });
  it('rejects wrong length, non-digits, out-of-range options and partial results', () => {
    expect(decodeAnswers('012')).toBeNull();
    expect(decodeAnswers('x'.repeat(QUESTIONS.length))).toBeNull();
    expect(decodeAnswers('9'.repeat(QUESTIONS.length))).toBeNull();
    expect(decodeAnswers(encodeAnswers([0, 1]))).toBeNull();
  });
});
