/**
 * Failure records for CI. When an assertion fails, RenderCheck can write a small JSON file and a
 * copy of the screenshot with the failing text outlined, so a CI job (see the GitHub Action in
 * ./action) can annotate the pull request. Nothing is written unless you ask for it: set
 * `RENDERCHECK_REPORT_DIR`, or run on GitHub Actions, where it defaults to `rendercheck-report`.
 * Everything stays on disk; nothing is sent anywhere.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { PNG } from 'pngjs';
import { decodeImage } from './image';
import type { FailureKind, Region, VerifyReport } from './types';

export const DEFAULT_REPORT_DIR = 'rendercheck-report';

export interface FailureRecord {
  version: 1;
  kind: FailureKind;
  expected: string;
  read: string;
  confidence: number;
  message: string;
  /** Failing text, in screenshot pixels. */
  box?: Region;
  /** Size of the screenshot, so the box can be placed. */
  imageSize: { width: number; height: number };
  /** Test source file (absolute or project-relative path) and 1-based line, when known. */
  file?: string;
  line?: number;
  testTitle?: string;
  /** Screenshot with the failing text outlined, relative to the report directory. */
  image: string;
}

/** Where to write failure records, or undefined when recording is off. */
export function reportDir(env: NodeJS.ProcessEnv = process.env): string | undefined {
  if (env.RENDERCHECK_REPORT_DIR) return env.RENDERCHECK_REPORT_DIR;
  if (env.RENDERCHECK_REPORT_DIR === '') return undefined; // explicitly off
  return env.GITHUB_ACTIONS === 'true' ? DEFAULT_REPORT_DIR : undefined;
}

/** The first stack frame that is test code: not RenderCheck, not node_modules, not Node itself. */
export function callSite(stack: string | undefined): { file: string; line: number } | undefined {
  if (!stack) return undefined;
  for (const raw of stack.split('\n').slice(1)) {
    let frame = raw.trim().replace(/^at\s+/, '');
    const paren = /\((.*)\)$/.exec(frame);
    if (paren) frame = paren[1];
    // Split from the right: "<file>:<line>:<column>". Avoids a backtracking regex on long frames.
    const colSep = frame.lastIndexOf(':');
    const lineSep = colSep > 0 ? frame.lastIndexOf(':', colSep - 1) : -1;
    if (lineSep < 1) continue;
    const lineText = frame.slice(lineSep + 1, colSep);
    const colText = frame.slice(colSep + 1);
    if (!/^\d+$/.test(lineText) || !/^\d+$/.test(colText)) continue;
    let file = frame.slice(0, lineSep);
    if (file.startsWith('file://')) file = decodeURIComponent(new URL(file).pathname);
    if (file.startsWith('node:') || file.includes('node_modules') || file.includes('/rendercheck/dist/')) continue;
    if (/[\\/]packages[\\/]rendercheck[\\/]src[\\/]/.test(file)) continue;
    return { file, line: Number(lineText) };
  }
  return undefined;
}

const RED: [number, number, number] = [255, 40, 40];

/** A PNG copy of the screenshot with a red outline (white halo) around `box`, or around the whole image. */
export function markRegion(image: Uint8Array, box?: Region): Buffer {
  const src = decodeImage(image);
  const png = new PNG({ width: src.width, height: src.height });
  png.data = Buffer.from(src.data.buffer, src.data.byteOffset, src.data.byteLength);

  const pad = box ? 4 : 0;
  const x0 = Math.max(0, Math.floor(box ? box.x - pad : 0));
  const y0 = Math.max(0, Math.floor(box ? box.y - pad : 0));
  const x1 = Math.min(src.width - 1, Math.ceil(box ? box.x + box.width + pad : src.width - 1));
  const y1 = Math.min(src.height - 1, Math.ceil(box ? box.y + box.height + pad : src.height - 1));

  const put = (x: number, y: number, c: readonly [number, number, number]) => {
    if (x < 0 || y < 0 || x >= src.width || y >= src.height) return;
    const i = (y * src.width + x) * 4;
    png.data[i] = c[0];
    png.data[i + 1] = c[1];
    png.data[i + 2] = c[2];
    png.data[i + 3] = 255;
  };
  const frame = (inset: number, c: readonly [number, number, number]) => {
    for (let x = x0 - inset; x <= x1 + inset; x++) {
      put(x, y0 - inset, c);
      put(x, y1 + inset, c);
    }
    for (let y = y0 - inset; y <= y1 + inset; y++) {
      put(x0 - inset, y, c);
      put(x1 + inset, y, c);
    }
  };
  // 2px red line with a 1px white halo on each side, so it reads on light and dark backgrounds.
  frame(-1, [255, 255, 255]);
  frame(0, RED);
  frame(1, RED);
  frame(2, [255, 255, 255]);
  return PNG.sync.write(png);
}

/** A stable name for "this assertion in this test", so a retry replaces the record instead of adding one. */
export function failureKey(parts: { file?: string; line?: number; testTitle?: string; expected: string }): string {
  const raw = [parts.file ?? '', parts.line ?? '', parts.testTitle ?? '', parts.expected].join('\u0000');
  return createHash('sha1').update(raw).digest('hex').slice(0, 16);
}

/** Remove the record for an assertion that has now passed (a retry succeeded). */
export function clearFailure(parts: { file?: string; line?: number; testTitle?: string; expected: string; dir?: string }): void {
  const dir = parts.dir ?? reportDir();
  if (!dir) return;
  const id = failureKey(parts);
  for (const ext of ['json', 'png']) fs.rmSync(path.join(dir, `${id}.${ext}`), { force: true });
}

export interface RecordInput {
  report: VerifyReport;
  image: Uint8Array;
  file?: string;
  line?: number;
  testTitle?: string;
  /** Overrides the environment. */
  dir?: string;
}

/** Write one failure record and its marked screenshot. Returns the JSON path, or undefined when off. */
export function recordFailure(input: RecordInput): string | undefined {
  const dir = input.dir ?? reportDir();
  const { report } = input;
  if (!dir || report.pass || !report.failure) return undefined;

  const id = failureKey({ file: input.file, line: input.line, testTitle: input.testTitle, expected: report.expected });
  fs.mkdirSync(dir, { recursive: true });
  const size = decodeImage(input.image);
  const record: FailureRecord = {
    version: 1,
    kind: report.failure,
    expected: report.expected,
    read: report.read,
    confidence: report.confidence,
    message: report.message,
    box: report.box,
    imageSize: { width: size.width, height: size.height },
    file: input.file,
    line: input.line,
    testTitle: input.testTitle,
    image: `${id}.png`,
  };
  fs.writeFileSync(path.join(dir, record.image), markRegion(input.image, report.box));
  const jsonPath = path.join(dir, `${id}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(record, null, 2));
  return jsonPath;
}
