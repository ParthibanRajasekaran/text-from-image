# Draft GitHub issues for the roadmap

Drafts only. Nothing here has been filed. Items 1 to 5 come from the "Roadmap and sustainability" section of the About page ("These are plans, not products"); items 6 and 7 follow from the Security page. Wording is deliberately non-committal: no dates, no promises.

---

## 1. Bundle more OCR languages beyond English

**Labels:** `enhancement`, `sdk`, `good first issue`

**Body:**
Only English ships with `@rendercheck/sdk` today. Other languages work only if you supply the data yourself with `langPath` (see `packages/rendercheck/src/core/locale.ts`).

Proposal: decide which languages to bundle first, and how. Open questions:
- Install size. Each Tesseract data file adds to the package. Is a separate package per language (like `@tesseract.js-data/eng`) better than bundling?
- The "no network, nothing downloaded" rule must hold: data must be read from installed packages, never fetched at run time.
- Locale mapping (`ocrLangFor`) and the browser tool at /image-to-text would need the same data self-hosted under `/ocr/`.

Acceptance: a new language loads under the conditions in `__tests__/offline.spec.ts`, and `npm run check:copy` still passes without any language-count claim.

---

## 2. Publish a reproducible accuracy benchmark

**Labels:** `documentation`, `research`, `sdk`

**Body:**
The site makes no accuracy percentage because there is no published benchmark. Add one that anyone can rerun.

Scope:
- A fixed, licensed set of UI screenshots with ground-truth text.
- A script in the repo that prints per-case results and the method, so numbers are reproducible.
- Report failures as well as passes, including low-contrast and small-text cases.

Do not add any accuracy claim to the site until the benchmark exists and is linked. `scripts/check-claims.mjs` should keep blocking unbacked percentages.

---

## 3. Publish SDK 0.6.0 (CLI, MCP server, `init`) to npm

**Labels:** `release`, `sdk`

**Body:**
The command line (`verify`, `read`, `stats`, `init`) and MCP server (`verify_text`, `read_text`) are in `packages/rendercheck` at 0.6.0 but not yet on npm. The Developers page and `llms.txt` say so.

Checklist:
- Run the unit tests and `npm run test:offline`.
- Confirm the package contents (`npm pack --dry-run`) include only intended files.
- Update the changelog, and remove the "not yet on npm" wording from the site and `llms.txt` after publishing.
- Confirm the Security page text on the local usage log still matches the code.

---

## 4. Explore a hosted history of failures across CI runs (discussion)

**Labels:** `discussion`, `idea`, `needs-demand`

**Body:**
Listed on the About page as "under consideration for teams, only if teams using the SDK ask for them". Not planned, not started, not for sale.

This issue exists to collect evidence of demand. If you use the SDK in CI, please say:
- What would you want to see (trends, flaky text checks, per-PR diffs)?
- Would a local-file or self-hosted option meet the need instead? The SDK sends nothing to a server today.
- What data would you be willing to send? Any hosted option would have to be opt-in and leave the offline SDK unchanged.

The open-source core stays MIT licensed and free whatever happens here.

---

## 5. Gather requirements for single sign-on (only if requested)

**Labels:** `discussion`, `idea`, `needs-demand`

**Body:**
Also from the About page: enterprise needs such as single sign-on are considered only if teams ask. There is no hosted product to sign in to today, so this depends on issue 4.

If you need SSO, please describe the product it would protect and your identity provider. Close this issue if issue 4 does not go ahead.

---

## 6. Enable and document GitHub private vulnerability reporting

**Labels:** `security`, `maintenance`

**Body:**
`SECURITY.md` and the Security page offer email, or GitHub private reporting "if enabled". Whether it is enabled is a repository setting that cannot be seen in the code.

Tasks (maintainer):
- Check Settings, Code security, Private vulnerability reporting, and turn it on if wanted.
- Once enabled, drop the "if enabled" wording from `SECURITY.md` and `pages/Security.tsx`.

---

## 7. Triage dependency advisories in build and development tooling

**Labels:** `security`, `dependencies`

**Body:**
`npm audit` reports advisories in build and development tooling (checked 11 October 2026: none in the site's production dependencies; the SDK package reports one low severity advisory in a build dependency). The Security page states this limit.

Tasks:
- List each advisory and whether it is reachable from shipped code.
- Upgrade where a non-breaking fix exists; record accepted risks otherwise.
- Update the date and wording on the Security page and `SECURITY.md` when this is done.
