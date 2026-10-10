import { describe, expect, it } from 'vitest';
import {
  analyzeWordContrast,
  analyzeWords,
  contrastBetween,
  relativeLuminance,
  type ImageDataLike,
} from './contrast';
import type { BBox, OCRWord } from '../ocr/types';

type Color = [number, number, number];
const hex = (h: string): Color => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

/**
 * Build an image of `bg` with a "word" drawn in `fg`: a row of glyph-like strokes, so about
 * a third of the box is ink. Optionally add anti-aliased pixels (a 50/50 blend) around the strokes.
 */
function makeWordImage(opts: {
  width?: number;
  height?: number;
  fg: Color;
  bg: Color;
  antialias?: boolean;
}): { image: ImageDataLike; bbox: BBox } {
  const { width = 80, height = 20, fg, bg, antialias = false } = opts;
  const data = new Uint8ClampedArray(width * height * 4);
  const blend = fg.map((c, i) => Math.round((c + bg[i]) / 2)) as Color;
  const put = (x: number, y: number, c: Color) => {
    const i = (y * width + x) * 4;
    data[i] = c[0];
    data[i + 1] = c[1];
    data[i + 2] = c[2];
    data[i + 3] = 255;
  };
  const isStroke = (x: number, y: number) => x % 6 < 2 && y >= 3 && y < height - 3;
  const isEdge = (x: number, y: number) => x % 6 === 2 && y >= 3 && y < height - 3;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      put(x, y, isStroke(x, y) ? fg : antialias && isEdge(x, y) ? blend : bg);
    }
  }
  return { image: { data, width, height }, bbox: { x0: 0, y0: 0, x1: width, y1: height } };
}

describe('relativeLuminance / contrastBetween (WCAG 2.1)', () => {
  it('has luminance 0 for black and 1 for white', () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 10);
  });

  it('weights the channels 0.2126 / 0.7152 / 0.0722 on linear values', () => {
    expect(relativeLuminance({ r: 255, g: 0, b: 0 })).toBeCloseTo(0.2126, 4);
    expect(relativeLuminance({ r: 0, g: 255, b: 0 })).toBeCloseTo(0.7152, 4);
    expect(relativeLuminance({ r: 0, g: 0, b: 255 })).toBeCloseTo(0.0722, 4);
  });

  it('matches known WCAG ratios', () => {
    const c = (a: string, b: string) => {
      const [r1, g1, b1] = hex(a);
      const [r2, g2, b2] = hex(b);
      return contrastBetween({ r: r1, g: g1, b: b1 }, { r: r2, g: g2, b: b2 });
    };
    expect(c('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(c('#767676', '#ffffff')).toBeCloseTo(4.54, 2); // the classic AA boundary grey
    expect(c('#ffffff', '#ffffff')).toBe(1);
    // order does not matter
    expect(c('#ffffff', '#000000')).toBeCloseTo(21, 5);
  });
});

describe('analyzeWordContrast', () => {
  it('(a) passes black-on-white text at about 21:1', () => {
    const { image, bbox } = makeWordImage({ fg: [0, 0, 0], bg: [255, 255, 255] });
    const r = analyzeWordContrast(image, bbox);
    expect(r.ratio).toBeCloseTo(21, 1);
    expect(r.passes).toBe(true);
    expect(r.flag).toBeUndefined();
    expect(r.textColor).toEqual({ r: 0, g: 0, b: 0 });
    expect(r.backgroundColor).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('still reads black-on-white as about 21:1 when edges are anti-aliased', () => {
    const { image, bbox } = makeWordImage({ fg: [0, 0, 0], bg: [255, 255, 255], antialias: true });
    const r = analyzeWordContrast(image, bbox);
    expect(r.ratio).toBeGreaterThan(15);
    expect(r.passes).toBe(true);
  });

  it('finds light text on a dark background (text is the minority colour)', () => {
    const { image, bbox } = makeWordImage({ fg: [255, 255, 255], bg: [20, 20, 30] });
    const r = analyzeWordContrast(image, bbox);
    expect(r.textColor).toEqual({ r: 255, g: 255, b: 255 });
    expect(r.backgroundColor).toEqual({ r: 20, g: 20, b: 30 });
    expect(r.passes).toBe(true);
  });

  it('(b) flags white text on #FEFEFE as INSUFFICIENT_CONTRAST even though OCR read it', () => {
    const { image, bbox } = makeWordImage({ fg: hex('#ffffff'), bg: hex('#fefefe') });
    // What the OCR engine reports for this image: the word, with high confidence.
    const ocrWord: OCRWord = { text: 'Total:', bbox, confidence: 97 };
    expect(ocrWord.confidence).toBeGreaterThan(90);

    const [{ contrast }] = analyzeWords(image, [ocrWord]);
    expect(contrast.ratio).toBeLessThan(1.05);
    expect(contrast.passes).toBe(false);
    expect(contrast.flag).toBe('INSUFFICIENT_CONTRAST');
  });

  it('flags a flat colour as 1:1', () => {
    const { image, bbox } = makeWordImage({ fg: [200, 200, 200], bg: [200, 200, 200] });
    const r = analyzeWordContrast(image, bbox);
    expect(r.ratio).toBe(1);
    expect(r.flag).toBe('INSUFFICIENT_CONTRAST');
  });

  it('applies 4.5:1 to normal text and 3:1 to large text', () => {
    // #949494 on white is 3.03:1: fails normal text, passes large text.
    const fg = hex('#949494');
    const bg = hex('#ffffff');
    const small = makeWordImage({ fg, bg, height: 16 });
    const large = makeWordImage({ fg, bg, height: 32 });

    const rs = analyzeWordContrast(small.image, small.bbox);
    expect(rs.isLargeText).toBe(false);
    expect(rs.threshold).toBe(4.5);
    expect(rs.ratio).toBeCloseTo(3.03, 1);
    expect(rs.flag).toBe('INSUFFICIENT_CONTRAST');

    const rl = analyzeWordContrast(large.image, large.bbox);
    expect(rl.isLargeText).toBe(true);
    expect(rl.threshold).toBe(3);
    expect(rl.passes).toBe(true);
  });

  it('lets the caller force the text size, and accounts for pixelScale', () => {
    const fg = hex('#949494');
    const bg = hex('#ffffff');
    const { image, bbox } = makeWordImage({ fg, bg, height: 32 });
    expect(analyzeWordContrast(image, bbox, { largeText: false }).passes).toBe(false);
    // 32 image px at 2x is 16 CSS px: normal text.
    expect(analyzeWordContrast(image, bbox, { pixelScale: 2 }).isLargeText).toBe(false);
  });

  it('clamps boxes to the image and reports NO_SAMPLE for an empty box', () => {
    const { image } = makeWordImage({ fg: [0, 0, 0], bg: [255, 255, 255] });
    const outside = analyzeWordContrast(image, { x0: 500, y0: 500, x1: 600, y1: 520 });
    expect(outside.flag).toBe('NO_SAMPLE');
    expect(outside.passes).toBe(false);
    expect(Number.isNaN(outside.ratio)).toBe(true);

    const overhang = analyzeWordContrast(image, { x0: -10, y0: -10, x1: 1000, y1: 1000 });
    expect(overhang.ratio).toBeCloseTo(21, 1);
  });

  it('samples only inside the box', () => {
    // Left half black-on-white, right half low contrast. Each box gets its own answer.
    const w = 80;
    const h = 20;
    const left = makeWordImage({ width: w, height: h, fg: [0, 0, 0], bg: [255, 255, 255] });
    const right = makeWordImage({ width: w, height: h, fg: hex('#ffffff'), bg: hex('#fefefe') });
    const data = new Uint8ClampedArray(w * 2 * h * 4);
    for (let y = 0; y < h; y++) {
      data.set(left.image.data.slice(y * w * 4, (y + 1) * w * 4), y * w * 2 * 4);
      data.set(right.image.data.slice(y * w * 4, (y + 1) * w * 4), (y * w * 2 + w) * 4);
    }
    const image = { data, width: w * 2, height: h };
    const results = analyzeWords(image, [
      { bbox: { x0: 0, y0: 0, x1: w, y1: h } },
      { bbox: { x0: w, y0: 0, x1: w * 2, y1: h } },
    ]);
    expect(results[0].contrast.passes).toBe(true);
    expect(results[1].contrast.flag).toBe('INSUFFICIENT_CONTRAST');
  });
});
