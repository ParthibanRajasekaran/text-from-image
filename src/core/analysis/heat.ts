/**
 * Confidence heat: one continuous scale for "how sure was OCR about this word".
 *
 *   <= 50  rose   (#FB7185)  OCR is guessing
 *      80  amber  (#FBBF24)  the "low confidence" line used by the box view
 *   >= 95  green  (#4ADE80)  clean read
 *
 * The same three colours as the box view's pass / low-confidence / fail, so the two views agree.
 */

export const HEAT_STOPS = [
  { at: 50, rgb: [0xfb, 0x71, 0x85] },
  { at: 80, rgb: [0xfb, 0xbf, 0x24] },
  { at: 95, rgb: [0x4a, 0xde, 0x80] },
] as const;

const hex = (n: number) => Math.round(n).toString(16).padStart(2, '0');

/** `#rrggbb` for an OCR confidence of 0-100. Out-of-range and NaN inputs are clamped. */
export function confidenceHeat(confidence: number): string {
  const c = Number.isFinite(confidence) ? Math.min(100, Math.max(0, confidence)) : 0;
  const first = HEAT_STOPS[0];
  const last = HEAT_STOPS[HEAT_STOPS.length - 1];
  let rgb: readonly number[];
  if (c <= first.at) rgb = first.rgb;
  else if (c >= last.at) rgb = last.rgb;
  else {
    let i = 0;
    while (c > HEAT_STOPS[i + 1].at) i++;
    const a = HEAT_STOPS[i];
    const b = HEAT_STOPS[i + 1];
    const t = (c - a.at) / (b.at - a.at);
    rgb = a.rgb.map((v, k) => v + (b.rgb[k] - v) * t);
  }
  return `#${hex(rgb[0])}${hex(rgb[1])}${hex(rgb[2])}`.toUpperCase();
}
