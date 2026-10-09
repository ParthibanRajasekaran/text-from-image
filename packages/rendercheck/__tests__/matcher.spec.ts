import { afterAll, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { toShowText } from '../src/playwright/matcher';
import { shutdown } from '../src/core';

const fx = (n: string) => fs.readFileSync(path.join(__dirname, 'fixtures', `${n}.png`));
afterAll(() => shutdown());

const fakePage = (...shots: Buffer[]) => {
  let i = 0;
  return {
    goto: () => undefined,
    screenshot: vi.fn(async () => shots[Math.min(i++, shots.length - 1)]),
  };
};
const fakeLocator = (shot: Buffer, text: string) => ({
  screenshot: vi.fn(async () => shot),
  innerText: vi.fn(async () => text),
});
const run = (received: unknown, expected: string, options = {}, isNot = false) =>
  toShowText.call({ isNot }, received as never, expected, { timeout: 0, ...options });

describe('toShowText', () => {
  it('passes for a page whose screenshot shows the text', async () => {
    const page = fakePage(fx('total-usd'));
    const r = await run(page, 'Total: $14.00');
    expect(r.pass).toBe(true);
    expect(r.name).toBe('toShowText');
    expect(page.screenshot).toHaveBeenCalledWith(expect.objectContaining({ scale: 'css' }));
  }, 60_000);

  it('fails with the structured message', async () => {
    const r = await run(fakePage(fx('total-eur')), 'Total: $14.00');
    expect(r.pass).toBe(false);
    expect(r.message()).toMatch(
      /Expected to find text "\[Total: \$14\.00\]" but OCR read "\[Total: €14\.00\]" \(Confidence: \d+%\)/
    );
    expect(r.actual).toBe('Total: €14.00');
  }, 60_000);

  it('supports .not', async () => {
    const absent = await run(fakePage(fx('total-eur')), 'Total: $14.00', {}, true);
    expect(absent.pass).toBe(false); // not found, which is what .not wants
    const present = await run(fakePage(fx('total-usd')), 'Total: $14.00', {}, true);
    expect(present.pass).toBe(true);
    expect(present.message()).toContain('Expected NOT to find text "[Total: $14.00]"');
  }, 60_000);

  it('retries until the screen shows the text', async () => {
    const page = fakePage(fx('empty'), fx('total-eur'), fx('total-usd'));
    const r = await run(page, 'Total: $14.00', { timeout: 20_000, interval: 10 });
    expect(r.pass).toBe(true);
    expect(page.screenshot).toHaveBeenCalledTimes(3);
  }, 90_000);

  it('gives up after the timeout and reports the last attempt', async () => {
    const page = fakePage(fx('total-eur'));
    const t0 = Date.now();
    const r = await run(page, 'Total: $14.00', { timeout: 600, interval: 50 });
    expect(r.pass).toBe(false);
    expect(Date.now() - t0).toBeGreaterThanOrEqual(600);
    expect(page.screenshot.mock.calls.length).toBeGreaterThan(1);
  }, 60_000);

  it('for a locator, compares the DOM text with the pixels', async () => {
    const ok = await run(fakeLocator(fx('total-usd'), 'Total: $14.00'), 'Total: $14.00');
    expect(ok.pass).toBe(true);
    const drift = await run(fakeLocator(fx('total-usd'), 'Total: £14.00'), 'Total: $14.00');
    expect(drift.pass).toBe(false);
    expect(drift.message()).toContain('the DOM text does not contain');
    const off = await run(fakeLocator(fx('total-usd'), 'Total: £14.00'), 'Total: $14.00', { dom: false });
    expect(off.pass).toBe(true);
  }, 90_000);

  it('applies minContrastRatio', async () => {
    const r = await run(fakePage(fx('white-on-fefefe')), 'Total: $14.00', { minContrastRatio: 4.5 });
    expect(r.pass).toBe(false);
    expect(r.message()).toContain('not legible');
  }, 60_000);
});
