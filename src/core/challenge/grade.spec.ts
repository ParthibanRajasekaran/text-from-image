import { describe, expect, it } from 'vitest';
import { CHALLENGES, challengeForDate, weekStart } from './challenges';
import { bestMatch, grade } from './grade';
import type { BugKind } from './challenges';

const by = (id: string) => CHALLENGES.find((c) => c.id === id)!;
const set = (...k: BugKind[]) => new Set<BugKind>(k);

describe('grade', () => {
  const invoice = by('us-invoice-eur');
  const swiss = by('swiss-receipt-de');

  it('gives 100 for the right bug and the right fix', () => {
    expect(grade(invoice, set('currency-symbol'), 'Total $1,234.56').score).toBe(100);
  });

  it('does not reward retyping the buggy text', () => {
    const g = grade(invoice, set('currency-symbol'), 'Total €1,234.56');
    expect(g.detection).toBe(1);
    expect(g.rewrite).toBe(0);
    expect(g.score).toBe(50);
  });

  it('gives part credit for a near miss', () => {
    const g = grade(invoice, set('currency-symbol'), '$1234.56');
    expect(g.rewrite!).toBeGreaterThan(0.3);
    expect(g.rewrite!).toBeLessThan(1);
  });

  it('charges for wrong guesses', () => {
    const g = grade(invoice, set('currency-symbol', 'contrast', 'missing-text'), '$1,234.56');
    expect(g.falsePositives).toEqual(['contrast', 'missing-text']);
    expect(g.detection).toBe(0);
    expect(g.score).toBe(50);
  });

  it('scores every bug of the hard challenge', () => {
    const all = grade(swiss, set('date-order', 'currency-mix', 'math'), 'Datum: 15.06.2026 19:45\nMwSt 7.7% CHF 6.31');
    expect(all.score).toBe(100);
    const one = grade(swiss, set('date-order'), '15.06.2026');
    expect(one.detection).toBeCloseTo(1 / 3);
    expect(one.results.find((r) => r.bug.kind === 'currency-mix')!.fixed).toBe(0);
  });

  it('accepts either fix that makes the sums work', () => {
    const a = grade(swiss, set('math'), 'Gesamtbetrag CHF 90.00');
    const b = grade(swiss, set('math'), 'MwSt CHF 6.31');
    expect(a.results.find((r) => r.bug.kind === 'math')!.fixed).toBe(1);
    expect(b.results.find((r) => r.bug.kind === 'math')!.fixed).toBe(1);
  });

  it('scores a detection-only challenge on naming alone', () => {
    const g = grade(by('rtl-truncation'), set('truncation'), '');
    expect(g.rewrite).toBeNull();
    expect(g.score).toBe(100);
  });

  it('gives nothing for nothing', () => {
    const g = grade(swiss, set(), '');
    expect(g.score).toBe(0);
    expect(g.label).toBe('Keep looking');
  });

  it('shows a diff for a wrong rewrite', () => {
    const g = grade(invoice, set('currency-symbol'), 'Total $1,234.5');
    expect(g.results[0].diff?.expected).toContain('[');
  });
});

describe('bestMatch', () => {
  it('finds the text inside a longer answer', () => {
    expect(bestMatch('Datum: 15.06.2026 19:45', '15.06.2026').sim).toBe(1);
  });
  it('is case sensitive, because CHF is not chf on a receipt', () => {
    expect(bestMatch('chf 6.31', 'CHF 6.31').sim).toBeLessThan(1);
  });
});

describe('rotation', () => {
  it('shows the same challenge to everyone in a week, then moves on', () => {
    const mon = new Date('2026-10-05T00:00:00Z');
    const sun = new Date('2026-10-11T23:59:59Z');
    const next = new Date('2026-10-12T00:00:00Z');
    expect(challengeForDate(mon).id).toBe(challengeForDate(sun).id);
    expect(challengeForDate(next).id).not.toBe(challengeForDate(mon).id);
  });
  it('cycles through all of them', () => {
    const ids = new Set<string>();
    for (let w = 0; w < CHALLENGES.length; w++) ids.add(challengeForDate(new Date(Date.UTC(2026, 0, 5 + 7 * w))).id);
    expect(ids.size).toBe(CHALLENGES.length);
  });
  it('week starts on a Monday', () => {
    expect(weekStart(new Date('2026-10-09T12:00:00Z')).toISOString()).toBe('2026-10-05T00:00:00.000Z');
  });
  it('every bug has a reason and an assertion, and every fix is something to type', () => {
    for (const c of CHALLENGES) for (const b of c.bugs) {
      expect(b.why.length).toBeGreaterThan(20);
      expect(b.catch).toContain('expect');
    }
  });
});
