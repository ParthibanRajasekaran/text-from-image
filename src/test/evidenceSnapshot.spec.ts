import { describe, it, expect } from 'vitest';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// @ts-expect-error plain ESM script without types
import { run, splitAuthors } from '../../scripts/evidence-snapshot.mjs';

const json = (body: unknown, ok = true) => ({ ok, status: ok ? 200 : 500, json: async () => body });
const EMD = String.fromCharCode(0x2014);

function makeFetch(over: Record<string, unknown> = {}) {
  const calls: string[] = [];
  const f = async (url: string) => {
    calls.push(url);
    for (const [k, v] of Object.entries(over)) if (url.includes(k)) return v === 'fail' ? json({}, false) : json(v);
    if (url.includes('api.npmjs.org')) return json({ downloads: [{ day: '2026-10-01', downloads: 5 }, { day: '2026-10-02', downloads: 9 }] });
    if (url.includes('registry.npmjs.org')) {
      return json({
        'dist-tags': { latest: '1.0.0' },
        time: { created: 'a', modified: 'b', '1.0.0': '2026-09-01' },
        versions: { '1.0.0': { dist: { attestations: { url: 'https://x/att' } } } },
      });
    }
    if (url.includes('search/issues')) return json({ total_count: 0, items: [] });
    if (url.includes('/contributors')) return json([{ login: 'ParthibanRajasekaran', contributions: 50 }]);
    if (url.includes('/releases') || url.includes('/tags')) return json([]);
    return json({ stargazers_count: 3, forks_count: 1, subscribers_count: 2, created_at: 'c', pushed_at: 'p' });
  };
  return { f, calls };
}
const dir = () => mkdtempSync(join(tmpdir(), 'evid-'));
const now = new Date('2026-10-11T10:00:00Z');

describe('evidence-snapshot', () => {
  it('writes md and json with the honesty box, sources and "None yet"', async () => {
    const { f, calls } = makeFetch();
    const { md, files } = await run({ fetchImpl: f, now, env: {}, outDir: dir() });
    expect(files[0]).toMatch(/2026-10-11\.md$/);
    expect(readFileSync(files[1], 'utf8')).toContain('"generatedAt"');
    expect(md).toContain('## How to read this');
    expect(md).toContain('CI re-installs, mirrors and bots');
    expect(md).toContain('MCP server ships inside @rendercheck/sdk');
    expect(md).toContain('stronger evidence');
    expect(md).toContain('None yet.');
    expect(md).toContain('https://api.npmjs.org/downloads/range/2026-07-14:2026-10-11/@rendercheck/sdk');
    expect(md).toContain('activeTab=dependents');
    expect(md).toContain('provenance attestation: yes');
    expect(md).not.toMatch(/adoption/i);
    expect(md).not.toContain(EMD);
    expect(calls.some((u) => u.includes('registry.npmjs.org'))).toBe(true);
  });

  it('records failures and does not claim "None yet" when the outside fetch fails', async () => {
    const { f } = makeFetch({ 'search/issues': 'fail', 'api.npmjs.org': 'fail' });
    const { md, snap } = await run({ fetchImpl: f, now, env: { GITHUB_TOKEN: 't' }, outDir: dir() });
    expect(snap.failures.length).toBeGreaterThan(0);
    expect(md).toContain('## Failed fetches');
    expect(md).toContain('Not available (fetch failed). Do not read this as "none".');
    expect(md).not.toContain('None yet.\n\n### Bot');
  });

  it('separates owner, outside people and bots; strips em dashes', () => {
    const mk = (login: string, type = 'User', extra = {}) => ({
      user: { login, type }, title: `t${EMD}x`, html_url: 'u', state: 'open', created_at: '2026-10-01T00:00:00Z', ...extra,
    });
    const r = splitAuthors([mk('ParthibanRajasekaran'), mk('alice'), mk('dependabot[bot]', 'Bot', { pull_request: {} })]);
    expect(r.outside.map((x: { login: string }) => x.login)).toEqual(['alice']);
    expect(r.bots[0].kind).toBe('PR');
    expect(r.outside[0].title).not.toContain(EMD);
  });
});
