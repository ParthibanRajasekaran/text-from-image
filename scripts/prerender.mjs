#!/usr/bin/env node
/**
 * Prerender every public route into static HTML after `vite build`.
 *
 * Why: the app is a client-side SPA, so dist/index.html is an empty shell. Crawlers that do not run
 * JavaScript, link-preview bots and AI crawlers saw no content. This script renders each route in
 * headless Chromium (what a visitor sees, including the title, description, canonical and JSON-LD that
 * the pages set) and writes it to dist/<route>/index.html. The browser then mounts the app over it.
 *
 *   node scripts/prerender.mjs
 *
 * - The original shell is kept as dist/_shell.html and is the SPA fallback for unknown URLs (vercel.json).
 * - If Chromium cannot start (some build images lack its system libraries) the step is skipped with a
 *   warning and the site still works as a plain SPA. Set PRERENDER_REQUIRED=1 (CI) to make that an error.
 */
/* global process, URL, console */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const required = process.env.PRERENDER_REQUIRED === '1';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.woff2': 'font/woff2', '.wasm': 'application/wasm', '.gz': 'application/gzip',
};

/** Routes come from ROUTES in router.tsx so a new page is prerendered without touching this file. */
export function routesFromRouter(source) {
  const block = source.match(/export const ROUTES = \{([\s\S]*?)\} as const/);
  if (!block) throw new Error('Could not find ROUTES in router.tsx');
  return [...block[1].matchAll(/:\s*'(\/[^']*)'/g)].map((m) => m[1]);
}

/** Make the captured DOM safe to ship: no theme left over from the headless browser. */
export function cleanHtml(html) {
  return html
    .replace(/<html([^>]*?)\sclass="[^"]*\bdark\b[^"]*"/i, '<html$1')
    .replace(/<html([^>]*?)\sdata-theme="[^"]*"/i, '<html$1');
}

export function outFile(route) {
  return route === '/' ? path.join(dist, 'index.html') : path.join(dist, route, 'index.html');
}

function startServer(shell) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    let file = path.normalize(path.join(dist, decodeURIComponent(url.pathname)));
    const ok = file.startsWith(dist) && fs.existsSync(file) && fs.statSync(file).isFile() && file !== path.join(dist, 'index.html');
    if (!ok) file = shell; // same SPA fallback as vercel.json
    res.setHeader('Content-Type', MIME[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function main() {
  if (!fs.existsSync(path.join(dist, 'index.html'))) throw new Error('dist/index.html not found. Run `npm run build` first.');
  const shell = path.join(dist, '_shell.html');
  if (!fs.existsSync(shell)) fs.copyFileSync(path.join(dist, 'index.html'), shell);

  const routes = routesFromRouter(fs.readFileSync(path.join(root, 'router.tsx'), 'utf8'));
  let browser;
  try {
    const { chromium } = await import('@playwright/test');
    browser = await chromium.launch();
  } catch (e) {
    const msg = `Prerender skipped: Chromium is not available (${String(e.message).split('\n')[0]})`;
    if (required) throw new Error(msg);
    console.warn(`⚠ ${msg}. The site will be served as a client-side app.`);
    return;
  }

  const server = await startServer(shell);
  const origin = `http://127.0.0.1:${server.address().port}`;
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'light', reducedMotion: 'reduce', locale: 'en-GB' });
  const failures = [];
  const done = [];
  try {
    for (const route of routes) {
      const page = await context.newPage();
      // Nothing outside the local build may load: no fonts, ads or analytics in the snapshot.
      await page.route('**/*', (r) => (r.request().url().startsWith(origin) ? r.continue() : r.abort()));
      try {
        await page.goto(origin + route, { waitUntil: 'networkidle', timeout: 45_000 });
        await page.waitForSelector('main h1', { timeout: 20_000 });
        await page.waitForFunction(() => !document.querySelector('.animate-spin'), null, { timeout: 20_000 });
        // Entrance animations must have finished, so the snapshot holds final styles, not mid-fade ones.
        // (Some elements stay below full opacity by design, so wait for the values to stop changing.)
        await page.evaluate(async () => { const snap = () => [...document.querySelectorAll('[style*="opacity"]')].map((e) => getComputedStyle(e).opacity).join(','); let prev = snap(); for (let i = 0; i < 40; i++) { await new Promise((r) => setTimeout(r, 250)); const cur = snap(); if (cur === prev) return true; prev = cur; } return false; });
        await page.waitForTimeout(250); // let useEffect-based head tags settle
        const html = cleanHtml(await page.content());
        const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
        const hasH1 = /<h1[\s>]/.test(html);
        if (!hasH1 || !title) throw new Error('rendered page has no <h1> or <title>');
        const file = outFile(route);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, '<!DOCTYPE html>\n' + html.replace(/^<!DOCTYPE html>\s*/i, ''));
        done.push(route);
      } catch (e) {
        failures.push(`${route}: ${String(e.message).split('\n')[0]}`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`✓ Prerendered ${done.length}/${routes.length} routes`);
  if (failures.length) {
    console.warn('⚠ Not prerendered (served as client-side app):\n  ' + failures.join('\n  '));
    if (required) process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
