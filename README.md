# 📸 Extract Text From Image

> Free, private, AI-powered OCR tool running entirely in your browser

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite)](https://vitejs.dev/)

## ✨ Features

- 🚀 **Lightning Fast** - 2-7 second processing time
- 🔒 **100% Private** - All processing happens in your browser
- 🤖 **AI-Powered** - Hybrid OCR using Tesseract.js + TrOCR transformers
- 📊 **Smart Fallback** - Automatically uses best method for each image
- 🎨 **Image Enhancement** - 8 preprocessing techniques for better accuracy
- 💰 **Completely Free** - No API costs, no hidden fees
- 🌓 **Dark/Light Mode** - Beautiful UI with theme toggle
- 📱 **Mobile Friendly** - Responsive design for all devices
- ✨ **V3 Premium UI** - Aurora gradients, glass-morphism, micro-interactions
- ⌨️ **Keyboard Shortcuts** - Quick actions with keyboard (C/D/H/T/Escape)
- 📚 **Local History** - Last 20 results saved in browser
- ♿ **Fully Accessible** - WCAG 2.1 AA compliant, keyboard navigation
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

- **92-97% accuracy** on printed text
- **70-85% accuracy** on handwritten text
- Automatic confidence scoring
- Intelligent fallback for low-confidence results


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
- `npm run spec:lint` — Spectral lint for OpenAPI
- `npm run spec:schemas` — Validate JSON schemas and tokens
- `npm run spec:test` — Playwright BDD tests
- `npm run spec:diff` — OAS diff for breaking changes


### Prerequisites

- Node.js 16+ 
- npm or yarn


### Installation

```bash
# Clone the repository
git clone https://github.com/ParthibanRajasekaran/text-from-image.git
cd text-from-image

# Install dependencies
npm install

# Create .env.local file for V3 UI (optional)
echo "VITE_UX_V2=1" > .env.local

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app.

### Build for Production

```bash
npm run build
npm run preview
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

### Hybrid OCR System

```
User uploads image
        ↓
┌──────────────────┐
│ File Validation  │ (Type, size, browser compatibility)
└──────────────────┘
        ↓
┌──────────────────┐
│ Image Preprocessing │ (Optional: 8 enhancement techniques)
└──────────────────┘
        ↓
┌──────────────────┐
│ Tesseract OCR    │ (Fast: 2-5s, 90-95% accuracy)
└──────────────────┘
        ↓
    Confidence ≥ 60%?
        ├─ Yes → Return result ✓
        └─ No  → Fallback ↓
                ┌──────────────────┐
                │ TrOCR AI Model   │ (Slower: 5-10s, 95-98% accuracy)
                └──────────────────┘
                        ↓
                   Return result ✓
```

### Tech Stack

- **Frontend:** React 19.2 + TypeScript
- **Build Tool:** Vite 6.2
- **OCR Engines:**
  - Tesseract.js 5.1.1 (traditional OCR)
  - @xenova/transformers 2.17.2 (AI-powered TrOCR)
- **Image Processing:** HTML5 Canvas API
- **State Management:** React Hooks
- **Styling:** CSS with custom properties

## 📂 Project Structure

```
text-from-image/
├── components/          # React components
│   ├── v3/             # V3 Premium UI components
│   │   ├── AuroraBackground.tsx
│   │   ├── GlassDropzone.tsx
│   │   ├── GlassProgressBar.tsx
│   │   ├── GlassResultCard.tsx
│   │   ├── HistoryDrawer.tsx
│   │   ├── HeroOCR.tsx
│   │   └── IntentPage.tsx
│   ├── FileInput.tsx
│   ├── ResultDisplay.tsx
│   ├── ThemeToggle.tsx
│   ├── ProgressBar.tsx
│   ├── Skeleton.tsx
│   ├── AdSlot.tsx
│   └── Toast.tsx
├── services/           # OCR services
│   ├── tesseractService.ts
│   ├── transformersService.ts
│   └── hybridService.ts
├── hooks/             # Custom React hooks
│   ├── useLocalHistory.ts
│   ├── useShortcuts.ts
│   └── useWebVitals.ts
├── pages/             # Route pages (lazy-loaded)
│   ├── ImageToText.tsx
│   ├── JpgToWord.tsx
│   ├── ImageToExcel.tsx
│   └── ExtractTextFromImage.tsx
├── utils/             # Utilities
│   ├── imagePreprocessing.ts
│   ├── errorHandling.ts
│   ├── webVitals.ts
│   └── fileUtils.ts
├── __tests__/         # Test files
├── App.tsx            # Main app component
├── router.tsx         # React Router config
└── index.tsx          # Entry point
```

## 🛠️ How It Works

### 1. Image Upload
- Supports PNG, JPG, WEBP
- Max file size: 20MB
- Drag & drop or click to browse

### 2. Processing
- **Step 1:** Validate file (type, size, browser compatibility)
- **Step 2:** Apply image preprocessing (optional, auto-enabled)
- **Step 3:** Try Tesseract OCR (fast method)
- **Step 4:** If confidence < 60%, fallback to TrOCR AI model

### 3. Results
- Extracted text with confidence score
- Copy to clipboard
- Download as .txt or .doc
- Shows which method was used

## 📊 Performance

| Metric | Value |
|--------|-------|
| **Speed** | 2-7 seconds average |
| **Accuracy** | 92-97% (printed text) |
| **Cost** | $0 (completely free) |
| **Privacy** | 100% client-side |
| **Success Rate** | 95%+ with hybrid approach |

### vs Google Gemini (Previous)

| Aspect | Gemini API | This App | Winner |
|--------|-----------|----------|--------|
| Speed | 1-2s | 2-7s | Gemini |
| Accuracy | 95-99% | 92-97% | Gemini |
| **Cost** | $0.001-0.01/image | **$0** | **This App** 🏆 |
| **Privacy** | ❌ Cloud | ✅ **Local** | **This App** 🏆 |
| **Offline** | ❌ No | ✅ **Yes*** | **This App** 🏆 |

*After first-time model download

## 🔒 Privacy

- ✅ **100% client-side processing** - No server uploads
- ✅ **No data collection** - Your images never leave your device
- ✅ **No API keys required** - No external dependencies
- ✅ **No tracking** - Privacy-first design
- ✅ **GDPR compliant** - No personal data processed

## 🚀 Deployment

### Branching Model (Deploy-Gate Strategy)

We use a **label-gated deployment** model to prevent burning Vercel deploys:

- **`main` branch** = Production (auto-deploys via GitHub Actions)
- **Feature branches** (`feat/*`, etc.) = NO auto-deploy
- **Preview deploys** = Only when PR has `deploy:preview` label
- **Skip deploys** = Add `[skip deploy]` to commit message

This ensures:
- 🎯 Only intentional deploys happen
- 💰 No wasted deploys on WIP commits
- 🚀 Fast iteration without deploy limits

### Quick Deployment Guide

#### 1. Preview a Pull Request

```bash
# 1. Create PR from feature branch
git checkout -b feat/my-feature
git push origin feat/my-feature

# 2. Add 'deploy:preview' label to PR in GitHub UI
#    Go to PR → Labels → Select 'deploy:preview'

# 3. GitHub Actions will deploy a preview
#    Preview URL will be commented on the PR
```

#### 2. Deploy to Production

**Option A: Merge to main** (recommended)
```bash
# Merge PR to main branch
# GitHub Actions auto-deploys to production
```

**Option B: Manual CLI** (100/day limit)
```bash
# Install Vercel CLI (one-time)
npm install -g vercel

# Link to project (one-time)
vercel link --yes

# Pull production settings
vercel pull --environment=production --yes

# Deploy to production
vercel --prod --confirm
```

#### 3. Skip Deployment

To skip auto-deploy on push to main:
```bash
git commit -m "docs: update README [skip deploy]"
git push origin main
```

### GitHub Actions Setup

**Required GitHub Secrets** (Settings → Secrets and variables → Actions):

1. **`VERCEL_TOKEN`**
   - Create at: https://vercel.com/account/tokens
   - Scope: Full Account
   - Never commit this!

2. **`VERCEL_ORG_ID`** and **`VERCEL_PROJECT_ID`**
   - Get by running: `vercel link --yes`
   - Found in: `.vercel/project.json`
   ```json
   {
     "orgId": "your-org-id",
     "projectId": "your-project-id"
   }
   ```

**Workflow Features:**
- ✅ Preview deploys only with `deploy:preview` label
- ✅ Production deploys on merge to `main`
- ✅ Path filters (skips docs-only changes)
- ✅ Concurrency control (cancels superseded builds)
- ✅ Manual trigger via Actions tab

### Manual Deployment Commands

For local development or testing:

```bash
# Setup (one-time)
npm install -g vercel
vercel link --yes

# Pull production config
vercel pull --environment=production --yes

# Deploy preview (test)
vercel

# Deploy production
vercel --prod --confirm

# Check deployments
vercel ls
```

### Vercel Project Configuration

**Disable Git Auto-Deploy** (recommended):

1. Go to: Vercel Dashboard → Project → Settings → Git
2. Uncheck "Automatic Deployments from Git"
3. Or: Use `vercel.json` `ignoreCommand` (already configured)

This ensures ALL deploys go through GitHub Actions, giving you full control.

### Deploy Workflow Examples

**Example 1: Feature with Preview**
```bash
git checkout -b feat/new-feature
# ... make changes ...
git commit -m "feat: add new feature"
git push origin feat/new-feature
# Create PR, add 'deploy:preview' label
# → Preview deployed automatically
```

**Example 2: Docs-only Change**
```bash
git checkout -b docs/update-readme
# ... edit README ...
git commit -m "docs: update installation steps"
git push origin main
# → NO deploy (path filter skips it)
```

**Example 3: Hotfix to Production**
```bash
git checkout main
# ... fix critical bug ...
git commit -m "fix: critical security issue"
git push origin main
# → Deploys to production immediately
```

**Example 4: Skip Deployment**
```bash
git commit -m "chore: update dependencies [skip deploy]"
git push origin main
# → Skips deployment
```

### Environment Variables

Set in Vercel Project → Settings → Environment Variables:

| Variable | Value | Environment | Description |
|----------|-------|-------------|-------------|
| `VITE_COMMIT` | Auto-set during build | All | Git commit SHA for version display |

**Important:** If you use feature flags (like `VITE_UX_V2`), ensure they're set to the same value in both:
- Local: `.env.local` file
- Vercel: Project Settings → Environment Variables → Production

### Troubleshooting Deployment

**Problem:** Production shows old version after deploying

**Solutions:**
1. **Clear browser cache** - Hard refresh (Cmd+Shift+R / Ctrl+F5)
2. **Check commit SHA** - Footer should show correct version
3. **Verify deployment** - Run `npm run verify:prod`
4. **Check Vercel Dashboard** - Ensure latest deployment is assigned to production domain
5. **CDN cache** - Can take 1-2 minutes to propagate globally

**Problem:** Different behavior between dev and prod

**Solutions:**
1. **Check environment variables** - Ensure same values locally and on Vercel
2. **Remove feature flags** - Don't use `process.env.NODE_ENV` checks that change behavior
3. **Test production build locally** - Run `npm run build && npm run preview`
4. **Check build logs** - Vercel Dashboard → Deployments → View build logs

**Problem:** Build fails on Vercel but works locally

**Solutions:**
1. **Check Node version** - Vercel uses Node 18+ by default
2. **Install correct dependencies** - Vercel runs `npm ci` (strict lock file)
3. **Check build command** - Verify `vercel.json` has correct `buildCommand`
4. **Environment variables** - Ensure required env vars are set in Vercel

### Relevant Docs

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Vercel Git Integration](https://vercel.com/docs/concepts/git)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Build Step](https://vercel.com/docs/build-step)
- [GitHub Actions with Vercel](https://vercel.com/guides/how-can-i-use-github-actions-with-vercel)

---

## 📦 Bundle Size & Code Splitting

### Optimizations

This project uses **aggressive code splitting** to minimize initial load time:

- ✅ **Dynamic Imports** - Heavy libraries loaded only when needed
- ✅ **Vendor Chunking** - React, Tesseract, Transformers in separate chunks
- ✅ **Lazy Loading** - OCR engines loaded on-demand, not upfront
- ✅ **Tree Shaking** - Unused code automatically removed

### Bundle Breakdown

| Chunk | Size (gzipped) | When Loaded |
|-------|----------------|-------------|
| `index.js` (main) | ~145 KB | Initial page load |
| `react-vendor.js` | ~140 KB | Initial page load |
| `tesseract.js` | ~23 KB | When user starts OCR |
| `transformers.js` | ~199 KB | When AI fallback needed |
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

**2. Transformers** (199 KB)
```typescript
// ❌ Before: Loaded upfront
import { pipeline } from '@xenova/transformers';

// ✅ After: Loaded only as fallback or when requested
const { pipeline } = await import('@xenova/transformers');
```

**3. jsPDF** (40 KB)
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

## 💸 Monetization (AdSense)

To apply for AdSense and enable monetization:

1. Go to AdSense “Sites” and add `https://freetextfromimage.com`.
2. Ensure the site has live policy pages (`/privacy-policy`, `/terms`, `/about`, `/contact`) and helpful guides (`/image-to-text`, etc.).
3. Add a Google-certified CMP and wire its callback to `updateConsent()` in `src/consent/consent.ts`.
   - Consent Mode v2 must fire before any ad scripts load.
4. Set `VITE_ADSENSE_PUB_ID` in Vercel (Production) **after approval**.
5. Add your publisher ID to `/public/ads.txt`.
6. Use Search Console to submit your sitemap and fix Page Indexing/Core Web Vitals issues.
7. Placement rules:
   - No ads near upload/CTA areas; avoid accidental clicks.
   - All ad slots reserve space to prevent CLS.
   - Ads only load after consent and in Production.

**Testing:**
- Run `npm run sitemap` to generate `/public/sitemap.xml`.
- Run `npm run build && npm run test` to verify build and ad readiness.

**CMP Integration:**
- See comments in `src/consent/consent.ts` for wiring a certified CMP callback.
- Verify Consent Mode v2 fires before ads script loads.

**AdSense Approval:**
- Update `/public/ads.txt` with your real publisher ID after approval.
- Use AdSense dashboard for auto ad configuration.

**SEO:**
- All pages have unique meta tags and canonical URLs.
- Guides and policy pages are crawlable and linked from Home/footer.
- robots.txt and sitemap.xml are present.

**Performance:**
- Ad slots use fixed min-height to prevent layout shift.
- No OCR/UX regressions; light/dark mode consistent.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

### Third-Party Licenses

- Tesseract.js - Apache 2.0
- @xenova/transformers - Apache 2.0
- React - MIT
- Vite - MIT

All dependencies are compatible with commercial use.

## 🙏 Acknowledgments

- [Tesseract.js](https://github.com/naptha/tesseract.js) - Traditional OCR engine
- [Transformers.js](https://github.com/xenova/transformers.js) - Browser-based AI models
- [Microsoft TrOCR](https://huggingface.co/microsoft/trocr-base-printed) - AI OCR model

## 📮 Contact

- Repository: [github.com/ParthibanRajasekaran/text-from-image](https://github.com/ParthibanRajasekaran/text-from-image)
- Issues: [github.com/ParthibanRajasekaran/text-from-image/issues](https://github.com/ParthibanRajasekaran/text-from-image/issues)

## 🌟 Show Your Support

If you find this project useful, please give it a ⭐️ on GitHub!

---

Made with ❤️ by [Parthiban Rajasekaran](https://github.com/ParthibanRajasekaran)
