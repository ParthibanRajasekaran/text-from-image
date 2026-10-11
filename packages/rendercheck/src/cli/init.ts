/**
 * `rendercheck init`: teach the AI coding agents in a repo to use RenderCheck. Writes a short
 * instruction block and the MCP server entry for each agent. Idempotent: re-running updates our
 * block in place, never touches anything outside it, and never overwrites invalid JSON.
 */
import fs from 'node:fs';
import path from 'node:path';

export type Agent = 'claude' | 'agents' | 'cursor' | 'copilot';
export const ALL_AGENTS: Agent[] = ['claude', 'agents', 'cursor', 'copilot'];

export type InitAction = 'created' | 'updated' | 'unchanged' | 'skipped';
export interface InitResult {
  file: string;
  action: InitAction;
  note?: string;
}

const START = '<!-- rendercheck:start -->';
const END = '<!-- rendercheck:end -->';

export const INSTRUCTIONS = `## Verifying what the user sees (RenderCheck)

After you change UI, the DOM and the unit tests do not prove the user can read the result. Check the pixels:

1. Take a screenshot of the page or component (for example with Playwright).
2. Call the \`verify_text\` tool of the \`rendercheck\` MCP server with the screenshot path and the text that should be visible. Add \`min_contrast_ratio: 4.5\` when legibility matters.
3. If it fails, read \`failure\` (NOT_FOUND, LOW_CONFIDENCE, INSUFFICIENT_CONTRAST), \`read\` (what was actually on screen) and \`box\` (where), fix the UI, and check again.

Use \`read_text\` to see what rendered when you do not know what to expect. No MCP? Run \`npx @rendercheck/sdk verify <image> --expect "<text>" --json\` (exit 0 pass, 1 fail, 2 error).
It runs locally and offline; screenshots never leave the machine.`;

const block = (body: string) => `${START}\n${body}\n${END}`;

function withBlock(existing: string | undefined, body: string): string {
  const b = block(body);
  if (existing === undefined) return b + '\n';
  const s = existing.indexOf(START);
  const e = existing.indexOf(END);
  if (s !== -1 && e > s) return existing.slice(0, s) + b + existing.slice(e + END.length);
  return existing.replace(/\s*$/, '') + (existing.trim() ? '\n\n' : '') + b + '\n';
}

export interface InitOptions {
  dir: string;
  agents?: Agent[];
  dryRun?: boolean;
}

function writeText(file: string, next: string, prev: string | undefined, dry: boolean): InitResult {
  if (prev === next) return { file, action: 'unchanged' };
  if (!dry) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, next);
  }
  return { file, action: prev === undefined ? 'created' : 'updated' };
}

function markdown(file: string, dry: boolean): InitResult {
  const prev = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : undefined;
  return writeText(file, withBlock(prev, INSTRUCTIONS), prev, dry);
}

const SERVER = { command: 'npx', args: ['-y', '@rendercheck/sdk', 'mcp'] };

function mcpJson(file: string, key: 'mcpServers' | 'servers', entry: object, dry: boolean): InitResult {
  let root: Record<string, unknown> = {};
  const prev = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : undefined;
  if (prev !== undefined && prev.trim()) {
    try {
      root = JSON.parse(prev);
      if (!root || typeof root !== 'object' || Array.isArray(root)) throw new Error('not an object');
    } catch {
      return { file, action: 'skipped', note: 'existing file is not valid JSON (comments?); add the "rendercheck" server by hand' };
    }
  }
  const servers = { ...((root[key] as Record<string, unknown>) ?? {}), rendercheck: entry };
  const next = JSON.stringify({ ...root, [key]: servers }, null, 2) + '\n';
  return writeText(file, next, prev, dry);
}

function cursorRule(file: string, dry: boolean): InitResult {
  const prev = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : undefined;
  const next = `---\ndescription: Verify UI changes by checking what is visible in a screenshot (RenderCheck)\nalwaysApply: false\n---\n\n${INSTRUCTIONS}\n`;
  return writeText(file, next, prev, dry);
}

export function runInit({ dir, agents = ALL_AGENTS, dryRun = false }: InitOptions): InitResult[] {
  const p = (...s: string[]) => path.join(dir, ...s);
  const out: InitResult[] = [];
  for (const a of agents) {
    if (a === 'claude') out.push(markdown(p('CLAUDE.md'), dryRun), mcpJson(p('.mcp.json'), 'mcpServers', SERVER, dryRun));
    if (a === 'agents') out.push(markdown(p('AGENTS.md'), dryRun));
    if (a === 'cursor') out.push(cursorRule(p('.cursor', 'rules', 'rendercheck.mdc'), dryRun), mcpJson(p('.cursor', 'mcp.json'), 'mcpServers', SERVER, dryRun));
    if (a === 'copilot')
      out.push(markdown(p('.github', 'copilot-instructions.md'), dryRun), mcpJson(p('.vscode', 'mcp.json'), 'servers', { type: 'stdio', ...SERVER }, dryRun));
  }
  return out;
}
