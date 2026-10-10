#!/usr/bin/env node
/**
 * Fails when site copy makes a claim this repo cannot back: AI/ML features that do not ship,
 * language counts, accuracy percentages, and certification wording. Add a phrase here only after
 * the product really supports it (and a test or benchmark proves it).
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const targets = ['pages', 'components', 'src/seo.tsx', 'README.md', 'index.html'];
const skip = /(_STRUCTURE\.md|\.spec\.tsx?$|\.test\.tsx?$)/;
const banned = [
  [/AI[- ](powered|driven|OCR)/i, 'AI-powered/AI OCR (the OCR is Tesseract, local)'],
  [/\bAI (model|fallback)\b/i, 'AI model/fallback (none ships)'],
  [/vision-language/i, 'vision-language model (none ships)'],
  [/\b100\+? languages\b|over 100 languages/i, 'language count (the tool loads English only)'],
  [/\b\d{2}(-\d{2})?%\+?\s+accura/i, 'accuracy percentage without a published benchmark'],
  [/accura\w*[^.\n]{0,20}\b9\d(-\d{2})?%/i, 'accuracy percentage without a published benchmark'],
  [/\b(SOC ?2|ISO ?27001|HIPAA|GDPR)[- ](compliant|certified)\b/i, 'compliance/certification claim'],
];
const hits = [];
function walk(p) {
  const full = path.join(root, p);
  if (!fs.existsSync(full)) return;
  if (fs.statSync(full).isDirectory()) {
    for (const f of fs.readdirSync(full)) walk(path.join(p, f));
  } else if (/\.(tsx?|md|html)$/.test(p) && !skip.test(p)) {
    fs.readFileSync(full, 'utf8').split('\n').forEach((line, i) => {
      for (const [re, why] of banned) if (re.test(line)) hits.push(`${p}:${i + 1}  ${why}`);
    });
  }
}
targets.forEach(walk);
if (hits.length) {
  console.error(`Unsupported claim(s):\n  ${hits.join('\n  ')}`);
  process.exit(1);
}
console.log('No unsupported claims in site copy.');
