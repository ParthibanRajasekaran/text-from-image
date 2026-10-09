import { describe, it, expect } from 'vitest';
import { detect, findSpans, ibanValid, luhn, type RedactKind } from './detect';
import { padBox, boxFromDrag, paintRedactions } from './apply';
import type { OCRResult, OCRWord } from '../ocr/types';

const kindsOf = (t: string) => findSpans(t).map((s) => [s.kind, t.slice(s.start, s.end)]);

describe('validators', () => {
  it('luhn accepts real test cards and rejects near misses', () => {
    expect(luhn('4111111111111111')).toBe(true);
    expect(luhn('5500005555555559')).toBe(true);
    expect(luhn('4111111111111112')).toBe(false);
  });
  it('iban checks the mod-97 checksum', () => {
    expect(ibanValid('GB82 WEST 1234 5698 7654 32')).toBe(true);
    expect(ibanValid('GB82 WEST 1234 5698 7654 33')).toBe(false);
  });
});

describe('findSpans', () => {
  it('finds each kind', () => {
    expect(kindsOf('mail jane.doe+x@example.co.uk now')).toEqual([['email', 'jane.doe+x@example.co.uk']]);
    expect(kindsOf('Card 4111 1111 1111 1111 exp')).toEqual([['card', '4111 1111 1111 1111']]);
    expect(kindsOf('Card 4111-1111-1111-1111')).toEqual([['card', '4111-1111-1111-1111']]);
    expect(kindsOf('IBAN GB82 WEST 1234 5698 7654 32')).toEqual([['iban', 'GB82 WEST 1234 5698 7654 32']]);
    expect(kindsOf('SSN 123-45-6789')).toEqual([['id', '123-45-6789']]);
    expect(kindsOf('NI AB 12 34 56 C')).toEqual([['id', 'AB 12 34 56 C']]);
    expect(kindsOf('from 192.168.1.20 ok')).toEqual([['ip', '192.168.1.20']]);
    expect(kindsOf('call +44 7700 900123')).toEqual([['phone', '+44 7700 900123']]);
    expect(kindsOf('key sk-abcdefghijklmnop1234')).toEqual([['secret', 'sk-abcdefghijklmnop1234']]);
    expect(kindsOf('Authorization: Bearer abcdefghijklmnopqrstuv')).toEqual([['secret', 'Bearer abcdefghijklmnopqrstuv']]);
  });
  it('does not flag ordinary numbers, prices or dates', () => {
    expect(findSpans('Total: $1,234.56 on 12/10/2026, order 20481, 3 items')).toEqual([]);
    expect(findSpans('Reference 1234 5678 9012 3456')).toEqual([]); // fails Luhn
    expect(findSpans('released v1.2.3.4 build')).toEqual([]);
  });
  it('finds a card that is followed by an expiry', () => {
    const t = '4111 1111 1111 1111 12';
    expect(kindsOf(t)).toEqual([['card', '4111 1111 1111 1111']]);
  });
  it('does not report one value twice', () => {
    expect(findSpans('jane@example.com')).toHaveLength(1);
  });
  it('respects the enabled kinds', () => {
    const only = new Set<RedactKind>(['email']);
    expect(findSpans('jane@example.com 4111 1111 1111 1111', only).map((s) => s.kind)).toEqual(['email']);
  });
});

const word = (text: string, x0: number, y0: number, x1: number, y1: number): OCRWord => ({ text, bbox: { x0, y0, x1, y1 }, confidence: 95 });

describe('detect', () => {
  it('maps a multi-word match to one box covering its words', () => {
    const words = [word('Card:', 10, 10, 60, 30), word('4111', 70, 10, 110, 30), word('1111', 120, 11, 160, 31), word('1111', 170, 10, 210, 30), word('1111', 220, 10, 262, 30)];
    const result: OCRResult = { text: '', words, lines: [{ text: '', bbox: { x0: 0, y0: 0, x1: 300, y1: 40 }, confidence: 95 }], metrics: { durationMs: 1 } };
    const f = detect(result);
    expect(f).toHaveLength(1);
    expect(f[0].kind).toBe('card');
    expect(f[0].text).toBe('4111 1111 1111 1111');
    expect(f[0].box).toEqual({ x: 70, y: 10, width: 192, height: 21 });
  });
  it('does not join words across lines', () => {
    const words = [word('4111', 10, 10, 50, 30), word('1111', 10, 60, 50, 80), word('1111', 10, 110, 50, 130), word('1111', 10, 160, 50, 180)];
    const lines = words.map((w) => ({ text: w.text, bbox: { x0: 0, y0: w.bbox.y0 - 5, x1: 100, y1: w.bbox.y1 + 5 }, confidence: 95 }));
    expect(detect({ text: '', words, lines, metrics: { durationMs: 1 } })).toEqual([]);
  });
  it('works when OCR returned no lines', () => {
    const words = [word('jane@example.com', 5, 5, 200, 25)];
    expect(detect({ text: '', words, lines: [], metrics: { durationMs: 1 } })).toHaveLength(1);
  });
});

describe('apply', () => {
  it('pads and clamps boxes', () => {
    expect(padBox({ x: 1, y: 1, width: 10, height: 10 }, 3, 100, 100)).toEqual({ x: 0, y: 0, width: 14, height: 14 });
    expect(padBox({ x: 95, y: 95, width: 10, height: 10 }, 3, 100, 100)).toEqual({ x: 92, y: 92, width: 8, height: 8 });
  });
  it('builds a box from a drag in any direction', () => {
    expect(boxFromDrag({ x: 50, y: 40 }, { x: 10, y: 20 }, 100, 100)).toEqual({ x: 10, y: 20, width: 40, height: 20 });
  });
  it('fills every box in black', () => {
    const calls: number[][] = [];
    const ctx = { fillStyle: '', fillRect: (...a: number[]) => void calls.push(a) };
    paintRedactions(ctx, [{ x: 10, y: 10, width: 20, height: 10 }], 100, 100, 2);
    expect(ctx.fillStyle).toBe('#000000');
    expect(calls).toEqual([[8, 8, 24, 14]]);
  });
});
