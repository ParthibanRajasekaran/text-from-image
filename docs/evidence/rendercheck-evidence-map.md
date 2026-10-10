# RenderCheck Evidence Map

This document maps all public claims about RenderCheck to their supporting evidence. Used by Tech Nation visa reviewers to verify claims independently.

## Product Claims

### "RenderCheck is live and works"

**Evidence:**
- npm package published: `@freetextfromimage/rendercheck` ([npmjs.com](https://www.npmjs.com/package/@freetextfromimage/rendercheck))
- MIT license: source available at GitHub
- Version: 0.1.0
- Browser demo live at [freetextfromimage.com](https://freetextfromimage.com) — try the OCR tool directly
- Playwright/Cypress integration documented on `/developers` page
- API accepts screenshot + expected text, returns pass/fail

### "API is in developer beta"

**Evidence:**
- Documented on `/developers` page with explicit "Developer Beta" badge
- Request form on `/access` page controls access (not open to all)
- Rate limit: 1,000 OCR calls/month during beta
- API key format defined in `packages/core` and enforced at request time
- Beta statement included on all API documentation

### "No data is stored"

**Evidence:**
- Browser OCR: JavaScript runs client-side (Tesseract.js WASM), no image upload
- API OCR: Screenshots transmitted for OCR processing, never persisted
- Code in `hooks/useOCRProcessor.ts` and `services/ocr.worker.ts` shows local processing
- Privacy policy states: "No image or extracted text persistence by default"
- CSP headers configured to block external image storage

### "Keyboard accessible"

**Evidence:**
- Skip link implemented in all layouts (`<a href="#main-content">Skip to main content</a>`)
- All interactive elements keyboard reachable (Tab, Enter, Escape)
- Mobile menu uses `role="dialog" aria-modal="true"` with focus trap
- Form inputs have associated labels
- Tests in `src/test/a11y.spec.tsx` verify keyboard navigation
- Headings use correct hierarchy (h1, h2, h3)

### "Open source"

**Evidence:**
- GitHub repo: `github.com/ParthibanRajasekaran/text-from-image`
- MIT license in LICENSE file
- Source code publicly readable
- npm package publishes built artifacts only (security)

## Adoption Claims

### "Used by teams"

**Status:** Evidence pending  
**What we're pursuing:** Doctor4Africa case study (AWS Glue healthcare pipeline)  
**Verification path:** Permission from Doctor4Africa to publish metrics

### "0 public installs"

**Evidence:**
- npm package page shows download stats
- Honest assessment: launch date is recent
- Beta testers invited to request access

## Feature States

All features labeled on-site with status badges:

| Feature | State | Evidence |
|---|---|---|
| Browser OCR | Live | Working tool on homepage |
| API OCR | Developer Beta | Request form on `/access`, rate limit documented |
| RenderCheck SDK | Developer Beta | npm package published, docs on `/developers` |
| CLI Tool | Planned | Not yet implemented |

## Security Claims

### "HTTPS only"

**Evidence:**
- Vercel deployment enforces HTTPS
- Secure flag set on all cookies
- CSP header includes `upgrade-insecure-requests`

### "No signup for browser OCR"

**Evidence:**
- Browser OCR runs entirely in-browser (Tesseract.js)
- No authentication required to use the demo
- No form or login on homepage

## What We Don't Claim

❌ GDPR compliant (no legal review)  
❌ WCAG AA accessible (no formal audit; "keyboard accessible" instead)  
❌ Enterprise grade  
❌ Production ready (beta instead)  
❌ Trusted by customers (no customer logos)  
❌ Global usage  
❌ SLA agreement  

## Updating This Map

When adding new features or claims to the website:
1. Add to this evidence map with supporting proof
2. Run `node scripts/claims-audit.mjs` to block overclaims
3. Link to external evidence (GitHub, npm, live demo)
4. Mark "pending" for claims in progress (never hide them)
5. Never claim without evidence

## Tech Nation Visa Review Checklist

- [ ] Claims in this map are verifiable
- [ ] No absolute privacy claims (says "runs locally" not "never sends data")
- [ ] Feature states clearly labeled (live, beta, planned, evidence-pending)
- [ ] No customer logos or testimonials (unless genuine)
- [ ] No overclaimed compliance (GDPR, WCAG AA, SLA)
- [ ] Open source genuinely open (public repo, public license)
- [ ] Product actually solves a real problem (AI verification gap)
- [ ] No fake maturity signals
