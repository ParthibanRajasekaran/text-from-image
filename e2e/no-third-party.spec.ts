import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { routesFromRouter } from '../scripts/prerender.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROUTES = routesFromRouter(fs.readFileSync(path.join(here, '..', 'router.tsx'), 'utf8'));

// C4: the product's claim is that nothing leaves the browser. Ads would break it, so none are allowed.
test.describe('no ads and no third-party requests', () => {
  test('the CSP allows no ad or analytics host', () => {
    const vercel = JSON.parse(fs.readFileSync(path.join(here, '..', 'vercel.json'), 'utf8'));
    const csp: string = JSON.stringify(vercel);
    expect(csp).toContain("script-src 'self' 'wasm-unsafe-eval'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).not.toMatch(/googlesyndication|doubleclick|googletagmanager|google-analytics|adservice/);
  });

  for (const route of ROUTES) {
    test(`${route} requests only its own origin (fonts included) and has no ad markup`, async ({ page, baseURL }) => {
      const foreign: string[] = [];
      page.on('request', (r) => {
        const u = r.url();
        if (!u.startsWith(baseURL!) && !u.startsWith('data:') && !u.startsWith('blob:')) foreign.push(u);
      });
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      expect(foreign, 'third-party requests').toEqual([]);
      expect(await page.locator('ins.adsbygoogle, [aria-label="Advertisement"], script[src*="adsbygoogle"]').count()).toBe(0);
    });
  }
});
