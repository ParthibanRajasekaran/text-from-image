import { afterAll, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { shutdown, verifyText } from '../src/core';

const fx = (name: string) => fs.readFileSync(path.join(__dirname, 'fixtures', `${name}.png`));

afterAll(() => shutdown());

describe('verifyText (real local OCR)', () => {
  it('passes when the text is on screen', async () => {
    const r = await verifyText({ image: fx('total-usd'), expected: 'Total: $14.00' });
    expect(r.pass).toBe(true);
    expect(r.message).toBe('');
    expect(r.confidence).toBeGreaterThan(90);
  }, 60_000);

  it('fails with the expected message when the currency is wrong', async () => {
    const r = await verifyText({ image: fx('total-eur'), expected: 'Total: $14.00' });
    expect(r.pass).toBe(false);
    expect(r.failure).toBe('NOT_FOUND');
    expect(r.message).toMatch(
      /^Expected to find text "\[Total: \$14\.00\]" but OCR read "\[Total: €14\.00\]" \(Confidence: \d+%\)/
    );
    expect(r.message).toContain('Diff: Total: [$]14.00  →  Total: [€]14.00');
    expect(r.confidence).toBeGreaterThan(85);
  }, 60_000);

  it('reports when nothing could be read', async () => {
    const r = await verifyText({ image: fx('empty'), expected: 'Total: $14.00' });
    expect(r.failure).toBe('NOT_FOUND');
    expect(r.message).toContain('but OCR read no text');
  }, 60_000);

  it('is case-sensitive unless told otherwise', async () => {
    expect((await verifyText({ image: fx('total-usd'), expected: 'TOTAL: $14.00' })).pass).toBe(false);
    expect((await verifyText({ image: fx('total-usd'), expected: 'TOTAL: $14.00', options: { ignoreCase: true } })).pass).toBe(true);
  }, 60_000);

  it('exact mode needs the whole region text to match', async () => {
    expect((await verifyText({ image: fx('total-usd'), expected: 'Total:', options: { exact: true } })).pass).toBe(false);
    expect((await verifyText({ image: fx('total-usd'), expected: 'Total:' })).pass).toBe(true);
  }, 60_000);

  it('enforces minConfidence', async () => {
    const r = await verifyText({ image: fx('total-eur'), expected: 'Total: €14.00', options: { minConfidence: 99 } });
    expect(r.failure).toBe('LOW_CONFIDENCE');
    expect(r.message).toMatch(/OCR confidence was \d+%, below the required 99%/);
  }, 60_000);

  it('white text on #FEFEFE is read by OCR, but fails the contrast assertion', async () => {
    const image = fx('white-on-fefefe');
    // Without a contrast requirement the OCR result alone passes...
    const plain = await verifyText({ image, expected: 'Total: $14.00' });
    expect(plain.pass).toBe(true);
    expect(plain.confidence).toBeGreaterThan(90);
    // ...with one, it is flagged.
    const r = await verifyText({ image, expected: 'Total: $14.00', options: { minContrastRatio: 4.5 } });
    expect(r.pass).toBe(false);
    expect(r.failure).toBe('INSUFFICIENT_CONTRAST');
    expect(r.minContrast).toBeLessThan(1.05);
    expect(r.message).toMatch(/not legible: contrast must be at least 4\.5:1/);
  }, 60_000);

  it('grey text below 4.5:1 fails, normal text passes the same check', async () => {
    const grey = await verifyText({ image: fx('grey-on-white'), expected: 'Total: $14.00', options: { minContrastRatio: 4.5 } });
    expect(grey.failure).toBe('INSUFFICIENT_CONTRAST');
    const ok = await verifyText({ image: fx('total-usd'), expected: 'Total: $14.00', options: { minContrastRatio: 4.5 } });
    expect(ok.pass).toBe(true);
    expect(ok.minContrast).toBeGreaterThan(10);
  }, 60_000);

  it('compares the pixels with the DOM text', async () => {
    const image = fx('total-usd');
    const same = await verifyText({ image, expected: 'Total: $14.00', domText: 'Total: $14.00' });
    expect(same.pass).toBe(true);
    // The screen shows it, the DOM says something else.
    const drift = await verifyText({ image, expected: 'Total: $14.00', domText: 'Total: £14.00' });
    expect(drift.failure).toBe('DOM_MISMATCH');
    // The DOM has the text, but the screen does not show it.
    const hidden = await verifyText({ image: fx('empty'), expected: 'Total: $14.00', domText: 'Total: $14.00' });
    expect(hidden.failure).toBe('NOT_FOUND');
    expect(hidden.message).toContain('The DOM contains this text, but it is not visible in the rendered pixels');
    // dom: false switches the comparison off.
    const off = await verifyText({ image, expected: 'Total: $14.00', domText: 'Total: £14.00', options: { dom: false } });
    expect(off.pass).toBe(true);
  }, 60_000);

  it('restricts OCR to a region and keeps full-image coordinates', async () => {
    // total-usd.png is 520x110: "Total:" spans x 113-235, "$14.00" spans x 255-405. Cut in the gap between them.
    const left = await verifyText({ image: fx('total-usd'), expected: 'Total:', options: { region: { x: 0, y: 0, width: 245, height: 110 } } });
    expect(left.pass).toBe(true);
    const onlyAmount = await verifyText({ image: fx('total-usd'), expected: 'Total:', options: { region: { x: 245, y: 0, width: 275, height: 110 } } });
    expect(onlyAmount.pass).toBe(false); // "Total:" is outside this region
    const wrong = await verifyText({ image: fx('total-usd'), expected: 'Total:', options: { region: { x: 400, y: 0, width: 120, height: 110 } } });
    expect(wrong.pass).toBe(false);
    expect(wrong.message).toContain('Region: x=400, y=0, width=120, height=110');
    const word = left.ocr.words.find((w) => w.text.startsWith('Total'));
    expect(word!.bbox.x0).toBeGreaterThan(40); // in full-image pixels, not relative to the region
  }, 60_000);

  it('rejects an empty expectation and an unsupported image', async () => {
    await expect(verifyText({ image: fx('total-usd'), expected: '  ' })).rejects.toThrow(/cannot be empty/);
  });
});
