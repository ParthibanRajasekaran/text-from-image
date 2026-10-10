/**
 * "Zero external network calls".
 *
 * Normal run: the main thread's network APIs are replaced with ones that throw, then an
 * assertion is run. This catches the SDK's own code, but not code inside the OCR worker thread.
 *
 * `npm run test:offline` runs this file in a Linux network namespace with no network at all
 * (`unshare -rn`), which covers worker threads too. In that mode the test first proves the
 * sandbox really is offline.
 */
import { afterAll, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import path from 'node:path';
import { shutdown, verifyText } from '../src/core';

const image = fs.readFileSync(path.join(__dirname, 'fixtures', 'total-eur.png'));
afterAll(() => shutdown());

describe('no network', () => {
  it('the sandbox is offline when asked to be', async () => {
    if (!process.env.RENDERCHECK_EXPECT_NO_NETWORK) return;
    await expect(fetch('https://example.com', { signal: AbortSignal.timeout(4000) })).rejects.toThrow();
  });

  it('verifying a screenshot makes no network calls and still gives the right answer', async () => {
    const boom = (what: string) => () => {
      throw new Error(`unexpected network call: ${what}`);
    };
    const spies = [
      vi.spyOn(globalThis, 'fetch').mockImplementation(boom('fetch') as never),
      vi.spyOn(http, 'request').mockImplementation(boom('http.request') as never),
      vi.spyOn(https, 'request').mockImplementation(boom('https.request') as never),
      vi.spyOn(net, 'connect').mockImplementation(boom('net.connect') as never),
    ];
    try {
      const r = await verifyText({ image, expected: 'Total: $14.00' });
      expect(r.pass).toBe(false);
      expect(r.message).toContain('Expected to find text "[Total: $14.00]" but OCR read "[Total: €14.00]"');
      for (const s of spies) expect(s).not.toHaveBeenCalled();
    } finally {
      spies.forEach((s) => s.mockRestore());
    }
  }, 60_000);
});
