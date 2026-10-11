# Evidence

Files in this folder support the UK Global Talent Visa application. Hand-written files are
updated by the author; files under `snapshots/` are generated.

## Evidence snapshots

`scripts/evidence-snapshot.mjs` records a dated, sourced snapshot of public signals for
`@rendercheck/sdk` and the GitHub repository. It uses only public, unauthenticated APIs
(npm downloads and registry, GitHub REST). Nothing is estimated: if a request fails, the
failure is written into the report and that figure is left out.

Run it on your own machine (Node 18+, no install step):

```
npm run evidence:snapshot
GITHUB_TOKEN=<token> npm run evidence:snapshot   # optional, only raises rate limits
```

Output goes to `docs/evidence/snapshots/YYYY-MM-DD.md` and `.json`. Each file starts with the
run time, the exact source URLs and the method. Running twice on the same day overwrites that day.

What it records: npm downloads for the last 90 days, publish times, versions and whether the latest
version has provenance; GitHub stars, forks, watchers, issue and PR counts; issues and PRs authored by
people other than the repo owner (bots listed separately); contributors; releases and tags. npm
exposes no dependents API, so the report prints the URL to check by hand.

### Honesty rules

- Downloads are never described as people or adoption. npm counts include CI re-installs, mirrors and bots.
- MCP use cannot be separated from SDK downloads, because the MCP server ships inside `@rendercheck/sdk`.
- Outside issues and PRs, and named users, are the stronger evidence. If there are none, the report says "None yet."
- Quote a snapshot only with its date and source, and do not round figures up.
