import { SHARE_HEIGHT, SHARE_WIDTH, type Ctx } from '../debt/shareImage';
import type { Grade } from './grade';

export interface ShareInput {
  title: string;
  difficulty: string;
  grade: Pick<Grade, 'score' | 'label'> & { found: number; total: number };
}

/** The 1200x630 result card. Pure drawing: nothing is fetched, no fonts are loaded. */
export function drawChallengeCard(ctx: Ctx, input: ShareInput, siteHost = 'getrendercheck.com') {
  const sans = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  const { score, label, found, total } = input.grade;
  const color = score >= 75 ? '#4ade80' : score >= 40 ? '#fbbf24' : '#f87171';

  ctx.fillStyle = '#0b1020';
  ctx.fillRect(0, 0, SHARE_WIDTH, SHARE_HEIGHT);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 12, SHARE_HEIGHT);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#9aa4bf';
  ctx.font = `600 28px ${sans}`;
  ctx.fillText('RenderCheck weekly challenge', 64, 92);

  ctx.fillStyle = '#ffffff';
  ctx.font = `700 52px ${sans}`;
  ctx.fillText(input.title, 64, 190);

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 220px ${sans}`;
  ctx.fillText(String(score), 56, 410);
  ctx.fillStyle = '#9aa4bf';
  ctx.font = `600 44px ${sans}`;
  ctx.fillText('/ 100', 64 + String(score).length * 124 + 8, 410);

  ctx.fillStyle = color;
  ctx.font = `700 48px ${sans}`;
  ctx.fillText(label, 64, 480);

  ctx.fillStyle = '#e5e9f5';
  ctx.font = `500 30px ${sans}`;
  ctx.fillText(`Found ${found} of ${total} bug${total === 1 ? '' : 's'} · ${input.difficulty}`, 64, 530);

  ctx.fillStyle = '#ffffff';
  ctx.font = `700 30px ${sans}`;
  ctx.fillText(`${siteHost}/ocr-challenge-lab`, 64, 585);
}

export async function renderChallengeImage(input: ShareInput, siteHost?: string): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = SHARE_WIDTH;
  canvas.height = SHARE_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available in this browser.');
  drawChallengeCard(ctx, input, siteHost);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create the image.'))), 'image/png')
  );
}
