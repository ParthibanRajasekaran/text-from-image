import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runInit } from '../src/cli/init';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'rc-init-'));
const read = (d: string, f: string) => fs.readFileSync(path.join(d, f), 'utf8');

describe('rendercheck init', () => {
  it('creates instructions and MCP config for every agent', () => {
    const d = tmp();
    const res = runInit({ dir: d });
    expect(res.every((r) => r.action === 'created')).toBe(true);
    expect(read(d, 'CLAUDE.md')).toContain('verify_text');
    expect(read(d, 'AGENTS.md')).toContain('<!-- rendercheck:start -->');
    expect(read(d, '.cursor/rules/rendercheck.mdc')).toMatch(/^---\n/);
    expect(JSON.parse(read(d, '.mcp.json')).mcpServers.rendercheck.args).toEqual(['-y', '@rendercheck/sdk', 'mcp']);
    expect(JSON.parse(read(d, '.vscode/mcp.json')).servers.rendercheck.type).toBe('stdio');
  });

  it('is idempotent', () => {
    const d = tmp();
    runInit({ dir: d });
    expect(runInit({ dir: d }).every((r) => r.action === 'unchanged')).toBe(true);
  });

  it('keeps existing content and other MCP servers', () => {
    const d = tmp();
    fs.writeFileSync(path.join(d, 'CLAUDE.md'), '# Rules\n\nBe kind.\n');
    fs.writeFileSync(path.join(d, '.mcp.json'), JSON.stringify({ mcpServers: { other: { command: 'x' } }, extra: 1 }));
    runInit({ dir: d, agents: ['claude'] });
    runInit({ dir: d, agents: ['claude'] });
    const md = read(d, 'CLAUDE.md');
    expect(md.startsWith('# Rules\n\nBe kind.')).toBe(true);
    expect(md.match(/rendercheck:start/g)).toHaveLength(1);
    const j = JSON.parse(read(d, '.mcp.json'));
    expect(Object.keys(j.mcpServers).sort()).toEqual(['other', 'rendercheck']);
    expect(j.extra).toBe(1);
  });

  it('never overwrites JSON it cannot parse', () => {
    const d = tmp();
    fs.writeFileSync(path.join(d, '.mcp.json'), '{ // comment\n}');
    const r = runInit({ dir: d, agents: ['claude'] }).find((x) => x.file.endsWith('.mcp.json'));
    expect(r?.action).toBe('skipped');
    expect(read(d, '.mcp.json')).toBe('{ // comment\n}');
  });

  it('dry run writes nothing', () => {
    const d = tmp();
    runInit({ dir: d, dryRun: true });
    expect(fs.readdirSync(d)).toEqual([]);
  });
});
