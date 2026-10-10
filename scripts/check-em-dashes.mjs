#!/usr/bin/env node
/**
 * Fails when visible site copy contains an em dash (U+2014).
 * Scans the page, component and SEO sources plus the README.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const DASH = String.fromCharCode(0x2014);
const targets = ['pages', 'components', 'src/seo.tsx', 'README.md'];
const skip = /(_STRUCTURE\.md|\.spec\.tsx?$)/;
const hits = [];

function walk(p) {
  const full = path.join(root, p);
  if (!fs.existsSync(full)) return;
  if (fs.statSync(full).isDirectory()) {
    for (const f of fs.readdirSync(full)) walk(path.join(p, f));
  } else if (/\.(tsx?|md)$/.test(p) && !skip.test(p)) {
    fs.readFileSync(full, 'utf8').split('\n').forEach((line, i) => {
      if (line.includes(DASH)) hits.push(`${p}:${i + 1}`);
    });
  }
}

targets.forEach(walk);
if (hits.length) {
  console.error(`Em dash found in ${hits.length} place(s):\n  ${hits.join('\n  ')}`);
  process.exit(1);
}
console.log('No em dashes in site copy.');
