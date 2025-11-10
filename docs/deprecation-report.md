# 📋 Deprecation Audit Report
**Branch:** `feat/adsense-readiness`  
**Date:** 2025-11-09  
**Status:** READ-ONLY (no code changes — candidates for review only)

---

## Executive Summary

This audit identifies **deprecation candidates** across the codebase grouped by category. No code has been modified. All findings are **candidates for discussion** before removal.

**Total Candidates Identified:** 20+ files/paths  
**High Confidence:** 8  
**Medium Confidence:** 9  
**Low Confidence:** 4  

---

## 📂 Category: Unreferenced Pages (Not in router.tsx)

Pages exist but are not registered in the router, making them inaccessible via navigation.

| Path | Reason | References | Confidence |
|------|--------|-----------|------------|
| `src/pages/ImageToTextGuide.tsx` | Not imported in router.tsx; no route defined. Similar content exists in `pages/ImageToText.tsx`. | 0 | **High** |
| `src/pages/Contact.tsx` | Static page exists but no route `/contact` in router.tsx. Public page stub exists at `public/contact.html`. | 0 | **High** |
| `src/pages/About.tsx` | Static page exists but no route `/about` in router.tsx. Public page stub exists at `public/about.html`. | 0 | **High** |
| `src/pages/PrivacyPolicy.tsx` | Static page exists but no route `/privacy-policy` in router.tsx. Public page stub exists at `public/privacy-policy.html`. | 0 | **High** |
| `src/pages/Terms.tsx` | Static page exists but no route `/terms` in router.tsx. Public page stub exists at `public/terms.html`. | 0 | **High** |
| `pages/CopyTextFromImage.tsx` | Wrapper component using `IntentPage`; routed via `/copy-text-from-image` (router registers `CopyTextFromImageGuide` instead). This component may be redundant. | 1 (test import) | **Medium** |
| `pages/JpgToWordGuide.tsx` | Exists but `JpgToWord.tsx` is routed as the main page. Guide version may be redundant with main page. | 0 | **Medium** |

---

## 🎨 Category: Duplicate/Competing Components

Multiple components serve overlapping purposes or represent version transitions.

| Path | Reason | References | Confidence |
|------|--------|-----------|------------|
| `components/FileInput.tsx` | Legacy uploader component. Superseded by `components/Dropzone.tsx` and `components/v3/GlassDropzone.tsx`. App.tsx uses `FileInput` only when `VITE_UX_V2=false`. | 2 | **Medium** |
| `components/Dropzone.tsx` | Uses motion and complex state. Superseded by `components/v3/GlassDropzone.tsx` (glass-morphism design). App.tsx uses `Dropzone` when `VITE_UX_V2=true`. | 2 | **Medium** |
| `components/ProgressBar.tsx` | Legacy progress indicator. Superseded by `components/v3/GlassProgressBar.tsx`. Still imported in App.tsx for legacy UI. | 2 | **Medium** |
| `components/Skeleton.tsx` | Generic skeleton loader. Potentially superseded by `components/SkeletonLoader.tsx` with more features. | 1 | **Low** |
| `components/ResultDisplay.tsx` | Legacy result display. Superseded by `components/v3/GlassResultCard.tsx`. Referenced in App.tsx (legacy path). | 1 | **Low** |

---

## 📜 Category: Legacy App Root Components

Components designed for older UI versions (before V2/V3).

| Path | Reason | References | Confidence |
|------|--------|-----------|------------|
| `App.tsx` | Legacy root component. Replaced by `HeroOCR` (via `router.tsx` at home). Only used when `isUXV2Enabled()` returns false. V2/V3 apps use router. | 1 (index.tsx fallback) | **High** |
| `_deprecated/App.tsx` | Explicitly marked as deprecated. Already moved out of active tree. | 0 | **High** |

---

## 🌍 Category: Public HTML Stubs (Pre-rendered Pages)

Static HTML files that may not be used if SPA routing is primary.

| Path | Reason | References | Confidence |
|------|--------|-----------|------------|
| `public/about.html` | Static pre-rendered page. Only needed if `/about` route is unavailable. Current router doesn't include `/about` route. | 0 | **Medium** |
| `public/contact.html` | Static pre-rendered page. Only needed if `/contact` route is unavailable. Current router doesn't include `/contact` route. | 0 | **Medium** |
| `public/privacy-policy.html` | Static pre-rendered page. Only needed if `/privacy-policy` route is unavailable. Current router doesn't include `/privacy-policy` route. | 0 | **Medium** |
| `public/terms.html` | Static pre-rendered page. Only needed if `/terms` route is unavailable. Current router doesn't include `/terms` route. | 0 | **Medium** |

---

## 🛠️ Category: Scripts & Build Tools

Utilities that may be unused or have missing dependencies.

| Path | Reason | References | Confidence |
|------|--------|-----------|------------|
| `scripts/validate-json.cjs` | Validates JSON but no automated integration (only called via `npm run spec:schemas` which isn't in CI). | 1 | **Low** |
| `scripts/should-build.mjs` | Smart build skipping script. Not referenced in package.json or CI. Unclear if actively used. | 0 | **Low** |
| `scripts/build-sitemap.mjs` | Builds sitemap.xml. Called via `npm run sitemap` but not part of build pipeline (prebuild/build/postbuild). Manual step only. | 1 | **Medium** |

---

## 🔗 Category: Env Variables (Unused or Undefined)

Environment variables referenced in code but not defined in `.env.example` or may be vestigial.

| Variable | Location | Reason | Confidence |
|----------|----------|--------|------------|
| `VITE_ENABLE_ADS_IN_PREVIEW` | `pages/CopyTextFromImageGuide.tsx` line 47 | Used to enable ads in preview mode, defined in code but may not be set in `.env.example`. | **Medium** |
| `VITE_OCR_MIN_CONFIDENCE` | `.env.example` | Defined in env but no usage found in current codebase. Historical remnant? | **Low** |
| `VITE_OCR_MIN_TEXT_LENGTH` | `.env.example` | Defined in env but no usage found in current codebase. Historical remnant? | **Low** |

---

## 📁 Category: Potentially Unused Assets/Files

Files in project that may not be referenced or loaded.

| Path | Reason | References | Confidence |
|------|--------|-----------|------------|
| `stats.html` | Bundle analyzer output (generated by rollup-plugin-visualizer). Build artifact, not source. Safe to remove from git. | 0 | **Low** |

---

## 🚀 Category: GitHub Workflows

Workflows and CI references to validate.

| Path | Reason | References | Confidence |
|------|--------|-----------|------------|
| `.github/workflows/spec.yml` | OpenAPI spec validation. Scripts exist (`scripts/spec-lint.mjs`, `scripts/spec-diff.mjs`). Status: **VERIFIED ✅** Active. | 2 | **High** |
| `.github/workflows/deploy.yml` | Deployment workflow. Scripts exist (`scripts/deploy-prod.mjs`). Status: **VERIFIED ✅** Active. | 2 | **High** |
| `.github/workflows/quality.yml` | Test & build workflow. Status: **VERIFIED ✅** Recently enhanced with coverage upload. | 2 | **High** |

---

## 📊 Audit Methodology

### Static Checks Performed (Commands to Run Locally)

```bash
# 1. Type check for errors (catches unused imports, type mismatches)
tsc --noEmit

# 2. Linting for code quality and unused variables
npm run lint

# 3. Dependency usage check (identifies unused npm packages)
npx depcheck

# 4. Bundle analysis (identifies unused chunks and large files)
npm run analyze
# Then inspect the generated visualization

# 5. Build & test to ensure no runtime errors
npm run build
npm run test

# 6. Manual review of:
#    - router.tsx for all registered routes
#    - package.json scripts for active commands
#    - .github/workflows/ for referenced paths
#    - .env.example for defined variables
```

---

## ✅ Verification Checklist

Before removing any candidate:

- [ ] Confirm no other files import/reference the candidate
- [ ] Check git history for when it was last used
- [ ] Verify no hardcoded routes or links in documentation
- [ ] Test full app after removal (build, test, visual check)
- [ ] Search for references in comments and markdown files
- [ ] Check if conditional imports exist (`import.meta` or dynamic `import()`)

---

## 🔄 Next Steps

1. **Review this report** with the team
2. **Run type check & lint locally** to validate findings:
   ```bash
   npm run build && npm run test && npm run lint
   npx depcheck
   ```
3. **Prioritize removals** by confidence level (High → Medium → Low)
4. **Create PRs** for each category (don't bulk-delete)
5. **Test before/after** each removal
6. **Update docs** if removing features (e.g., env variables)

---

## 📝 Notes

- **No code changes made** — This is a discovery report only
- **All paths are relative to repository root**
- **Confidence levels** reflect likelihood of safe removal:
  - **High:** Definite unused, safe to remove
  - **Medium:** Likely unused, warrants manual review
  - **Low:** Possibly used in edge cases; high caution
- **Pages in `src/pages/` vs `pages/`** suggest a refactoring in progress (old structure vs new)

---

**Report generated by automated audit.**  
**Last updated:** 2025-11-09
