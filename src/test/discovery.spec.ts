import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(__dirname, '../..');
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');

describe('machine-readable discovery files', () => {
  const sitemap = read('public/sitemap.xml');
  const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));

  it('llms.txt starts with the product name and a summary', () => {
    const txt = read('public/llms.txt');
    expect(txt.startsWith('# RenderCheck\n')).toBe(true);
    expect(txt).toMatch(/^> .+/m);
  });

  it('every getrendercheck.com link in llms.txt is a page in the sitemap', () => {
    const txt = read('public/llms.txt');
    const links = [...txt.matchAll(/\]\((https:\/\/getrendercheck\.com[^)]*)\)/g)].map((m) => m[1]);
    expect(links.length).toBeGreaterThan(10);
    for (const l of links) expect(sitemapUrls.has(l), `${l} is not in sitemap.xml`).toBe(true);
  });

  it('index.html carries valid RenderCheck JSON-LD and no old brand', () => {
    const html = read('index.html');
    const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    expect(ld).toBeTruthy();
    const data = JSON.parse(ld![1]);
    const types = data['@graph'].map((n: { '@type': string }) => n['@type']);
    expect(types).toEqual(expect.arrayContaining(['WebSite', 'Person', 'SoftwareApplication', 'WebApplication']));
    expect(html).not.toMatch(/Free Text From Image|TextFromImage|freetextfromimage/i);
  });

  it('the default social image is a real PNG', () => {
    const buf = readFileSync(resolve(root, 'public/og/default.png'));
    expect([...buf.subarray(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]);
  });

  it('declares the icon set and every icon file exists with the right type', () => {
    const html = read('index.html');
    for (const href of ['/favicon.svg', '/favicon.ico', '/favicon-32.png', '/apple-touch-icon.png']) {
      expect(html, `index.html should link ${href}`).toContain(`href="${href}"`);
    }
    const png = (p: string) => [...readFileSync(resolve(root, p)).subarray(0, 4)];
    expect(png('public/favicon-32.png')).toEqual([0x89, 0x50, 0x4e, 0x47]);
    expect(png('public/apple-touch-icon.png')).toEqual([0x89, 0x50, 0x4e, 0x47]);
    expect([...readFileSync(resolve(root, 'public/favicon.ico')).subarray(0, 4)]).toEqual([0, 0, 1, 0]);
    expect(read('public/favicon.svg')).toMatch(/^<svg /);
  });
});
