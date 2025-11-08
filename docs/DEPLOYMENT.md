# 🚀 Deployment Guide

**Complete guide for deploying this Vite + React app to Vercel with zero drift and controlled deploys.**

---

## Table of Contents

- [Quick Start: Deploy Local Snapshot](#quick-start-deploy-local-snapshot)
- [GitHub Actions Setup](#github-actions-setup)
- [Environment Variables](#environment-variables)
- [Deployment Strategy](#deployment-strategy)
- [Bundle Size Monitoring](#bundle-size-monitoring)
- [Troubleshooting](#troubleshooting)

---

## Quick Start: Deploy Local Snapshot

Deploy your EXACT working tree (what you see locally) to production:

```bash
# First time setup
npm run vercel:link        # Link to your Vercel project
npm run vercel:pull:prod   # Pull production environment variables

# Deploy to production
npm run deploy:prod
```

This ensures **zero drift** - what you test locally is what goes live.

### What it does:
1. ✅ Links to your Vercel project (interactive first time)
2. ✅ Pulls production environment variables to `.vercel/`
3. ✅ Builds with exact same command as production
4. ✅ Deploys current working tree (includes uncommitted changes)
5. ✅ Shows deployed URL and commit SHA

### Verification:
After deployment, visit your site and check the footer:
- Footer should show: `v{commit-sha}`
- This matches your local: `git rev-parse --short HEAD`
- If different, clear browser cache (Cmd+Shift+R / Ctrl+F5)

---

## GitHub Actions Setup

Automated deployments via GitHub Actions with controlled triggers.

### Required Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Description | How to get it |
|--------|-------------|---------------|
| `VERCEL_TOKEN` | Vercel API token | Create at https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | Your Vercel team/org ID | Run `vercel link` locally, then check `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Your Vercel project ID | Run `vercel link` locally, then check `.vercel/project.json` |

**Finding ORG_ID and PROJECT_ID:**
```bash
# Run this locally:
vercel link --yes

# Check the generated file:
cat .vercel/project.json
# {
#   "projectId": "prj_...",   ← VERCEL_PROJECT_ID
#   "orgId": "team_..."       ← VERCEL_ORG_ID  
# }
```

### Deployment Triggers

#### Preview Deployments (Pull Requests)
```bash
# Only deploys when PR has this label:
deploy:preview
```

- ✅ Triggered by: Adding `deploy:preview` label to PR
- ✅ Path filters: Only deploys if app files changed (not docs)
- ✅ Concurrency: Cancels old builds for same PR
- ✅ Result: Preview URL posted as PR comment

**How to use:**
1. Create a pull request
2. Add label: `deploy:preview`
3. Wait for deployment (~2 min)
4. Preview URL appears in PR comment

#### Production Deployments (Main Branch)
```bash
# Automatically deploys on push to main
git commit -m "feat: new feature"
git push origin main

# OR skip deployment:
git commit -m "docs: update README [skip deploy]"
git push origin main
```

- ✅ Triggered by: Push to `main` branch
- ✅ Skip with: `[skip deploy]` in commit message
- ✅ Path filters: Only deploys if app files changed
- ✅ Result: Deployed to production domain

#### Manual Deployment
```bash
# GitHub UI: Actions → Deploy to Vercel → Run workflow
```

---

## Environment Variables

### Local Development (`.env.local`)

Create a `.env.local` file (not committed to git):

```bash
# Feature Flags
VITE_UX_V2=true                    # Enable enhanced UI with history drawer
VITE_UX_V3=false                   # Premium aurora background UI
VITE_DEBUG=false                   # Verbose logging

# OCR Configuration
VITE_OCR_MIN_CONFIDENCE=60         # Tesseract confidence threshold
VITE_OCR_MIN_TEXT_LENGTH=3         # Minimum text length

# Analytics (auto-enabled in production)
VITE_ANALYTICS_ENABLED=false       # Disable in development
```

### Vercel Production (Project Settings)

Go to **Vercel Dashboard → Project → Settings → Environment Variables**:

Add for **Production** environment:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_UX_V2` | `true` | Enhanced UI (production) |
| `VITE_ANALYTICS_ENABLED` | `true` | Enable Web Vitals tracking |
| `VITE_OCR_MIN_CONFIDENCE` | `60` | Confidence threshold |

**Important:** 
- Variables are replaced at BUILD TIME, not runtime
- Must have `VITE_` prefix to be accessible client-side
- After adding variables, redeploy: `npm run deploy:prod`

### Feature Flags Reference

All flags are centralized in `lib/config/flags.ts`:

```typescript
import { FLAGS } from '@/lib/config/flags';

if (FLAGS.UX_V2_ENABLED) {
  // Enhanced UI
}

if (FLAGS.IS_PRODUCTION) {
  // Production-only code
}
```

---

## Deployment Strategy

### Preventing Accidental Deploys

This project uses **gated deployments** to avoid burning Vercel's free tier:

1. **GitHub Actions controls all deploys**
   - Preview: Only when PR labeled `deploy:preview`
   - Production: Only on main push (or manual trigger)
   
2. **Path filters skip docs-only changes**
   - Changes to `README.md`, `docs/`, etc. don't trigger deploys
   - Implemented in: `.github/workflows/deploy.yml` + `scripts/should-build.mjs`

3. **Smart build detection**
   - `vercel.json` uses `ignoreCommand` to skip unnecessary builds
   - Checks git diff between commits to determine if app files changed

### Drift Prevention

**Problem:** Production shows old commit while `main` has newer code

**Solution:** CLI-driven deploys ensure working tree is deployed

```bash
# Always deploy working tree (not just git commits)
npm run deploy:prod

# This includes:
# - Committed changes
# - Uncommitted changes (intentional!)
# - Current branch state
```

**Verification checklist:**
1. Check footer version: `v{commit-sha}`
2. Test critical flows: Upload → OCR → Download
3. Check browser console for errors
4. Verify bundle sizes reasonable (no >500KB warnings)

---

## Bundle Size Monitoring

### Current Bundle Budget

| Chunk Type | Limit (gzipped) | Current |
|------------|----------------|---------|
| Initial route chunks | ≤ 300 KB | ~102 KB ✅ |
| React vendor | ≤ 150 KB | ~87 KB ✅ |
| Total first-load | ≤ 450 KB | ~280 KB ✅ |
| Lazy chunks | No limit | 204 KB (transformers) |

### Check Bundle Size

```bash
# Build and check budgets
npm run build
node scripts/check-bundle.mjs

# Visualize bundle with treemap
npm run analyze
# Opens stats.html with interactive bundle visualization
```

### Bundle Size Enforcement

Budget checks run automatically in CI:
- ✅ Fails build if initial chunks exceed 300 KB gzipped
- ✅ Warns if approaching limits (>80% of budget)
- ⚠️ Can be set to `continue-on-error: true` to warn without blocking

**Adjusting budgets:**
Edit `scripts/check-bundle.mjs`:
```javascript
const MAX_INITIAL_CHUNK_KB = 300;  // Increase if needed
const MAX_REACT_VENDOR_KB = 150;   // Framework overhead
const MAX_TOTAL_INITIAL_KB = 450;  // All initial chunks
```

### Code Splitting Strategy

Heavy libraries are lazy-loaded:

```typescript
// ❌ Don't: Loads 200KB immediately
import { pipeline } from '@xenova/transformers';

// ✅ Do: Loads only when user needs it
const loadTransformers = async () => {
  const { pipeline } = await import('@xenova/transformers');
  return pipeline(/* ... */);
};
```

**Currently split:**
- ✅ `tesseract.js` - Loaded on image upload
- ✅ `@xenova/transformers` - Loaded as AI fallback
- ✅ `jspdf` - Loaded on PDF export
- ✅ `framer-motion` - Separate chunk for animations
- ✅ React - Separate vendor chunk

---

## Troubleshooting

### Build Fails Locally

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite node_modules/.vite

# Try building
npm run build
```

### Deployment Shows Wrong Version

**Symptom:** Footer shows old commit SHA

**Solution:**
```bash
# 1. Clear Vercel cache
vercel --force

# 2. Deploy fresh
npm run deploy:prod

# 3. Clear browser cache
# Chrome/Edge: Cmd+Shift+R (Mac) / Ctrl+F5 (Windows)
# Safari: Cmd+Option+E then Cmd+R
```

### Build Fails in CI but Works Locally

**Cause:** Environment variables not set in Vercel

**Solution:**
1. Check Vercel Dashboard → Environment Variables
2. Ensure `VITE_*` variables are set for Production
3. Redeploy after adding variables

### Bundle Size Too Large

```bash
# 1. Analyze what's using space
npm run analyze

# 2. Check for duplicates
npm ls @xenova/transformers
npm ls tesseract.js

# 3. Verify dynamic imports
grep -r "await import" services/

# 4. Check if WASM is bundled (shouldn't be)
grep -r "\.wasm" dist/
```

---

## Architecture Decisions

### Why CLI Deploys?

**Problem:** Vercel auto-deploys every push → burns free tier quota

**Solution:** GitHub Actions + labels + path filters control deploys

### Why Working Tree Deploys?

**Problem:** Production drift when git has unpushed changes

**Solution:** `npm run deploy:prod` deploys exact working tree

### Why Bundle Budgets?

**Problem:** Gradual bundle bloat kills performance

**Solution:** CI fails builds exceeding 300 KB initial chunks

---

## Quick Reference

```bash
# Local Development
npm run dev                 # Start dev server
npm run build               # Build for production
npm run preview             # Preview production build

# Deployment
npm run vercel:link         # Link to Vercel project (first time)
npm run vercel:pull:prod    # Pull production env vars
npm run deploy:prod         # Deploy to production

# Bundle Analysis
npm run analyze             # Open bundle visualizer
node scripts/check-bundle.mjs  # Check bundle budgets

# Testing
npm test                    # Run tests
npm run test:coverage       # Coverage report
```

---

## Support

- **Vite Docs:** https://vitejs.dev/
- **Vercel Docs:** https://vercel.com/docs
- **GitHub Actions:** https://docs.github.com/en/actions

For project-specific issues, check:
- `docs/ERROR_HANDLING_GUIDE.md` - Error handling patterns
- `docs/ENHANCEMENT_PLAN.md` - Roadmap and features
- `README.md` - Main project documentation
