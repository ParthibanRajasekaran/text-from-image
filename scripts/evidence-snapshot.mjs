#!/usr/bin/env node
/**
 * Evidence snapshot for the RenderCheck repo and @rendercheck/sdk.
 * Run on your own machine: npm run evidence:snapshot   (optional: GITHUB_TOKEN=... for rate limits)
 * Writes docs/evidence/snapshots/YYYY-MM-DD.md and .json. Public, unauthenticated APIs only.
 * Never invents numbers: a failed fetch is recorded as a failure and the run continues.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PKG = '@rendercheck/sdk';
export const REPO = 'ParthibanRajasekaran/text-from-image';
export const OWNER = REPO.split('/')[0];
const DEPENDENTS_URL = 'https://www.npmjs.com/package/@rendercheck/sdk?activeTab=dependents';
const DASH = String.fromCharCode(0x2014);
const DAY = 86400000;

/** Replace em dashes in any text that reaches the output. */
export const clean = (s) => String(s ?? '').split(DASH).join('-');
const cell = (s) => clean(s).replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
const isoDay = (d) => d.toISOString().slice(0, 10);

export const isBot = (u) => !!u && (u.type === 'Bot' || /\[bot\]$/i.test(u.login || ''));

export function summariseDownloads(days) {
  const rows = (days || []).map((d) => ({ day: d.day, downloads: d.downloads }));
  const total = rows.reduce((a, r) => a + r.downloads, 0);
  const last30 = rows.slice(-30).reduce((a, r) => a + r.downloads, 0);
  const peak = rows.reduce((m, r) => (r.downloads > (m?.downloads ?? -1) ? r : m), null);
  return { days: rows.length, total, last30, peak, daily: rows };
}

export function splitAuthors(items, owner = OWNER) {
  const outside = [];
  const bots = [];
  for (const it of items) {
    const login = it.user?.login;
    if (!login || login.toLowerCase() === owner.toLowerCase()) continue;
    const row = {
      kind: it.pull_request ? 'PR' : 'Issue',
      login,
      title: clean(it.title),
      url: it.html_url,
      state: it.pull_request?.merged_at ? 'merged' : it.state,
      date: (it.created_at || '').slice(0, 10),
    };
    (isBot(it.user) ? bots : outside).push(row);
  }
  return { outside, bots };
}

export async function collect({ fetchImpl = globalThis.fetch, now = new Date(), env = process.env } = {}) {
  const sources = [];
  const failures = [];
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'rendercheck-evidence-snapshot' };
  if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;

  async function get(label, url, h = {}) {
    sources.push({ label, url });
    try {
      const res = await fetchImpl(url, { headers: h });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      failures.push({ label, url, error: clean(e.message) });
      return null;
    }
  }

  const end = isoDay(now);
  const start = isoDay(new Date(now.getTime() - 89 * DAY));
  const gh = (p) => `https://api.github.com/repos/${REPO}${p}`;
  const out = { npm: {}, github: {} };

  const dl = await get('npm downloads (last 90 days)', `https://api.npmjs.org/downloads/range/${start}:${end}/${PKG}`);
  out.npm.downloads = dl?.downloads ? { start, end, ...summariseDownloads(dl.downloads) } : null;

  const reg = await get('npm registry packument', `https://registry.npmjs.org/${encodeURIComponent(PKG)}`);
  if (reg) {
    const latest = reg['dist-tags']?.latest ?? null;
    const lv = latest ? reg.versions?.[latest] : null;
    const times = Object.entries(reg.time || {}).filter(([v]) => v !== 'created' && v !== 'modified');
    out.npm.registry = {
      latest,
      versionCount: Object.keys(reg.versions || {}).length,
      created: reg.time?.created ?? null,
      modified: reg.time?.modified ?? null,
      versions: times.map(([version, published]) => ({ version, published })),
      latestHasProvenance: lv ? !!lv.dist?.attestations : null,
      latestProvenanceUrl: lv?.dist?.attestations?.url ?? null,
    };
  } else out.npm.registry = null;

  const repo = await get('GitHub repo', gh(''), headers);
  out.github.repo = repo && {
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    watchers: repo.subscribers_count,
    createdAt: repo.created_at,
    pushedAt: repo.pushed_at,
  };

  const count = async (label, q) => {
    const j = await get(label, `https://api.github.com/search/issues?q=${encodeURIComponent(`repo:${REPO} ${q}`)}&per_page=1`, headers);
    return j && typeof j.total_count === 'number' ? j.total_count : null;
  };
  out.github.counts = {
    openIssues: await count('GitHub open issues', 'type:issue state:open'),
    closedIssues: await count('GitHub closed issues', 'type:issue state:closed'),
    openPRs: await count('GitHub open PRs', 'type:pr state:open'),
    closedPRs: await count('GitHub closed or merged PRs', 'type:pr state:closed'),
  };

  const items = [];
  let ok = true;
  for (let page = 1; page <= 5; page++) {
    const j = await get(
      `GitHub issues and PRs not authored by ${OWNER} (page ${page})`,
      `https://api.github.com/search/issues?q=${encodeURIComponent(`repo:${REPO} -author:${OWNER}`)}&per_page=100&page=${page}`,
      headers,
    );
    if (!j) { ok = false; break; }
    items.push(...(j.items || []));
    if ((j.items || []).length < 100) break;
  }
  out.github.outside = ok ? splitAuthors(items) : null;

  const contribs = await get('GitHub contributors', gh('/contributors?per_page=100'), headers);
  out.github.contributors = Array.isArray(contribs)
    ? contribs.map((c) => ({ login: c.login, contributions: c.contributions, bot: isBot(c), owner: c.login.toLowerCase() === OWNER.toLowerCase() }))
    : null;

  const rel = await get('GitHub releases', gh('/releases?per_page=100'), headers);
  out.github.releases = Array.isArray(rel)
    ? rel.map((r) => ({ tag: r.tag_name, name: clean(r.name || ''), published: (r.published_at || '').slice(0, 10), url: r.html_url }))
    : null;
  const tags = await get('GitHub tags', gh('/tags?per_page=100'), headers);
  out.github.tags = Array.isArray(tags) ? tags.map((t) => t.name) : null;

  return {
    generatedAt: now.toISOString(),
    date: isoDay(now),
    package: PKG,
    repo: REPO,
    authenticated: !!env.GITHUB_TOKEN,
    method:
      'Plain GET requests to the public APIs listed under Sources. No scraping, no estimation. A failed request is recorded under Failed fetches and its figures are left out.',
    sources,
    failures,
    dependentsCheckUrl: DEPENDENTS_URL,
    data: out,
  };
}

const n = (v) => (v === null || v === undefined ? 'not available (fetch failed)' : String(v));

export function renderMarkdown(s) {
  const { npm, github } = s.data;
  const L = [];
  L.push(`# Evidence snapshot ${s.date}`, '');
  L.push(`- Generated: ${s.generatedAt}`);
  L.push(`- Package: ${s.package}`);
  L.push(`- Repository: https://github.com/${s.repo}`);
  L.push(`- GitHub requests authenticated: ${s.authenticated ? 'yes (rate limit only, same public data)' : 'no'}`);
  L.push(`- Method: ${s.method}`, '');
  L.push('## How to read this', '');
  L.push('> - npm download counts include CI re-installs, mirrors and bots. They are not a count of people.');
  L.push('> - MCP use cannot be separated from SDK downloads, because the MCP server ships inside @rendercheck/sdk.');
  L.push('> - Outside issues and PRs, and named users, are the stronger evidence. Treat download counts as context only.');
  L.push('');
  L.push('## Sources', '');
  s.sources.forEach((x) => L.push(`- ${cell(x.label)}: ${x.url}`));
  L.push(`- Dependents (no API, check manually): ${s.dependentsCheckUrl}`, '');
  if (s.failures.length) {
    L.push('## Failed fetches', '');
    s.failures.forEach((f) => L.push(`- ${cell(f.label)}: ${cell(f.error)} (${f.url})`));
    L.push('');
  }

  L.push('## Outside contributions (not the repo owner)', '');
  const o = github.outside;
  if (!o) L.push('Not available (fetch failed). Do not read this as "none".', '');
  else {
    if (!o.outside.length) L.push('None yet.', '');
    else {
      L.push('| Type | Author | Title | State | Date | URL |', '|---|---|---|---|---|---|');
      o.outside.forEach((r) => L.push(`| ${r.kind} | ${cell(r.login)} | ${cell(r.title)} | ${r.state} | ${r.date} | ${r.url} |`));
      L.push('');
    }
    L.push('### Bot accounts (listed separately, not counted as outside people)', '');
    if (!o.bots.length) L.push('None.', '');
    else {
      L.push('| Type | Account | Title | State | Date | URL |', '|---|---|---|---|---|---|');
      o.bots.forEach((r) => L.push(`| ${r.kind} | ${cell(r.login)} | ${cell(r.title)} | ${r.state} | ${r.date} | ${r.url} |`));
      L.push('');
    }
  }

  L.push('## GitHub repository', '');
  const r = github.repo;
  if (!r) L.push('Repository details: not available (fetch failed).');
  else L.push(`- Stars: ${r.stars}`, `- Forks: ${r.forks}`, `- Watchers: ${n(r.watchers)}`, `- Created: ${r.createdAt}`, `- Last push: ${r.pushedAt}`);
  const c = github.counts;
  L.push(`- Open issues: ${n(c.openIssues)}`, `- Closed issues: ${n(c.closedIssues)}`, `- Open PRs: ${n(c.openPRs)}`, `- Closed or merged PRs: ${n(c.closedPRs)}`, '');
  L.push('Issue and PR totals include items authored by the owner.', '');

  L.push('## Contributors', '');
  if (!github.contributors) L.push('Not available (fetch failed).', '');
  else {
    const others = github.contributors.filter((x) => !x.owner && !x.bot);
    L.push(`People other than the owner: ${others.length === 0 ? 'None yet' : others.length}.`, '');
    github.contributors.forEach((x) => L.push(`- ${cell(x.login)}: ${x.contributions} commits${x.owner ? ' (owner)' : ''}${x.bot ? ' (bot)' : ''}`));
    L.push('');
  }

  L.push('## Releases and tags', '');
  if (!github.releases) L.push('Releases: not available (fetch failed).');
  else if (!github.releases.length) L.push('Releases: none published on GitHub.');
  else github.releases.forEach((x) => L.push(`- ${cell(x.tag)} ${cell(x.name)} (${x.published}) ${x.url}`));
  L.push('');
  L.push(github.tags ? `Tags: ${github.tags.length ? github.tags.join(', ') : 'none'}` : 'Tags: not available (fetch failed).', '');

  L.push(`## npm: ${PKG}`, '');
  const g = npm.registry;
  if (!g) L.push('Registry data: not available (fetch failed).', '');
  else {
    L.push(`- Latest version: ${n(g.latest)}`, `- Versions published: ${g.versionCount}`, `- First published: ${n(g.created)}`, `- Last modified: ${n(g.modified)}`);
    L.push(`- Latest version has provenance attestation: ${g.latestHasProvenance === null ? 'unknown' : g.latestHasProvenance ? 'yes' : 'no'}${g.latestProvenanceUrl ? ` (${g.latestProvenanceUrl})` : ''}`, '');
    g.versions.forEach((v) => L.push(`  - ${cell(v.version)}: ${v.published}`));
    L.push('');
  }
  const d = npm.downloads;
  L.push('### Downloads, last 90 days (raw npm download counts)', '');
  if (!d) L.push('Not available (fetch failed).', '');
  else L.push(`- Window: ${d.start} to ${d.end} (${d.days} days returned)`, `- Total downloads: ${d.total}`, `- Last 30 days: ${d.last30}`, `- Peak day: ${d.peak ? `${d.peak.day} (${d.peak.downloads})` : 'n/a'}`, '- Daily figures are in the JSON file.', '');
  L.push('## Dependents', '', `npm does not expose a dependents count through an API. Check manually: ${s.dependentsCheckUrl}`, '');
  return clean(L.join('\n'));
}

export async function run(opts = {}) {
  const outDir = opts.outDir ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'evidence', 'snapshots');
  const snap = await collect(opts);
  const md = renderMarkdown(snap);
  if (md.includes(DASH)) throw new Error('em dash in output');
  fs.mkdirSync(outDir, { recursive: true });
  const base = path.join(outDir, snap.date);
  fs.writeFileSync(`${base}.md`, md + '\n');
  fs.writeFileSync(`${base}.json`, clean(JSON.stringify(snap, null, 2)) + '\n');
  return { snap, md, files: [`${base}.md`, `${base}.json`] };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run()
    .then(({ snap, files }) => {
      console.log(`Wrote:\n  ${files.join('\n  ')}`);
      if (snap.failures.length) console.warn(`${snap.failures.length} fetch(es) failed; see "Failed fetches" in the report.`);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
