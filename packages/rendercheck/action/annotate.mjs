#!/usr/bin/env node
// RenderCheck GitHub Action: turn failure records into pull request annotations and a job summary.
// No dependencies, no network. Reads the JSON files RenderCheck wrote on failure.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Escape the message part of a workflow command. */
export const escapeData = (s) => String(s).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
/** Escape a property (file, title) of a workflow command. */
export const escapeProperty = (s) => escapeData(s).replace(/:/g, '%3A').replace(/,/g, '%2C');

const TITLES = {
  NOT_FOUND: 'text not visible',
  LOW_CONFIDENCE: 'text hard to read',
  INSUFFICIENT_CONTRAST: 'text has low contrast',
  DOM_MISMATCH: 'DOM and pixels disagree',
};

export function readRecords(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .flatMap((f) => {
      try {
        const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        return r && r.version === 1 && r.kind ? [r] : [];
      } catch {
        return [];
      }
    });
}

/** Path relative to the repository root, with forward slashes, as annotations need. */
export function repoPath(file, workspace) {
  if (!file) return undefined;
  let p = file;
  if (workspace && path.isAbsolute(p)) {
    const rel = path.relative(workspace, p);
    if (!rel.startsWith('..') && !path.isAbsolute(rel)) p = rel;
  }
  return p.split(path.sep).join('/');
}

export const regionText = (box) =>
  box ? `x=${Math.round(box.x)}, y=${Math.round(box.y)}, ${Math.round(box.width)}×${Math.round(box.height)} px` : undefined;

/** One `::error` workflow command per record. */
export function toAnnotation(record, workspace) {
  const file = repoPath(record.file, workspace);
  const props = [];
  if (file) props.push(`file=${escapeProperty(file)}`);
  if (file && record.line) props.push(`line=${record.line}`);
  props.push(`title=${escapeProperty(`RenderCheck: ${TITLES[record.kind] ?? record.kind}`)}`);
  const where = regionText(record.box);
  const lines = [record.message, where ? `Failing region on screen: ${where}` : undefined].filter(Boolean);
  return `::error ${props.join(',')}::${escapeData(lines.join('\n'))}`;
}

const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');

export function summaryMarkdown(records, workspace, artifactUrl) {
  if (!records.length) return '### RenderCheck\n\nNo failing assertions.\n';
  const rows = records.map((r) => {
    const f = repoPath(r.file, workspace);
    const loc = f ? `\`${f}${r.line ? `:${r.line}` : ''}\`` : '';
    return `| ${cell(TITLES[r.kind] ?? r.kind)} | ${cell(r.testTitle ?? '')} | ${loc} | \`${cell(r.expected)}\` | \`${cell(r.read)}\` | ${cell(regionText(r.box) ?? '')} |`;
  });
  return [
    `### RenderCheck: ${records.length} failing assertion${records.length === 1 ? '' : 's'}`,
    '',
    '| Problem | Test | Where | Expected | Read on screen | Failing region |',
    '| --- | --- | --- | --- | --- | --- |',
    ...rows,
    '',
    artifactUrl
      ? `Screenshots with the failing text outlined in red: [download the report](${artifactUrl}).`
      : 'Screenshots with the failing text outlined in red are in the report directory.',
    '',
  ].join('\n');
}

export function main(env = process.env, out = console.log) {
  const dir = env.RENDERCHECK_REPORT_DIR || 'rendercheck-report';
  const records = readRecords(dir);
  const max = Number(env.RENDERCHECK_MAX_ANNOTATIONS || 10); // GitHub shows at most 10 per step
  for (const r of records.slice(0, max)) out(toAnnotation(r, env.GITHUB_WORKSPACE));
  if (records.length > max) out(`::notice title=RenderCheck::${records.length - max} more failure(s) are in the job summary.`);
  if (env.GITHUB_STEP_SUMMARY) fs.appendFileSync(env.GITHUB_STEP_SUMMARY, summaryMarkdown(records, env.GITHUB_WORKSPACE, env.RENDERCHECK_ARTIFACT_URL));
  if (env.GITHUB_OUTPUT) fs.appendFileSync(env.GITHUB_OUTPUT, `failures=${records.length}\n`);
  return records.length;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
