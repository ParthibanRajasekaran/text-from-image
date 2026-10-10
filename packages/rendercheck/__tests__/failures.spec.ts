import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PNG } from 'pngjs';
import { callSite, clearFailure, markRegion, recordFailure, reportDir, shutdown, verifyText } from '../src/core';

const fx = (n: string) => fs.readFileSync(path.join(__dirname, 'fixtures', `${n}.png`));
afterAll(() => shutdown());

describe('reportDir', () => {
  it('is off by default, on for GitHub Actions, and can be set or switched off', () => {
    expect(reportDir({})).toBeUndefined();
    expect(reportDir({ GITHUB_ACTIONS: 'true' })).toBe('rendercheck-report');
    expect(reportDir({ RENDERCHECK_REPORT_DIR: 'out', GITHUB_ACTIONS: 'true' })).toBe('out');
    expect(reportDir({ RENDERCHECK_REPORT_DIR: '', GITHUB_ACTIONS: 'true' })).toBeUndefined();
  });
});

describe('callSite', () => {
  it('skips RenderCheck, node_modules and Node frames and returns the test file and line', () => {
    const stack = [
      'Error',
      '    at toShowText (/proj/node_modules/@freetextfromimage/rendercheck/dist/playwright/index.js:10:5)',
      '    at node:internal/process/task_queues:95:5',
      '    at /proj/packages/rendercheck/src/playwright/matcher.ts:40:9',
      '    at /proj/tests/checkout.spec.ts:23:7',
    ].join('\n');
    expect(callSite(stack)).toEqual({ file: '/proj/tests/checkout.spec.ts', line: 23 });
  });
  it('understands file:// URLs and named frames', () => {
    expect(callSite('Error\n    at run (file:///proj/tests/a.spec.mjs:5:3)')).toEqual({ file: '/proj/tests/a.spec.mjs', line: 5 });
  });
  it('returns undefined without a stack', () => {
    expect(callSite(undefined)).toBeUndefined();
  });
});

describe('markRegion', () => {
  const px = (png: PNG, x: number, y: number) => {
    const i = (y * png.width + x) * 4;
    return [png.data[i], png.data[i + 1], png.data[i + 2]];
  };
  it('outlines the box in red and leaves the inside alone', () => {
    const src = fx('total-eur');
    const original = PNG.sync.read(src);
    const out = PNG.sync.read(markRegion(src, { x: 20, y: 20, width: 100, height: 30 }));
    expect([out.width, out.height]).toEqual([original.width, original.height]);
    expect(px(out, 16, 40)).toEqual([255, 40, 40]); // left edge, 4px of padding out from x=20
    expect(px(out, 70, 50 + 4)).toEqual([255, 40, 40]); // bottom edge
    expect(px(out, 60, 35)).toEqual(px(original, 60, 35)); // inside untouched
  });
  it('outlines the whole image when there is no box', () => {
    const out = PNG.sync.read(markRegion(fx('empty')));
    expect(px(out, 0, 5)).toEqual([255, 40, 40]);
  });
});

describe('recordFailure', () => {
  let dir: string;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rc-report-'));
  });
  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

  it('writes a JSON record and a marked screenshot for a real failure, with the failing line boxed', async () => {
    const image = fx('total-eur');
    const report = await verifyText({ image, expected: 'Total: $14.00' });
    expect(report.pass).toBe(false);
    expect(report.box).toBeDefined();
    expect(report.box!.width).toBeGreaterThan(20);

    const json = recordFailure({ report, image, file: '/proj/tests/checkout.spec.ts', line: 12, testTitle: 'checkout › total', dir })!;
    const rec = JSON.parse(fs.readFileSync(json, 'utf8'));
    expect(rec).toMatchObject({ version: 1, kind: 'NOT_FOUND', expected: 'Total: $14.00', read: 'Total: €14.00', line: 12, testTitle: 'checkout › total' });
    expect(rec.box).toEqual(report.box);
    const png = PNG.sync.read(fs.readFileSync(path.join(dir, rec.image)));
    expect(png.width).toBe(rec.imageSize.width);
  }, 60_000);

  it('writes nothing for a pass, and a retry replaces the earlier record', async () => {
    const image = fx('total-eur');
    const fail = await verifyText({ image, expected: 'Total: $14.00' });
    const pass = await verifyText({ image: fx('total-usd'), expected: 'Total: $14.00' });
    expect(recordFailure({ report: pass, image: fx('total-usd'), dir })).toBeUndefined();

    const where = { file: 'a.spec.ts', line: 3, testTitle: 't' };
    recordFailure({ report: fail, image, ...where, dir });
    recordFailure({ report: fail, image, ...where, dir });
    expect(fs.readdirSync(dir).filter((f) => f.endsWith('.json'))).toHaveLength(1);
    clearFailure({ ...where, expected: 'Total: $14.00', dir });
    expect(fs.readdirSync(dir)).toHaveLength(0);
  }, 60_000);

  it('does nothing when recording is off', async () => {
    const report = await verifyText({ image: fx('total-eur'), expected: 'Total: $14.00' });
    const before = process.env.RENDERCHECK_REPORT_DIR;
    delete process.env.RENDERCHECK_REPORT_DIR;
    delete process.env.GITHUB_ACTIONS;
    try {
      expect(recordFailure({ report, image: fx('total-eur') })).toBeUndefined();
    } finally {
      if (before !== undefined) process.env.RENDERCHECK_REPORT_DIR = before;
    }
  }, 60_000);
});

describe('Cypress task', () => {
  it('records a failing assertion with its spec and title, and clears it when a retry passes', async () => {
    const { verifyTask } = await import('../src/cypress/plugin');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rc-cy-'));
    const before = process.env.RENDERCHECK_REPORT_DIR;
    process.env.RENDERCHECK_REPORT_DIR = dir;
    try {
      const base = { expected: 'Total: $14.00', spec: 'cypress/e2e/checkout.cy.js', testTitle: 'checkout › total' };
      const bad = await verifyTask({ ...base, imageBase64: fx('total-eur').toString('base64') });
      expect(bad.pass).toBe(false);
      const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
      expect(files).toHaveLength(1);
      expect(JSON.parse(fs.readFileSync(path.join(dir, files[0]), 'utf8'))).toMatchObject({ file: base.spec, testTitle: base.testTitle });

      const good = await verifyTask({ ...base, imageBase64: fx('total-usd').toString('base64') });
      expect(good.pass).toBe(true);
      expect(fs.readdirSync(dir)).toHaveLength(0);
    } finally {
      if (before === undefined) delete process.env.RENDERCHECK_REPORT_DIR;
      else process.env.RENDERCHECK_REPORT_DIR = before;
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }, 60_000);
});
