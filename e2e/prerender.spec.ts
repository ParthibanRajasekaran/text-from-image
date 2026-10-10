import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { routesFromRouter } from '../scripts/prerender.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROUTES = routesFromRouter(fs.readFileSync(path.join(here, '..', 'router.tsx'), 'utf8'));
const textOf = (html: string) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ').replace(/\s+/g, ' ');

test.describe('prerendered HTML (what a crawler without JavaScript receives)', () => {
  for (const route of ROUTES) {
    test(`${route} has real content, one h1, and its own title and canonical`, async ({ request }) => {
      const res = await request.get(route);
      expect(res.status()).toBe(200);
      const html = await res.text();

      expect(html.match(/<h1[\s>]/g)?.length, 'exactly one <h1>').toBe(1);
      expect(textOf(html).length, 'visible text').toBeGreaterThan(400);
      expect(html).toMatch(/<title>[^<]{10,}<\/title>/);
      expect(html).toMatch(/<meta name="description" content="[^"]{30,}"/);

      const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
      expect(canonical, 'canonical').toBeTruthy();
      expect(new URL(canonical!).pathname.replace(/\/$/, '') || '/').toBe(route);

      // Nothing from a headless-browser session may leak into the shipped file.
      expect(html).not.toContain('127.0.0.1');
    });
  }

  test('titles are unique across routes', async ({ request }) => {
    const titles = new Map<string, string>();
    for (const route of ROUTES) {
      const html = await (await request.get(route)).text();
      const t = html.match(/<title>([^<]*)<\/title>/)![1];
      expect(titles.get(t), `"${t}" is used by both ${titles.get(t)} and ${route}`).toBeUndefined();
      titles.set(t, route);
    }
  });

  test('the sitemap lists every prerendered route', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    for (const route of ROUTES) {
      expect(xml, route).toContain(`https://freetextfromimage.com${route}</loc>`);
    }
  });

  test('with JavaScript off the page still shows its heading', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/rendercheck');
    await expect(page.locator('main h1')).toBeVisible();
    await context.close();
  });

  test('an unknown URL still gets the app shell, not another page\'s content', async ({ request }) => {
    const html = await (await request.get('/no-such-page-xyz')).text();
    expect(html).toContain('id="root"');
    expect(html).not.toMatch(/<h1[\s>]/);
  });

  test('the app still mounts over the prerendered page', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/rendercheck');
    await expect(page.getByTestId('hero-demo')).toBeVisible();
    expect(errors).toEqual([]);
  });
});
