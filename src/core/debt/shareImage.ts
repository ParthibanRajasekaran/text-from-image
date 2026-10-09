import { axisValues, biggestRisk, bandOf, score100, type Answers, type RiskBand } from './model';

export const SHARE_WIDTH = 1200;
export const SHARE_HEIGHT = 630;

/** The subset of CanvasRenderingContext2D the card uses, so it can be drawn against a fake in tests. */
export type Ctx = Pick<
  CanvasRenderingContext2D,
  | 'fillRect' | 'fillText' | 'beginPath' | 'moveTo' | 'lineTo' | 'closePath' | 'fill' | 'stroke' | 'save' | 'restore'
> & {
  fillStyle: string | CanvasGradient | CanvasPattern;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  lineWidth: number;
  font: string;
  textAlign: CanvasRenderingContext2D["textAlign"];
  textBaseline: CanvasRenderingContext2D["textBaseline"];
  globalAlpha: number;
};

export const BAND_LABEL: Record<RiskBand, string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  critical: 'Critical',
};

const BAND_COLOR: Record<RiskBand, string> = {
  low: '#4ade80',
  moderate: '#60a5fa',
  high: '#fbbf24',
  critical: '#f87171',
};

function polygon(ctx: Ctx, pts: Array<[number, number]>) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
}

/** Draw the 1200x630 share card. Pure drawing: no DOM, no fonts to load, nothing fetched. */
export function drawShareCard(ctx: Ctx, answers: Answers, siteHost = 'freetextfromimage.com') {
  const score = score100(answers);
  const band = bandOf(score);
  const axes = axisValues(answers);
  const risk = biggestRisk(answers);
  const sans = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

  ctx.fillStyle = '#0b1020';
  ctx.fillRect(0, 0, SHARE_WIDTH, SHARE_HEIGHT);
  ctx.fillStyle = BAND_COLOR[band];
  ctx.fillRect(0, 0, 12, SHARE_HEIGHT);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#9aa4bf';
  ctx.font = `600 28px ${sans}`;
  ctx.fillText('Verification Debt Score', 64, 92);

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 200px ${sans}`;
  ctx.fillText(String(score), 56, 300);
  ctx.fillStyle = '#9aa4bf';
  ctx.font = `600 44px ${sans}`;
  ctx.fillText('/ 100', 64 + String(score).length * 112 + 8, 300);

  ctx.fillStyle = BAND_COLOR[band];
  ctx.font = `700 52px ${sans}`;
  ctx.fillText(`${BAND_LABEL[band]} risk`, 64, 380);

  ctx.fillStyle = '#e5e9f5';
  ctx.font = `500 30px ${sans}`;
  ctx.fillText(risk ? `Biggest gap: ${risk.label}` : 'No gaps found', 64, 440);

  ctx.fillStyle = '#9aa4bf';
  ctx.font = `500 26px ${sans}`;
  ctx.fillText('How well do you verify AI-generated UI?', 64, 540);
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 30px ${sans}`;
  ctx.fillText(`${siteHost}/verify-debt-score`, 64, 580);

  // Radar
  const cx = 880, cy = 330, r = 190, n = axes.length;
  const at = (i: number, f: number): [number, number] => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(a) * r * f, cy + Math.sin(a) * r * f];
  };
  ctx.strokeStyle = '#9aa4bf';
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.35;
  for (const f of [0.25, 0.5, 0.75, 1]) {
    polygon(ctx, axes.map((_, i) => at(i, f)));
    ctx.stroke();
  }
  axes.forEach((_, i) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(...at(i, 1));
    ctx.stroke();
  });
  ctx.globalAlpha = 1;

  polygon(ctx, axes.map((v, i) => at(i, v.value ?? 0)));
  ctx.fillStyle = BAND_COLOR[band];
  ctx.globalAlpha = 0.3;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = BAND_COLOR[band];
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#c9d1e8';
  ctx.font = `500 20px ${sans}`;
  axes.forEach((v, i) => {
    const [x, y] = at(i, 1.16);
    ctx.textAlign = x < cx - 6 ? 'right' : x > cx + 6 ? 'left' : 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(v.label, x, y);
  });
}

/** Render the card to a PNG. Needs a browser (canvas). */
export async function renderShareImage(answers: Answers, siteHost?: string): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = SHARE_WIDTH;
  canvas.height = SHARE_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available in this browser.');
  drawShareCard(ctx, answers, siteHost);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create the image.'))), 'image/png')
  );
}
