import { describe, it, expect } from 'vitest';
import { drawShareCard, SHARE_WIDTH, SHARE_HEIGHT, type Ctx } from './shareImage';
import { QUESTIONS } from './model';

function fakeCtx() {
  const texts: string[] = [];
  const rects: number[][] = [];
  let fills = 0;
  const ctx = {
    fillStyle: '', strokeStyle: '', lineWidth: 0, font: '', textAlign: 'left', textBaseline: 'alphabetic', globalAlpha: 1,
    fillRect: (...a: number[]) => void rects.push(a),
    fillText: (t: string) => void texts.push(t),
    beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, save() {}, restore() {}, stroke() {},
    fill: () => void fills++,
  } as unknown as Ctx;
  return { ctx, texts, rects, get fills() { return fills; } };
}

const worst = QUESTIONS.map((q) => q.options.reduce((bi, o, i, arr) => (o.points > arr[bi].points ? i : bi), 0));
const best = QUESTIONS.map((q) => q.options.findIndex((o) => o.points === 0));

describe('drawShareCard', () => {
  it('paints the full 1200x630 background', () => {
    const f = fakeCtx();
    drawShareCard(f.ctx, worst);
    expect(f.rects[0]).toEqual([0, 0, SHARE_WIDTH, SHARE_HEIGHT]);
  });
  it('writes score, band, biggest gap and the link', () => {
    const f = fakeCtx();
    drawShareCard(f.ctx, worst, 'example.com');
    expect(f.texts).toContain('100');
    expect(f.texts).toContain('Critical risk');
    expect(f.texts).toContain('example.com/verify-debt-score');
    expect(f.texts.some((t) => t.startsWith('Biggest gap: '))).toBe(true);
  });
  it('shows a clean result as low with no gaps', () => {
    const f = fakeCtx();
    drawShareCard(f.ctx, best);
    expect(f.texts).toContain('0');
    expect(f.texts).toContain('Low risk');
    expect(f.texts).toContain('No gaps found');
  });
  it('labels every axis', () => {
    const f = fakeCtx();
    drawShareCard(f.ctx, worst);
    for (const q of QUESTIONS) expect(f.texts).toContain(q.axis);
  });
});
