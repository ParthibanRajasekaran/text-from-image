# RenderCheck

**Assert the text users actually see, not just what is in the DOM.** RenderCheck takes a screenshot in your
Playwright or Cypress test, reads it with OCR on your machine, and fails the test when the rendered text is
wrong, too faint to read, or missing. No API key, no upload, no network calls.

```
Expected to find text "[Total: $14.00]" but OCR read "[Total: €14.00]" (Confidence: 96%)
  Diff: Total: [$]14.00  →  Total: [€]14.00
```

```bash
npm install --save-dev @freetextfromimage/rendercheck
```

```ts
import { test } from '@playwright/test';
import { expect } from '@freetextfromimage/rendercheck/playwright';

test('checkout shows the right total', async ({ page }) => {
  await page.goto('/checkout');
  await expect(page).toShowText('Total: $14.00');
});
```

- Site and docs: [getrendercheck.com](https://getrendercheck.com) ([Playwright](https://getrendercheck.com/playwright-ocr-testing), [Cypress](https://getrendercheck.com/cypress-ocr-testing), [developer reference](https://getrendercheck.com/developers))
- SDK source and full options: [`packages/rendercheck`](./packages/rendercheck)
- Status: developer beta. Cypress support has been run in Cypress 13 (Electron, Linux) only.

This repository also contains the free browser tool at getrendercheck.com, which extracts text from images
entirely in your browser (Tesseract.js, WebAssembly). The rest of this README describes that tool.

## Free image-to-text tool

> Free, private OCR that runs entirely in your browser: zero API costs, and your images never leave your device.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite)](https://vitejs.dev/)

**How it is built:** see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the system, browser and SDK diagrams and a table mapping each privacy claim to the code and test that back it.

## ✨ Features

- 🚀 **Fast** - Runs on your device, so there is no upload wait
- 🔒 **Private** - Images are read in your browser and are not uploaded
- 🤖 **Local OCR** - Tesseract.js (WebAssembly) runs in your browser, self-hosted, with no model download
- 📊 **Honest confidence** - Low-confidence results are returned and flagged, not silently replaced
- 🎨 **Image Enhancement** - Preprocessing steps before recognition
- 💰 **Completely Free** - No API costs, no hidden fees
- 🌓 **Dark/Light Mode** - Beautiful UI with theme toggle
- 📱 **Mobile Friendly** - Responsive design for all devices
- ✨ **V3 Premium UI** - Aurora gradients, glass-morphism, micro-interactions
- ⌨️ **Keyboard Shortcuts** - Quick actions with keyboard (C/D/H/T/Escape)
- ♿ **Accessible** - Keyboard navigation; serious and critical axe-core checks run in CI
- 🎯 **SEO Optimized** - Intent-specific pages with FAQ rich snippets

## 🎨 UI Variants

### V3 Premium UI (Recommended)

Enable with `VITE_UX_V2=1` environment variable for:

- **Aurora Background** - Animated gradient blobs with grain texture
- **Glass Morphism** - Modern glassmorphic cards with backdrop blur
- **Staged Progress** - 3-step progress indicator (Upload → OCR → Render)
- **Confetti Animation** - Celebratory micro-interaction on copy
- **History Drawer** - Slide-in drawer with last 20 results
- **Keyboard Shortcuts**:
  - `C` - Copy result
  - `D` - Download result  
  - `H` - View history
  - `T` - Toggle theme
  - `Escape` - Close drawer/clear result
- **Core Web Vitals** - LCP < 1.8s, INP < 200ms, CLS < 0.1
- **5 Intent Pages** - SEO-optimized routes with FAQ sections

### Classic UI (Fallback)

Original simple UI without premium features.


## 🔍 SEO Defaults

All canonical and OG/Twitter image URLs are computed as absolute using `VITE_SITE_URL` (see `.env.example`).

- Default OG image: `/og/default.png` (1200×630, logo/high contrast, ≤200KB recommended)
- Set per-route OG via `ogImage` prop in SEO helpers/components.
- Canonical links are always absolute.

**How to set VITE_SITE_URL:**
- Locally: add to `.env.local` (e.g. `VITE_SITE_URL=http://localhost:5173`)
- Vercel/Production: set in dashboard or `vercel.json` env block.

**Validation:**
After deploy, validate with [Twitter Card Validator](https://cards-dev.twitter.com/validator) and [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/).

- Per-word confidence scores
- Low-confidence results are flagged for review
- Accuracy depends on the image; no benchmark figure is published yet


## 🧩 Spec-Driven Development (SDD)

This repo uses Spec-Driven Development for reliability and accessibility. All features, APIs, schemas, and UX contracts are defined in `/specs` and enforced in CI.

### How to work with specs
- Product features: `/specs/product/*.feature` (BDD scenarios)
- API contracts: `/specs/api/openapi.yml` (OpenAPI)
- Schemas: `/specs/schemas/*.json` (JSON Schema)
- UX tokens/contracts: `/specs/ux/tokens.json`, `/specs/ux/components/*.md`
- AI goldens: `/specs/ai/evals/goldens/*.json`

### How AI agents should use specs
- Always read relevant specs before proposing changes
- Update tests and contracts if specs change
- Use BDD runner and schema guard helpers for validation

### PR Checklist
- [ ] If spec changed, update tests & ADR
- [ ] BDD passing
- [ ] Schema/contract diffs clean
- [ ] No SEO/a11y regressions

### CI Gates
- `npm run spec:lint`: Spectral lint for OpenAPI
- `npm run spec:schemas`: Validate JSON schemas and tokens
- `npm run spec:test`: Playwright BDD tests
- `npm run spec:diff`: OAS diff for breaking changes


### Prerequisites

- Node.js 20+
- npm 10+ or yarn 4+


### Quick Start (Development)

```bash
# Clone and setup
git clone https://github.com/ParthibanRajasekaran/text-from-image.git
cd text-from-image
npm install

# Start dev server
npm run dev
# Visit http://localhost:5173

# Run tests
npm run test

# Build for production
npm run build
```

## 🚀 Deployment

### Deploy to Vercel (Production)

Deploy your EXACT local code to production with zero drift:

```bash
# First time setup
npm run vercel:link         # Link to your Vercel project
npm run vercel:pull:prod    # Pull production environment variables

# Deploy to production
npm run deploy:prod
```

After deployment, verify the footer shows the correct commit SHA matching your local git commit.

### GitHub Actions (Automated Deploys)

This project uses controlled deployments to avoid accidental deploys:

**Preview Deployments (Pull Requests):**
- Only triggers when PR has `deploy:preview` label
- Deploys to preview URL, posted as PR comment
- Cancelled automatically when new commits pushed

**Production Deployments (Main Branch):**
- Automatically deploys on push to `main` branch
- Skip with `[skip deploy]` in commit message
- Only deploys if app files changed (not docs-only)

**Manual Deployment:**
- GitHub UI: Actions → Deploy to Vercel → Run workflow

### Required GitHub Secrets

Add these in **Settings → Secrets and variables → Actions**:

| Secret | Where to get it |
|--------|-----------------|
| `VERCEL_TOKEN` | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | Run `vercel link`, check `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Run `vercel link`, check `.vercel/project.json` |

### Environment Variables (Vercel)

Set these in **Vercel Dashboard → Project → Settings → Environment Variables**:

```bash
# Feature Flags (Production environment)
VITE_UX_V2=true                    # Enable enhanced UI
VITE_ANALYTICS_ENABLED=true        # Enable Web Vitals tracking
VITE_OCR_MIN_CONFIDENCE=60         # Tesseract confidence threshold
```

📖 **Full deployment guide:** See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for:
- Zero-drift deployment strategy
- Bundle size monitoring
- CI/CD setup
- Troubleshooting common issues

## 🏗️ Architecture

### Application Structure

```
pages/               # SEO-optimized route pages (lazy-loaded)
  ├── ImageToText.tsx
  ├── ExtractTextFromImage.tsx
  └── ...
    
components/         # Reusable React components
  ├── v3/           # Premium UI (Aurora, Glass, History)
  └── ...

hooks/              # Custom React hooks (useShortcuts, useLocalHistory, etc.)

lib/                # Business logic
  ├── consent.ts    # Consent Mode v2 management
  ├── analytics.ts  # Web Vitals tracking
  └── config/       # Feature flags & env guards

services/           # OCR engine (Tesseract.js, in the browser)

src/test/         # Test suite (vitest): routes, SEO, a11y
```

### Request Flow: Image Upload → OCR → Result

```
User Upload
    ↓
File Validation (type, size)
    ↓
Image Preprocessing (optional)
    ↓
Tesseract OCR (in the browser, 2-5s)
    ├─ Confidence ≥ 60%? → Return ✓
    └─ Below 60% → Return, flagged low confidence ✓
    ↓
Result Display + Copy/Download
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **UI** | React 19.2 + TypeScript 5.8 |
| **Build** | Vite 6.2 + Rollup (code splitting) |
| **OCR** | Tesseract.js 5.1 (WebAssembly, self-hosted) |
| **Styling** | CSS + Tailwind + Custom properties |
| **State** | React Hooks (useReducer, Context) |
| **Testing** | Vitest + Testing Library |
| **Deployment** | Vercel (automated via GitHub Actions) |

### Feature Flags & Configuration

See `.env.example` for all available flags:

| Flag | Purpose | Default |
|------|---------|---------|
| `VITE_UX_V2` | Enable premium UI (Aurora/Glass) | `false` |
| `VITE_SITE_URL` | Canonical domain for SEO | computed |
| `VITE_OCR_MIN_CONFIDENCE` | Tesseract confidence threshold | `60` |

**See also:** [Env Guards](./lib/env-guards.ts) for runtime validation.

## 🛠️ How It Works

### 1. Image Upload
- Supports PNG, JPG, WEBP
- Max file size: 20MB
- Drag & drop or click to browse

### 2. Processing
- **Step 1:** Validate file (type, size, browser compatibility)
- **Step 2:** Apply image preprocessing (optional, auto-enabled)
- **Step 3:** Run Tesseract OCR in the browser
- **Step 4:** If confidence < 60%, show the result flagged as low confidence

### 3. Results
- Extracted text with confidence score
- Copy to clipboard
- Download as .txt or .doc
- Shows which method was used

## 📊 Performance

| Aspect | Status |
|--------|--------|
| **Speed** | Depends on your device and image size; the OCR runs in your browser |
| **Accuracy** | Not benchmarked yet. Clear, high-resolution printed English text reads best |
| **Cost** | Free |
| **Privacy** | Images are read in the browser and are not uploaded (see `/security`) |
| **Offline** | Works after the OCR model has downloaded once |

Accuracy figures will be published here only with the benchmark script and data that produce them.

## 🔒 Privacy

- ✅ **100% client-side processing** - No server uploads
- ✅ **No data collection** - Your images never leave your device
- ✅ **No API keys required** - No external dependencies
- ✅ **No tracking** - Privacy-first design
- ✅ **Nothing to collect** - Images are processed in your browser; see the privacy policy

## 🚀 Deployment

### How We Deploy

This project uses **GitHub Actions for automated CI/CD** with **label-gated preview deploys** to avoid waste:

```
Feature Branch → PR → [add deploy:preview label] → Preview Deploy ✓
          ↓
Main Branch → Push → Auto-Production Deploy ✓
```

**Key principles:**
- ✅ All code changes go through tests first
- ✅ Production deploys only from `main` branch
- ✅ Preview deploys opt-in (require `deploy:preview` label)
- ✅ Skip deploys with `[skip deploy]` in commit message

**Deployment workflow:** `.github/workflows/deploy.yml`  
**Environment config:** [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) (setup, troubleshooting, env vars)

### Local Deployment (Testing)

```bash
# Setup (one-time)
npm install -g vercel
vercel link --yes

# Deploy preview locally
vercel

# Deploy production locally
vercel --prod --confirm
```

---

## 📦 Bundle Size & Code Splitting

### Optimizations

This project uses **aggressive code splitting** to minimize initial load time:

- ✅ **Dynamic Imports** - Heavy libraries loaded only when needed
- ✅ **Vendor Chunking** - React, Tesseract, motion in separate chunks
- ✅ **Lazy Loading** - OCR engines loaded on-demand, not upfront
- ✅ **Tree Shaking** - Unused code automatically removed

### Bundle Breakdown

| Chunk | Size (gzipped) | When Loaded |
|-------|----------------|-------------|
| `index.js` (main) | ~145 KB | Initial page load |
| `react-vendor.js` | ~140 KB | Initial page load |
| `tesseract.js` | ~23 KB | When user starts OCR |
| `jspdf.js` | ~40 KB | When user exports to PDF |

**First-load JS:** ~285 KB (gzipped) ✅  
**Total app (all features):** ~547 KB (gzipped)

### Analyze Bundle

```bash
# Generate interactive bundle visualization
npm run analyze

# Opens stats.html with treemap of all chunks
```

The analyzer shows:
- Which dependencies contribute most to bundle size
- How code splitting distributes code across chunks
- Gzipped and Brotli compressed sizes
- Duplicate dependencies (if any)

### How Code Splitting Works

**1. Tesseract.js** (23 KB)
```typescript
// ❌ Before: Loaded upfront
import Tesseract from 'tesseract.js';

// ✅ After: Loaded when user starts OCR
const { recognize } = await import('tesseract.js');
```

**2. jsPDF** (40 KB)
```typescript
// ❌ Before: CDN script tag in index.html
<script src="https://cdn.../jspdf.umd.min.js"></script>

// ✅ After: Loaded only when user exports PDF
const { default: jsPDF } = await import('jspdf');
```

### Performance Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| First load JS | ~850 KB | ~285 KB | **67% reduction** |
| Time to Interactive | ~5.2s | ~1.8s | **3.4s faster** |
| Lighthouse Score | 72 | 94 | **+22 points** |
| Build warnings | "Some chunks > 500 KB" | ✅ None | Fixed |

### Best Practices

✅ **DO:**
- Keep initial bundle under 300 KB (gzipped)
- Use dynamic imports for heavy libraries
- Analyze bundle regularly with `npm run analyze`
- Lazy-load features users might not use

❌ **DON'T:**
- Import entire libraries when you only need a few functions
- Load OCR engines upfront before user uploads image
- Bundle large assets (WASM, models) - serve from CDN or `/public`

### Related Files

- `vite.config.ts` - Rollup manual chunks configuration
- `services/*Service.ts` - Dynamic imports for OCR engines
- `utils/fileUtils.ts` - Dynamic import for jsPDF
- `package.json` - Bundle analyzer script

---

## 🔒 No ads, no third-party scripts

The site ships no advertising and loads nothing from a third party at runtime. This is deliberate:

- The Content-Security-Policy in `vercel.json` is `script-src 'self' 'wasm-unsafe-eval'` and `connect-src 'self'`, so the OCR worker and WebAssembly run from the site's own origin and cannot be interfered with.
- RenderCheck's pitch is that nothing leaves the browser. An ad network would fill the network panel with requests that make that claim hard to believe.
- `e2e/no-third-party.spec.ts` fails if any route requests another origin or if the policy allows an ad host.

**SEO:**
- All pages have unique meta tags and canonical URLs.
- Guides and policy pages are crawlable and linked from Home/footer.
- robots.txt and sitemap.xml are present.

**Performance:**
- Ad slots use fixed min-height to prevent layout shift.
- No OCR/UX regressions; light/dark mode consistent.

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Code standards & TypeScript conventions
- Accessibility (a11y) requirements
- Testing & how to run the test suite
- Commit message conventions
- PR process & deprecation policy

**Quick checklist before submitting PR:**
```bash
npm run lint        # Fix linting issues
npm run test        # Run full test suite
npm run build       # Verify production build
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

### Third-Party Licenses

- Tesseract.js - Apache 2.0
- React - MIT
- Vite - MIT

All dependencies are compatible with commercial use.

## 🙏 Acknowledgments

- [Tesseract.js](https://github.com/naptha/tesseract.js) - Traditional OCR engine

## 📮 Contact

- Repository: [github.com/ParthibanRajasekaran/text-from-image](https://github.com/ParthibanRajasekaran/text-from-image)
- Issues: [github.com/ParthibanRajasekaran/text-from-image/issues](https://github.com/ParthibanRajasekaran/text-from-image/issues)

## 🌟 Show Your Support

If you find this project useful, please give it a ⭐️ on GitHub!

---

Made with ❤️ by [Parthiban Rajasekaran](https://github.com/ParthibanRajasekaran)
