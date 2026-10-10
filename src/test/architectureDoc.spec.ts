import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '../..');
const doc = fs.readFileSync(path.join(root, 'docs/ARCHITECTURE.md'), 'utf8');

describe('docs/ARCHITECTURE.md', () => {
  it('only names files that exist', () => {
    const paths = new Set(
      [...doc.matchAll(/(?:^|[\s`(<>])((?:src|packages|scripts|e2e|docs|\.github)\/[\w./@-]+\.(?:tsx|ts|mjs|json|md|yml)\b)/g)].map((m) => m[1]),
    );
    expect(paths.size).toBeGreaterThan(15);
    const missing = [...paths].filter((p) => !fs.existsSync(path.join(root, p)));
    expect(missing).toEqual([]);
  });

  it('matches the CSP directives it cites', () => {
    const vercel = fs.readFileSync(path.join(root, 'vercel.json'), 'utf8');
    for (const d of ["connect-src 'self'", "script-src 'self' 'wasm-unsafe-eval'", "worker-src 'self' blob:", "frame-ancestors 'none'"]) {
      expect(doc).toContain(d.split(' ')[0]);
      expect(vercel).toContain(d);
    }
  });
});
