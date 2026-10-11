import { afterAll, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { shutdown } from '../src/core';
import { createServer } from '../src/mcp/server';
import { readUsage, summarize } from '../src/cli/usage';
import { loadImage, runVerify } from '../src/cli/run';

const fx = (n: string) => path.join(__dirname, 'fixtures', `${n}.png`);
const usageFile = path.join(os.tmpdir(), `rc-usage-${process.pid}.jsonl`);
process.env.RENDERCHECK_USAGE_FILE = usageFile;

afterAll(async () => {
  await shutdown();
  fs.rmSync(usageFile, { force: true });
});

describe('runVerify', () => {
  it('returns a small, stable result without OCR internals', async () => {
    const r = await runVerify(loadImage({ path: fx('total-eur') }), 'Total: $14.00');
    expect(r.pass).toBe(false);
    expect(r.failure).toBe('NOT_FOUND');
    expect(r.read).toBe('Total: €14.00');
    expect(r.box).toBeDefined();
    expect(r).not.toHaveProperty('ocr');
  }, 60_000);

  it('rejects a missing file with a clear error', () => {
    expect(() => loadImage({ path: '/nope.png' })).toThrow(/Image not found/);
  });
});

describe('MCP server (in-memory transport)', () => {
  async function connect() {
    const [a, b] = InMemoryTransport.createLinkedPair();
    const server = createServer('test');
    await server.connect(a);
    const client = new Client({ name: 'test', version: '1' });
    await client.connect(b);
    return client;
  }

  it('lists verify_text and read_text', async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(['read_text', 'verify_text']);
  });

  it('verify_text passes and fails like the SDK', async () => {
    const client = await connect();
    const call = async (name: string, args: Record<string, unknown>) => {
      const res = (await client.callTool({ name, arguments: args })) as { content: { text: string }[]; isError?: boolean };
      return { body: JSON.parse(res.content[0].text), isError: res.isError };
    };
    const ok = await call('verify_text', { image_path: fx('total-usd'), expected: 'Total: $14.00' });
    expect(ok.body.pass).toBe(true);
    const bad = await call('verify_text', { image_path: fx('total-eur'), expected: 'Total: $14.00' });
    expect(bad.body).toMatchObject({ pass: false, failure: 'NOT_FOUND', read: 'Total: €14.00' });
    const base64 = fs.readFileSync(fx('total-usd')).toString('base64');
    expect((await call('verify_text', { image_base64: base64, expected: 'Total' })).body.pass).toBe(true);
    const read = await call('read_text', { image_path: fx('total-usd') });
    expect(read.body.text).toContain('Total');
    const err = await call('verify_text', { image_path: '/nope.png', expected: 'x' });
    expect(err.isError).toBe(true);
  }, 120_000);

  it('logs usage locally only', () => {
    const s = summarize(readUsage());
    expect(s.bySurface.mcp).toBeGreaterThanOrEqual(4);
    expect(fs.readFileSync(usageFile, 'utf8')).not.toContain('Total'); // never records screenshot text
  });
});

const cli = path.join(__dirname, '..', 'dist', 'cli', 'index.js');
describe.skipIf(!fs.existsSync(cli))('CLI exit codes (needs a build)', () => {
  const run = (...args: string[]) => spawnSync('node', [cli, ...args], { encoding: 'utf8', env: { ...process.env, RENDERCHECK_NO_USAGE_LOG: '1' } });
  it('0 on pass, 1 on failed assertion, 2 on error', () => {
    expect(run('verify', fx('total-usd'), '--expect', 'Total: $14.00').status).toBe(0);
    expect(run('verify', fx('total-eur'), '--expect', 'Total: $14.00', '--json').status).toBe(1);
    expect(run('verify', '/nope.png', '--expect', 'x').status).toBe(2);
  }, 120_000);
});
