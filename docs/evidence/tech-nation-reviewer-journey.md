# Reviewer journey: what can be checked, and how

A walk-through of what a reviewer can verify about RenderCheck in about 30 minutes, with the exact
command or page for each claim. Last reviewed 11 October 2026 (package 0.6.0). It lists only things that
can be checked; where evidence does not exist yet, it says so.

Reviewers look for four things: a real problem, a working solution, evidence of use or recognition, and an
author who does not overclaim. Each section below maps to one of them.

## 1. The product works (5 minutes)

- Open <https://getrendercheck.com/image-to-text>, choose any screenshot. Text is read in the browser.
- Open the browser's Network tab while it runs. No request carries the image. The page shows a live count of
  requests and bytes sent.
- The same engine runs in tests: <https://getrendercheck.com/developers> shows the Playwright and Cypress
  assertions, and the "For AI agents" section shows the command line and MCP server.

## 2. It is published, with provenance (5 minutes)

| Claim | How to check |
| --- | --- |
| Package `@rendercheck/sdk` is on npm, MIT licensed | `npm view @rendercheck/sdk version license` (latest 0.6.0) |
| Versions published under this name | `npm view @rendercheck/sdk versions` (0.5.0, 0.5.1, 0.6.0 and a 0.0.0-stage placeholder) |
| Built and published from this repository, not from a laptop | Package page on npmjs.com shows the provenance badge; release workflow in `.github/workflows` |
| Earlier releases were under a previous name | `@freetextfromimage/rendercheck` up to 0.4.1; renamed from 0.5.0, API unchanged (CHANGELOG.md) |
| Listed in the official MCP Registry | `curl "https://registry.modelcontextprotocol.io/v0/servers?search=rendercheck"` returns `io.github.ParthibanRajasekaran/rendercheck` |
| Tagged releases with notes | GitHub Releases for `rendercheck-v0.4.0`, `v0.4.1`, `v0.5.1`, `v0.6.0`; notes in `docs/release-notes/` |

The MCP registry hosts metadata only. The package itself is the npm package, started with `npx`.

## 3. The claims are tested (10 minutes)

- Offline claim: `packages/rendercheck/__tests__/offline.spec.ts`; `npm run test:offline` runs it with no network on Linux.
- Same-origin claim for the site: `e2e/no-third-party.spec.ts` checks every route for requests to other addresses.
- Command line and MCP server: `packages/rendercheck/__tests__/cli-mcp.spec.ts` and `init.spec.ts`.
- Accessibility: `e2e/quality.spec.ts` runs axe-core on every route in light and dark mode, plus a 390px mobile check.
- Security page: every statement is tied to a test or a file, see `pages/Security.tsx` and `docs/ARCHITECTURE.md`.

## 4. A benchmark the reader can re-run (5 minutes)

`npm run bench` in `packages/rendercheck` regenerates `benchmarks/results.md`. It is a self-made suite by the
author with 21 fixtures (13 with a visible-text bug, 8 readable). A DOM assertion (`toContainText`) flagged 0 of
13 bugs. RenderCheck flagged 12 of 13, missed 1 and wrongly flagged 3 of the 8 readable fixtures. These numbers show
the class of bug and the false positives; they are not a claim of general accuracy. Every fixture and the method are in
the folder.

## 5. Dated public signals

`npm run evidence:snapshot` writes a dated, sourced report of npm and GitHub signals under
`docs/evidence/snapshots/`. Rules in `docs/evidence/README.md`: downloads are not described as people or adoption,
and MCP use cannot be separated from SDK downloads. Quote a snapshot only with its date.

## 6. Where the author does not overclaim

- The site and package say "developer beta". There is no certification and no third-party penetration test.
- There are no published customer case studies; the case studies page says so. A Doctor4Africa case study is not
  published because metrics and permission are not confirmed.
- External use is not claimed. Outside issues, pull requests and named users appear in the snapshot only if they exist.
- The command line and MCP server keep a usage log on the user's own machine only. There is no telemetry, so the author
  cannot count MCP users.
- Run `npm run check:copy` to check the site copy for em dashes and unsupported claims.

## Checklist

- [ ] `npm view @rendercheck/sdk` returns 0.6.0 and the provenance badge shows on npmjs.com
- [ ] The MCP Registry search returns the rendercheck entry
- [ ] GitHub Releases list the four tags
- [ ] `npm run bench` reproduces `results.md`
- [ ] The Network tab shows no image upload on the image-to-text tool
- [ ] The case studies page states that none are published
