import { test, expect, type Page } from '@playwright/test';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

/**
 * Quality gates from the PRD (C5, C6), run against the production build:
 *   - axe-core: no serious or critical accessibility violations on any public route
 *   - at 390px wide: no horizontal scroll, and every control is at least 44x44 CSS px
 *     (inline links inside running text are exempt, as in WCAG 2.5.8)
 */

const ROUTES = [
  '/',
  '/rendercheck',
  '/developers',
  '/labs',
  '/access',
  '/verify-debt-score',
  '/verify-debt-score#r=012200000', // a finished result: radar, share buttons
  '/ai-ui-bug-gallery',
  '/ocr-challenge-lab',
  '/changelog',
  '/privacy-policy',
  '/terms',
  '/security',
];

const require = createRequire(import.meta.url);
const AXE_SOURCE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

async function runAxe(page: Page) {
  // Contrast is measured on what is painted, so let entrance animations stop changing first.
  await page.evaluate(async () => { const snap = () => [...document.querySelectorAll('[style*="opacity"]')].map((e) => getComputedStyle(e).opacity).join(','); let prev = snap(); for (let i = 0; i < 40; i++) { await new Promise((r) => setTimeout(r, 250)); const cur = snap(); if (cur === prev) return true; prev = cur; } return false; });
  await page.evaluate(AXE_SOURCE);
  return page.evaluate(async () => {
    // @ts-expect-error axe is injected above
    const r = await window.axe.run(document, { resultTypes: ['violations'] });
    return r.violations
      .filter((v: { impact?: string }) => v.impact === 'serious' || v.impact === 'critical')
      .map((v: { id: string; impact: string; help: string; nodes: { target: unknown[] }[] }) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.slice(0, 4).map((n) => String(n.target)),
        count: v.nodes.length,
      }));
  });
}

for (const scheme of ['light', 'dark'] as const) {
test.describe(`accessibility (axe-core, ${scheme})`, () => {
  test.use({ colorScheme: scheme });
  for (const route of ROUTES) {
    test(`${route} has no serious or critical violations`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h1').first()).toBeVisible();
      expect(await runAxe(page)).toEqual([]);
    });
  }
});
}

test.describe('mobile layout at 390px', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  for (const route of ROUTES) {
    test(`${route}: no horizontal scroll, touch targets are 44px`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h1').first()).toBeVisible();

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, 'horizontal overflow in px').toBeLessThanOrEqual(0);

      const small = await page.evaluate(() => {
        const MIN = 44;
        const sel = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="tab"]';
        const out: string[] = [];
        for (const el of Array.from(document.querySelectorAll<HTMLElement>(sel))) {
          const cs = getComputedStyle(el);
          if (cs.visibility === 'hidden' || cs.display === 'none') continue;
          if (el.closest('[aria-hidden="true"]')) continue;
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          // sr-only / skip links that are clipped to 1px
          if (r.width <= 1 || r.height <= 1) continue;
          // an inline link inside a sentence is exempt
          if (el.tagName === 'A' && cs.display === 'inline' && el.closest('p, li, dd, td')) {
            const parent = el.closest('p, li, dd, td') as HTMLElement;
            if ((parent.textContent ?? '').trim().length > (el.textContent ?? '').trim().length + 10) continue;
          }
          // a file input that is visually hidden behind a button
          if (el instanceof HTMLInputElement && el.type === 'file') continue;
          // a checkbox or radio is operated through its label, which is the real target
          if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) {
            const lr = el.closest('label')?.getBoundingClientRect();
            if (lr && lr.width >= MIN && lr.height >= MIN) continue;
          }
          if (r.width < MIN || r.height < MIN) {
            const label = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('href') || '').trim().slice(0, 40);
            out.push(`${el.tagName.toLowerCase()} "${label}" ${Math.round(r.width)}x${Math.round(r.height)}`);
          }
        }
        return out;
      });
      expect(small, 'controls smaller than 44x44').toEqual([]);
    });
  }
});
