import { describe, expect, it } from 'vitest';
import { SHARE_HEIGHT, SHARE_WIDTH, type Ctx } from '../debt/shareImage';
import { drawChallengeCard } from './shareImage';

function fakeCtx() {
  const texts: string[] = [];
  const rects: number[][] = [];
  const ctx = {
    fillStyle: '', strokeStyle: '', lineWidth: 0, font: '', textAlign: 'left', textBaseline: 'alphabetic', globalAlpha: 1,
    fillRect: (...a: number[]) => void rects.push(a),
    fillText: (t: string) => void texts.push(t),
    beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, save() {}, restore() {}, stroke() {}, fill() {},
  } as unknown as Ctx;
  return { ctx, texts, rects };
}

describe('drawChallengeCard', () => {
  it('paints the card and writes title, score, tally and link', () => {
    const f = fakeCtx();
    drawChallengeCard(f.ctx, { title: 'A Swiss receipt', difficulty: 'hard', grade: { score: 67, label: 'Getting there', found: 2, total: 3 } }, 'example.com');
    expect(f.rects[0]).toEqual([0, 0, SHARE_WIDTH, SHARE_HEIGHT]);
    expect(f.texts).toContain('A Swiss receipt');
    expect(f.texts).toContain('67');
    expect(f.texts).toContain('Getting there');
    expect(f.texts).toContain('Found 2 of 3 bugs · hard');
    expect(f.texts).toContain('example.com/ocr-challenge-lab');
  });
  it('says "bug" for one', () => {
    const f = fakeCtx();
    drawChallengeCard(f.ctx, { title: 't', difficulty: 'easy', grade: { score: 100, label: 'Perfect', found: 1, total: 1 } });
    expect(f.texts).toContain('Found 1 of 1 bug · easy');
  });
});
