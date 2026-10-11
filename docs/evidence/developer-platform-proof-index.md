# Developer Platform Proof Index

Maps each website claim to its proof for Tech Nation visa application. When a reviewer clicks on a feature or claim, they should be able to independently verify it.

## Homepage Claims → Proof

| Claim | Location | Proof Type | Verification Path |
|---|---|---|---|
| "Extract text from images in your browser" | Hero | Live demo | Try the OCR tool on the homepage |
| "No signup" | Hero | Technical | Browser OCR runs client-side (Tesseract.js) |
| "HTTPS only" | Footer | Header | View HTTP response headers in DevTools |
| "No image or text persistence" | Footer | Technical + CSP | Privacy policy + CSP header blocks external storage |
| "Keyboard accessible" | Footer | Accessibility | Use keyboard-only nav (Tab/Shift+Tab) |
| "Open source" | Footer | Repository | Visit GitHub repo, view MIT license |

## /rendercheck Claims → Proof

| Claim | Location | Proof Type | Verification Path |
|---|---|---|---|
| "OCR-based verification for AI-generated UI" | Title | Technical | See API Reference and code examples |
| "Catch bugs where DOM tests pass but visible text is wrong" | Hero | Educational | See "Use Cases" section with examples |
| "Works with Playwright, Cypress, and any E2E tool" | Docs | Technical + Examples | See Playwright and Cypress integration examples |
| "npm install @rendercheck/sdk" | Install section | Repository | Visit npmjs.com package page |
| "Requires Node 18+" | Requirements | Technical | Check package.json engines |
| "MIT licensed" | Sidebar | License | View LICENSE file on GitHub |

## /developers Claims → Proof

| Claim | Location | Proof Type | Verification Path |
|---|---|---|---|
| "Browser OCR is live" | Product state | Live demo | Try on homepage |
| "API OCR is in developer beta" | Product state | Access control | Request form on `/access` page |
| "RenderCheck SDK is available" | Product state | npm | Visit npm package page |
| "1,000 OCR calls/month during beta" | Rate limit | Terms | Documented in beta access form |
| "API returns: outcome, foundWords, missingWords, extractedText, confidence" | API Reference | Code | See TypeScript interfaces |
| "Free tier available" | FAQ | Technical | No credit card required for browser OCR |

## /access Claims → Proof

| Claim | Location | Proof Type | Verification Path |
|---|---|---|---|
| "Browser OCR is live and free" | Tier 1 | Live demo | Use the tool on homepage |
| "Developer Beta API: 1,000 calls/month" | Tier 2 | Access control | Submit request form, terms will be in email |
| "Public interest projects get free access" | Tier 3 | Terms | Policy stated on page, enforced by manual review |
| "No billing during beta" | FAQ | Contract | No Stripe integration, no payment required |
| "No data storage" | FAQ | Technical | Privacy policy + CSP headers |

## /case-studies Claims → Proof

| Claim | Location | Proof Type | Status |
|---|---|---|---|
| "Doctor4Africa uses RenderCheck in AWS Glue pipeline" | Case study | Partnership | 🟡 Evidence pending — awaiting permission to publish metrics |
| "0 public installs" | Testimonials section | Transparency | npm stats page |
| "Be among the first beta testers" | CTA | Opportunity | Open beta access on `/access` |

## Missing/Pending Evidence

**Still in progress:**
- Doctor4Africa case study permission
- Beta user testimonials (collecting via `/access` form)
- Production usage metrics (will be collected via `/changelog`)
- Playwright/Cypress integration reports (tracking via analytics)

**Deliberately not claimed:**
- GDPR compliance (no legal review)
- WCAG AA accessibility (no formal audit; keyboard access verified instead)
- Enterprise-grade (beta stage)
- Production ready (developing feature means beta)
- Trusted by X customers (no verified testimonials)

## How to Use This Index

**For website visitors:**
- Use this to verify claims independently
- All claims link back to source code or live demo
- No customer logos without permission

**For Tech Nation reviewers:**
- This index shows what is claimed vs. what is provable
- Each row has a verification path you can follow yourself
- "Evidence pending" items are honest admissions, not hidden claims
- The absence of a claim (like "GDPR compliant") is deliberate

**For future development:**
- Before adding a new claim, ensure you can fill in this row
- Run `node scripts/claims-audit.mjs` to block overclaims
- Update this index before merging PR with new claims

## Claim Verification Checklist

For each claim on the website, ask:
- [ ] Is it verifiable without special access?
- [ ] Is it honest (not "enterprise grade" when beta)?
- [ ] Is it specific (not "trusted" without evidence)?
- [ ] Is it current (not based on old data)?
- [ ] Would a Tech Nation reviewer accept it?
- [ ] Is "pending" label used for in-progress items?
