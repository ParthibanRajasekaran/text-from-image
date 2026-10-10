import { describe, expect, it, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { escapeData, escapeProperty, main, readRecords, repoPath, summaryMarkdown, toAnnotation } from '../action/annotate.mjs';

const rec = {
  version: 1,
  kind: 'NOT_FOUND',
  expected: 'Total: $14.00',
  read: 'Total: €14.00',
  confidence: 93,
  message: 'Expected to find text "[Total: $14.00]" but OCR read "[Total: €14.00]" (Confidence: 93%)',
  box: { x: 20.4, y: 10, width: 120, height: 30 },
  imageSize: { width: 300, height: 100 },
  file: '/work/repo/tests/checkout.spec.ts',
  line: 23,
  testTitle: 'checkout › total',
  image: 'x.png',
};

describe('workflow command escaping', () => {
  it('escapes %, newlines, colons and commas as GitHub requires', () => {
    expect(escapeData('100%\nnext\r')).toBe('100%25%0Anext%0D');
    expect(escapeProperty('a:b,c')).toBe('a%3Ab%2Cc');
  });
});

describe('toAnnotation', () => {
  it('points at the test file and line, relative to the repository, and names the region', () => {
    const a = toAnnotation(rec, '/work/repo');
    expect(a.startsWith('::error file=tests/checkout.spec.ts,line=23,title=RenderCheck%3A text not visible::')).toBe(true);
    expect(a).toContain('OCR read');
    expect(a).toContain('Failing region on screen: x=20, y=10, 120×30 px');
    expect(a.split('\n')).toHaveLength(1); // newlines are escaped
  });
  it('still annotates when the file is unknown', () => {
    const a = toAnnotation({ ...rec, file: undefined, line: undefined }, '/work/repo');
    expect(a.startsWith('::error title=')).toBe(true);
  });
  it('keeps a path outside the workspace as given', () => {
    expect(repoPath('/elsewhere/a.ts', '/work/repo')).toBe('/elsewhere/a.ts');
    expect(repoPath('tests/a.ts', '/work/repo')).toBe('tests/a.ts');
  });
});

describe('summaryMarkdown', () => {
  it('lists failures in a table and links the report', () => {
    const md = summaryMarkdown([rec, { ...rec, expected: 'a|b' }], '/work/repo', 'https://example.com/artifact/1');
    expect(md).toContain('2 failing assertions');
    expect(md).toContain('`tests/checkout.spec.ts:23`');
    expect(md).toContain('`a\\|b`');
    expect(md).toContain('(https://example.com/artifact/1)');
  });
  it('says so when there are no failures', () => {
    expect(summaryMarkdown([], '/w')).toContain('No failing assertions');
  });
});

describe('main', () => {
  const dirs: string[] = [];
  afterEach(() => dirs.splice(0).forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

  it('reads records, ignores junk, caps annotations, and writes summary and output', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rc-act-'));
    dirs.push(dir);
    for (let i = 0; i < 12; i++) fs.writeFileSync(path.join(dir, `${String(i).padStart(2, '0')}.json`), JSON.stringify(rec));
    fs.writeFileSync(path.join(dir, 'bad.json'), '{not json');
    fs.writeFileSync(path.join(dir, 'other.json'), JSON.stringify({ hello: 1 }));
    const summary = path.join(dir, 'summary.md');
    const output = path.join(dir, 'output.txt');
    const lines: string[] = [];
    const n = main(
      { RENDERCHECK_REPORT_DIR: dir, GITHUB_WORKSPACE: '/work/repo', GITHUB_STEP_SUMMARY: summary, GITHUB_OUTPUT: output },
      (l: string) => lines.push(l)
    );
    expect(n).toBe(12);
    expect(lines.filter((l) => l.startsWith('::error'))).toHaveLength(10);
    expect(lines.some((l) => l.startsWith('::notice') && l.includes('2 more'))).toBe(true);
    expect(fs.readFileSync(summary, 'utf8')).toContain('12 failing assertions');
    expect(fs.readFileSync(output, 'utf8')).toBe('failures=12\n');
    expect(readRecords(path.join(dir, 'missing'))).toEqual([]);
  });
});
