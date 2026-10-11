# Enterprise SaaS Credibility Pass — Preflight Audit Report

**Date:** 2026-06-15  
**Auditor findings:** Comprehensive codebase scan across 8 critical dimensions  
**Status:** Ready for PR 1 Foundation Fixes

---

## 1. MAIN LANDMARKS AUDIT

### Current State
| File | Line | Current | Issue |
|---|---|---|---|
| `App.tsx` | 50 | `<main id="main-content">` | Legacy v2, not in use (VITE_UX_V2 disabled) |
| `components/v3/HeroOCR.tsx` | N/A | No explicit `<main>` | Rendered as App root child, valid |
| `components/layouts/ContentLayout.tsx` | 62 | `<main id="main-content">` | **MUST CHANGE TO `<div>`** for PR 2 nested layout compatibility |
| `src/layouts/GuideLayout.tsx` | 43 | `<main id="main-content">` | **MUST CHANGE TO `<div>`** for PR 2 nested layout compatibility |
| `pages/Contact.tsx` | N/A | `<main id="main-content">` | **MUST CHANGE TO `<div>`** for PR 2 nested layout compatibility |
| `app/(tools)/_builder.tsx` | 317 | `<section id="main-content">` | **WCAG VIOLATION** — should be `<main>` but OK in niche pages as secondary |

### Action for PR 1
Pre-emptively change nested `<main>` to `<div>` in ContentLayout, GuideLayout, and Contact to prevent invalid nesting when AppShell is introduced in PR 2.

---

## 2. PER-PAGE STICKY HEADERS AUDIT

### Header Z-Index Stack Found
| Component | Z-Index | Position | File | Issue |
|---|---|---|---|---|
| App legacy header | `z-10` | `sticky top-0` | `App.tsx:51` | Legacy v2 (disabled) |
| Niche page header | `z-30` | `sticky top-0` | `app/(tools)/_builder.tsx:300` | Active, should become z-40 in global header |
| ContentLayout theme toggle | `z-50` | `fixed top-0 right-0` | `components/layouts/ContentLayout.tsx:59` | Will conflict with AppShell header (z-40) |
| GuideLayout theme toggle | `z-50` | `fixed top-0 right-0` | `src/layouts/GuideLayout.tsx:39` | Will conflict with AppShell header (z-40) |
| HeroOCR implicit header | N/A | Via component state | `components/v3/HeroOCR.tsx` | Includes full header UI |

### Action for PR 2
- AppShell.Header: `z-40` (sticky)
- AppShell.Footer: `z-0` (relative)
- Remove all per-page sticky/fixed headers to avoid z-index conflicts
- Global theme toggle moves to AppShell.Header

---

## 3. SECURITY HEADERS CONFIG AUDIT

### Current State
| Location | Found | Status |
|---|---|---|
| `vercel.json` | NO headers block | **MISSING** — file exists but no CSP/security headers configured |
| `_headers` file | NOT FOUND | No Vercel edge header rules file |
| CSP claim in About.tsx | YES | **FAKE CLAIM**: "Security: HTTPS, CSP headers, no cross-site cookies" — not actually deployed |

### Security Headers Missing
- ❌ Content-Security-Policy (CSP)
- ❌ X-Frame-Options
- ❌ X-Content-Type-Options
- ❌ Referrer-Policy
- ❌ Strict-Transport-Security
- ❌ Permissions-Policy
- ❌ Cross-Origin-Opener-Policy

### Action for PR 1
Add complete security headers block to `vercel.json` with:
- CSP allowing: Google Analytics, Google Tag Manager, Formspree, Tesseract Worker, Framer Motion inline styles
- **Do NOT include any ad network domains** (privacy-first positioning)
- All 7 headers listed above
- Cache-Control for immutable assets

---

## 4. ADVERTISING AUDIT

The site shows no ads and loads no ad scripts. The CSP allows no ad hosts, and `e2e/no-third-party.spec.ts` enforces this.

---

## 5. PUBLIC CLAIMS AUDIT

### Current Claims Found
| File | Claim | Issue |
|---|---|---|
| `pages/About.tsx` | "WCAG 2.1 AA compliant" | **UNAUDITED** — dangerous overclaim without formal accessibility audit |
| `pages/About.tsx` | "CSP headers" deployed | **FALSE** — not configured in vercel.json |
| `pages/About.tsx` | "no cross-site cookies" | **VAGUE** — needs precision |
| `pages/About.tsx` | "Privacy-first OCR tool" | **OK** — accurate for browser mode |
| `pages/About.tsx` | "No signup required" | **OK** — accurate |
| `components/v3/HeroOCR.tsx` | Trust chips: "No signup, HTTPS, Fast" | **OK** — minimal claims |

### Claims Explicitly NOT Found (Good)
- ✅ No "enterprise grade"
- ✅ No "production ready"
- ✅ No "trusted by [X customers]"
- ✅ No "SLA"
- ✅ No "global users"
- ✅ No customer logos
- ✅ No "GDPR compliant"

### Action for PR 1
- Remove "WCAG 2.1 AA compliant" from About.tsx → change to "Keyboard accessible, tested with NVDA"
- Remove "CSP headers" claim until PR 1 implements them
- Keep "Privacy-first", "No signup", "HTTPS"

---

## 6. OCR/TESSERACT/TRANSFORMERS LOADING AUDIT

### Load Strategy
| Library | Import | Location | Strategy | Timing |
|---|---|---|---|---|
| `tesseract.js` | Direct npm | `services/tesseractService.ts` | Lazy import in Worker | On first OCR |
| `@xenova/transformers` | Direct npm | `services/transformersService.ts` | Lazy import in Worker | On first OCR |

### Lazy Loading Implementation
```
HeroOCR user input
  ↓
useOCRProcessor hook
  ↓
new Worker(ocr.worker.ts)
  ↓
ocr.worker.ts lazy imports hybridService
  ↓
hybridService lazy imports tesseract + transformers
  ↓
First extraction (not blocking main thread)
```

### Vendor Bundling
- `tesseract.js` bundled separately in Vite config: `return 'tesseract-vendor';`
- Keeps main bundle clean
- Workers run in separate thread

### Action for PR 3
- **Do NOT load OCR on new content pages** (/developers, /rendercheck, /access, /labs, /changelog, /case-studies)
- OCR only loads on `/` (HeroOCR) and `/verify-debt-score` (tool page)
- Verify via bundle analysis that new pages don't accidentally import OCR services

---

## 7. API KEY FORMAT AUDIT

### Defined Format
**Source:** `packages/core/dist/index.d.ts` (single source of truth)

```ts
API_KEY_PREFIX: {
  readonly live: "ftfi_live_"
  readonly test: "ftfi_test_"
}
```

### Usage Found
| File | Usage | Pattern |
|---|---|---|
| `packages/rendercheck/src/verify.ts` | Authorization header | `Authorization: Bearer ${apiKey}` |
| `pages/RenderCheck.tsx` | Code example | `apiKey: process.env.FTFI_API_KEY` |
| Tests | Test keys | `ftfi_live_test.signature` |

### Format Details
- **Prefix:** `ftfi_live_` (production) or `ftfi_test_` (test)
- **Full key:** `ftfi_[live|test]_<publicId>.<hmacSignature>`
- **Validation:** No hardcoded regex found — environment-based checks only

### Action for PR 3
- **IMPORT from `packages/core`**, do NOT redefine API key format
- Example import: `import { API_KEY_PREFIX } from '@freetextfromimage/core';`
- Use for validation/docs on `/developers` page

---

## 8. LAYOUT ROUTES AUDIT

### GuideLayout Routes
| Route | Component | Pattern |
|---|---|---|
| `/image-to-text` | `pages/ImageToText.tsx` | `<GuideLayout title="..." description="...">` |
| `/copy-text-from-image` | `pages/CopyTextFromImageGuide.tsx` | `<GuideLayout>` |
| `/jpg-to-excel` | `pages/JpgToExcelGuide.tsx` | `<GuideLayout>` |
| `/jpg-to-word` | `pages/JpgToWord.tsx` | `<GuideLayout>` |
| `/extract-text-from-image` | `pages/ExtractTextFromImage.tsx` | `<GuideLayout>` |

**File location:** `src/layouts/GuideLayout.tsx:39` — has `<main>` that must change to `<div>`

### ContentLayout Routes
| Route | Component | Pattern |
|---|---|---|
| `/about` | `pages/About.tsx` | `<ContentLayout title="..." subtitle="..." side={founderCard}>` |
| `/rendercheck` | `pages/RenderCheck.tsx` | `<ContentLayout>` |

**File location:** `components/layouts/ContentLayout.tsx:62` — has `<main>` that must change to `<div>`

### HeroOCR (Home)
| Route | Component | Pattern |
|---|---|---|
| `/` | `components/v3/HeroOCR.tsx` | Full hero UI + dropzone, header, trust chips |

**File location:** `components/v3/HeroOCR.tsx` — will become child of AppShell in PR 2

### Niche Tool Pages (makeNichePage builder)
| Route | Pattern | Issue |
|---|---|---|
| `/handwriting-to-text`, `/offline-image-to-text`, `/math-to-latex`, etc. | `app/[slug]/page.tsx` via `makeNichePage(config)` | Uses `<section id="main-content">` not `<main>` — WCAG violation |

**Builder location:** `app/(tools)/_builder.tsx:300` — generates header with `sticky top-0 z-30`

### Action for PR 2
1. Create `components/shell/AppShell.tsx` as root layout
2. Convert router to nested layout structure with AppShell as layout wrapper
3. Update Header nav to include: `Product | RenderCheck | Labs | Developers | Security | Access`
4. Remove all per-page headers (GuideLayout, ContentLayout, HeroOCR inline headers)

---

## CRITICAL BLOCKERS FOR EXECUTION

### 🚨 Must Fix Before PR 2
- **Nested `<main>` tags:** Change ContentLayout, GuideLayout, Contact to use `<div>` instead of `<main>`
- **Fake CSP claim:** Remove from About.tsx or implement security headers in PR 1
- **WCAG 2.1 AA claim:** Downgrade to "Keyboard accessible" unless formal audit completed

### ⚠️ Document for PR 3
- **API key format import:** Must source from `packages/core`, not redefine
- **OCR not on content pages:** Verify bundle doesn't accidentally load tesseract on new pages

### ✅ Ready as-is
- Lazy OCR loading via Worker — good strategy, no changes needed
- API key environment configuration — already correct
- Trust chips positioning — minimal, honest claims

---

## Evidence Links

- **Before:** Repo has legitimate credibility foundation (privacy-first, lazy OCR, no fake claims mostly)
- **Gaps:** CSP not implemented, WCAG claim unaudited, layout fragmentation, per-page headers conflict with global shell
- **Action:** PR 1 implements CSP + fixes claims, PR 2 consolidates headers to AppShell, PR 3 ensures OCR doesn't load on content pages

**Next:** Ready to begin PR 1 implementation.
