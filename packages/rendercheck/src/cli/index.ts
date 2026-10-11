#!/usr/bin/env node
import { parseArgs } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import { loadImage, runRead, runVerify } from './run';
import { logUsage, readUsage, summarize, usageFile } from './usage';
import { shutdown } from '../core/ocr';
import type { Region } from '../core/types';

const HELP = `rendercheck: check what a user can actually see in a screenshot. Local OCR, offline.

Usage
  rendercheck verify <image> --expect "Total: $14.00" [options]
  rendercheck read <image> [options]
  rendercheck mcp                     start the MCP server (stdio) for AI agents
  rendercheck stats                   usage on this machine (local file, never sent anywhere)

Options
  --expect <text>          text that must be visible (verify)
  --ignore-case            match upper/lower case loosely
  --exact                  region text must equal the expected text
  --min-confidence <0-100> OCR confidence required (default 80)
  --min-contrast <ratio>   WCAG contrast required, e.g. 4.5
  --region <x,y,w,h>       only look at this part of the image
  --json                   machine-readable output

Exit codes: 0 pass, 1 assertion failed, 2 error (bad input, unreadable image)
Docs: https://getrendercheck.com/rendercheck`;

function version(): string {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8')).version as string;
  } catch {
    return '0.0.0';
  }
}

function parseRegion(s?: string): Region | undefined {
  if (!s) return undefined;
  const n = s.split(',').map(Number);
  if (n.length !== 4 || n.some((x) => !Number.isFinite(x))) throw new Error('--region must be x,y,width,height (four numbers)');
  return { x: n[0], y: n[1], width: n[2], height: n[3] };
}

async function main(argv: string[]): Promise<number> {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      expect: { type: 'string' },
      'ignore-case': { type: 'boolean' },
      exact: { type: 'boolean' },
      'min-confidence': { type: 'string' },
      'min-contrast': { type: 'string' },
      region: { type: 'string' },
      json: { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
    },
  });
  const [cmd, file] = positionals;
  if (values.version) return console.log(version()), 0;
  if (values.help || !cmd) return console.log(HELP), cmd || values.help ? 0 : 2;

  if (cmd === 'mcp') {
    const { startStdio } = await import('../mcp/server');
    await startStdio(version());
    return -1; // keep running until the client disconnects
  }

  if (cmd === 'stats') {
    const s = summarize(readUsage());
    if (values.json) console.log(JSON.stringify({ file: usageFile(), ...s }, null, 2));
    else {
      console.log(`Usage on this machine (${usageFile()}). Never sent anywhere.`);
      console.log(`  runs: ${s.total}  passed: ${s.passed}  failed: ${s.failed}`);
      console.log(`  by surface: ${JSON.stringify(s.bySurface)}  by tool: ${JSON.stringify(s.byTool)}`);
    }
    return 0;
  }

  if (cmd !== 'verify' && cmd !== 'read') throw new Error(`Unknown command "${cmd}". Run rendercheck --help`);
  if (!file) throw new Error(`Usage: rendercheck ${cmd} <image>`);

  const options = {
    ignoreCase: values['ignore-case'],
    exact: values.exact,
    minConfidence: values['min-confidence'] !== undefined ? Number(values['min-confidence']) : undefined,
    minContrastRatio: values['min-contrast'] !== undefined ? Number(values['min-contrast']) : undefined,
    region: parseRegion(values.region),
  };
  const image = loadImage({ path: file });
  const t0 = Date.now();

  if (cmd === 'read') {
    const r = await runRead(image, options);
    logUsage({ surface: 'cli', tool: 'read_text', ms: Date.now() - t0 });
    console.log(values.json ? JSON.stringify(r, null, 2) : r.text);
    return 0;
  }

  if (!values.expect) throw new Error('verify needs --expect "<text>"');
  const r = await runVerify(image, values.expect, options);
  logUsage({ surface: 'cli', tool: 'verify_text', pass: r.pass, failure: r.failure, ms: Date.now() - t0 });
  if (values.json) console.log(JSON.stringify(r, null, 2));
  else console.log(r.pass ? `PASS  "${r.expected}" is visible (confidence ${r.confidence}%)` : `FAIL  ${r.message}`);
  return r.pass ? 0 : 1;
}

main(process.argv.slice(2)).then(
  async (code) => {
    if (code === -1) return;
    await shutdown();
    process.exit(code);
  },
  async (e) => {
    console.error(`rendercheck: ${(e as Error).message}`);
    await shutdown().catch(() => {});
    process.exit(2);
  }
);
