#!/usr/bin/env node
/**
 * Minimal static server for the e2e tests.
 *
 * It serves ./dist the way Vercel does for this project, using the real vercel.json:
 *   1. a file that exists in dist/ is served as is,
 *   2. anything else is rewritten to /index.html (status 200, like the `/(.*)` rewrite),
 *   3. every matching `headers` rule in vercel.json is applied, including the
 *      Content-Security-Policy. `vite preview` ignores vercel.json, so a test against it
 *      would not exercise the CSP at all.
 *
 * Only the `(.*)` wildcard is supported in `source`, which is all vercel.json uses. Any
 * other pattern throws, so a change to vercel.json cannot be silently ignored.
 */
/* global process, URL, console */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const port = Number(process.env.PORT || 4173);
const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff2': 'font/woff2',
  '.gz': 'application/gzip',
  '.wasm': 'application/wasm',
};

function sourceToRegExp(source) {
  const unsupported = source.replace(/\(\.\*\)/g, '').match(/[()*+?[\]{}|\\]/);
  if (unsupported) throw new Error(`e2e/server.mjs does not support this vercel.json source: ${source}`);
  const escaped = source.split('(.*)').map((part) => part.replace(/[.]/g, '\\.'));
  return new RegExp(`^${escaped.join('.*')}$`);
}

const headerRules = (config.headers || []).map((rule) => ({
  match: sourceToRegExp(rule.source),
  headers: rule.headers,
}));

function resolveFile(pathname) {
  const decoded = decodeURIComponent(pathname);
  const candidate = path.normalize(path.join(dist, decoded));
  if (!candidate.startsWith(dist)) return null; // path traversal
  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  return null;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let file = resolveFile(url.pathname);
  if (!file) file = path.join(dist, 'index.html'); // SPA rewrite, same as vercel.json

  for (const rule of headerRules) {
    if (rule.match.test(url.pathname)) {
      for (const h of rule.headers) res.setHeader(h.key, h.value);
    }
  }
  res.setHeader('Content-Type', MIME[path.extname(file)] || 'application/octet-stream');
  res.statusCode = 200;
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).pipe(res);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`e2e server on http://127.0.0.1:${port} serving ${dist}`);
});
