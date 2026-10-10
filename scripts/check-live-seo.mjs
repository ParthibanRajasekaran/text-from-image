#!/usr/bin/env node
/**
 * Post-deploy check: fetch every sitemap URL as a crawler would (no JavaScript) and assert the raw
 * HTML has its own title, a self-referencing canonical and an h1. Fails if the SPA shell is served.
 * Usage: node scripts/check-live-seo.mjs https://getrendercheck.com
 */
const origin = (process.argv[2] || 'https://getrendercheck.com').replace(/\/$/, '');
const SHELL_TITLE = 'Free Text From Image - AI-Powered OCR Extractor';

const get = async (url, tries = 5) => {
  for (let i = 0; i < tries; i++) {
    const r = await fetch(url, { headers: { 'user-agent': 'rendercheck-seo-check' }, cache: 'no-store' });
    if (r.ok) return r.text();
    await new Promise((r2) => setTimeout(r2, 3000));
  }
  throw new Error(`GET ${url} failed`);
};

const sitemap = await get(`${origin}/sitemap.xml`);
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!urls.length) throw new Error('sitemap has no URLs');

const problems = [];
for (const u of urls) {
  const html = await get(u);
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const canon = (html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/) || [])[1] || '';
  if (!title || title.startsWith(SHELL_TITLE)) problems.push(`${u}: shell/missing title "${title}"`);
  if (canon.replace(/\/$/, '') !== u.replace(/\/$/, '')) problems.push(`${u}: canonical is "${canon}"`);
  if (!/<h1[\s>]/.test(html)) problems.push(`${u}: no <h1> in raw HTML`);
}
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`OK: ${urls.length} URLs have their own title, canonical and h1 in raw HTML`);
