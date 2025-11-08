# 🚀 Deployment Guide

**Status:** Production Ready  
**Last Updated:** November 8, 2025

---

## Quick Deploy

```bash
# Deploy to production (requires setup)
npm run deploy:prod

# Verify deployment
npm run verify:prod
```

---

## Table of Contents

1. [One-Time Setup](#one-time-setup)
2. [Daily Workflow](#daily-workflow)
3. [Deploy Gates](#deploy-gates)
4. [Manual Deployment](#manual-deployment)
5. [GitHub Actions](#github-actions)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)
8. [Environment Variables](#environment-variables)

---

## One-Time Setup

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Link to Vercel Project

```bash
vercel link --yes
```

This creates `.vercel/project.json` with your project IDs.

### 3. Configure GitHub Secrets

**Required for GitHub Actions workflow:**

Go to: Repository Settings → Secrets and variables → Actions

Add these secrets:

| Secret | How to Get |
|--------|------------|
| `VERCEL_TOKEN` | Create at https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | From `.vercel/project.json` after running `vercel link` |
| `VERCEL_PROJECT_ID` | From `.vercel/project.json` after running `vercel link` |

Example `.vercel/project.json`:
```json
{
  "orgId": "team_abc123",        ← Use this for VERCEL_ORG_ID
  "projectId": "prj_xyz456"      ← Use this for VERCEL_PROJECT_ID
}
```

### 4. (Optional) Disable Vercel Auto-Deploy

To fully control deployments via GitHub Actions:

1. Go to Vercel Dashboard → Project → Settings → Git
2. Uncheck "Automatic Deployments from Git"
3. Or rely on `ignoreCommand` in `vercel.json` (already configured)

---

## Daily Workflow

### Deploy a Feature Preview

```bash
# 1. Create feature branch
git checkout -b feat/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Push to GitHub
git push origin feat/my-feature

# 4. Create PR on GitHub

# 5. Add 'deploy:preview' label to PR
#    → Preview URL commented automatically
```

### Deploy to Production

```bash
# Option A: Via GitHub (recommended)
git checkout main
git merge feat/my-feature
git push origin main
# → Auto-deploys to production

# Option B: Via CLI
npm run deploy:prod
```

### Skip Deployment

```bash
# Add [skip deploy] to commit message
git commit -m "docs: update README [skip deploy]"
git push origin main
# → No deployment triggered
```

---

## Deploy Gates

**Three layers of protection to save deploys:**

### Layer 1: Commit Message

Add `[skip deploy]` or `[skip ci]` to skip:
```bash
git commit -m "chore: update deps [skip deploy]"
```

### Layer 2: Path Filters (GitHub Actions)

Automatically skips if only these changed:
- `README.md`, `CHANGELOG.md`, `LICENSE`
- `docs/**`, `.github/**`, `.vscode/**`
- `*.md`, `*.txt` files

Deploys if these changed:
- `app/`, `pages/`, `components/`
- `lib/`, `hooks/`, `services/`
- `utils/`, `types/`, `public/`
- `*.config.*`, `package.json`

### Layer 3: Vercel ignoreCommand

`scripts/should-build.mjs` double-checks on Vercel's servers:
- Compares git diff between commits
- Skips if only docs changed
- Conservative fallback (deploys if uncertain)

---

## Manual Deployment

### Deploy Current Code

```bash
# Deploy production
vercel --prod

# Or use the helper script
npm run deploy:prod
```

### Deploy Specific Branch

```bash
# Switch to branch
git checkout feat/my-feature

# Deploy as preview
vercel

# Deploy as production
vercel --prod
```

### Pull Production Settings

```bash
npm run vercel:pull:prod
```

This downloads production environment variables to `.vercel/.env.production.local`

---

## GitHub Actions

### Workflow File

`.github/workflows/deploy.yml` contains two jobs:

**1. Preview Deploy (label-gated)**
- Triggers: PR with `deploy:preview` label
- Skips: If only docs changed
- Cancels: Previous preview for same PR
- Comments: Preview URL on PR

**2. Production Deploy**
- Triggers: Push to `main` (unless `[skip deploy]`)
- Skips: If only docs changed
- Single: Only one production deploy at a time

### Create Deploy Label

```bash
# Via GitHub CLI
gh label create "deploy:preview" --color "0e8a16" --description "Deploy preview for this PR"

# Or manually in GitHub:
# Repository → Labels → New label
# Name: deploy:preview
# Color: Green
```

### Workflow Triggers

**Preview:**
- PR opened/reopened/synchronized
- Label `deploy:preview` added
- App files changed (not just docs)

**Production:**
- Push to `main` branch
- Commit doesn't have `[skip deploy]`
- App files changed
- Manual workflow dispatch

### View Workflow Runs

```bash
# Via GitHub CLI
gh run list

# Or in GitHub:
# Actions tab → Deploy (Vercel-gated)
```

---

## Verification

### Check Deployment Status

```bash
# Verify production matches local
npm run verify:prod

# Or check specific URL
npm run verify:prod https://your-domain.com
```

### Check Footer Version

Visit your site and check the footer:
- Should show: `v{commit-sha}` (e.g., `vb73e114`)
- If shows "dev", version detection failed

### Manual Checks

1. **Hard refresh browser:**
   - Mac: `Cmd + Shift + R`
   - Windows/Linux: `Ctrl + F5`

2. **Check current commit:**
   ```bash
   git rev-parse --short HEAD
   ```

3. **Compare with footer version**

### Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Check "Deployments" tab
4. Verify latest deployment is assigned to production

---

## Troubleshooting

### Issue: Production Shows Old Version

**Solutions:**

1. **Hard refresh browser** (clear CDN cache)
   - Mac: `Cmd + Shift + R`
   - Windows: `Ctrl + F5`

2. **Wait 1-2 minutes** for CDN propagation

3. **Check Vercel dashboard**
   - Ensure latest deployment assigned to production domain

4. **Verify with curl:**
   ```bash
   curl -I https://freetextfromimage.com
   ```

### Issue: Build Fails on Vercel

**Solutions:**

1. **Test locally:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Check build logs** in Vercel dashboard

3. **Verify Node version:**
   - Vercel uses Node 18+ by default
   - Set in: Project Settings → General → Node.js Version

4. **Check environment variables:**
   - Project Settings → Environment Variables

### Issue: Different Behavior Dev vs Prod

**Solutions:**

1. **Test production build locally:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Check environment variables** are same in:
   - Local: `.env.local`
   - Vercel: Project Settings → Environment Variables

3. **Don't use NODE_ENV for behavior changes**
   - Use explicit environment variables instead

### Issue: Preview Not Deploying

**Solutions:**

1. **Check PR has `deploy:preview` label**

2. **Check PR title doesn't have `[skip deploy]`**

3. **Verify app files changed** (not just docs)

4. **Check GitHub Actions logs**
   - See which paths triggered/skipped

### Issue: Hitting Rate Limits

**Problem:** Vercel free tier = 100 CLI deploys/day

**Solutions:**

1. **Use Git integration** (unlimited deploys)
   ```bash
   git push origin main
   ```

2. **Use labels for previews** (already implemented)

3. **Skip docs-only changes** (already implemented)

4. **Use `[skip deploy]` for non-code changes**

---

## Environment Variables

### Required for Build

| Variable | Set By | Description |
|----------|--------|-------------|
| `VITE_COMMIT` | Vite (auto) | Git commit SHA for version display |
| `VITE_BUILD_TIME` | Vite (auto) | Build timestamp |

### Optional Features

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `VITE_UX_V2` | `1` or unset | unset | Enable history drawer |
| `VITE_UX_V3` | `1` or unset | unset | Enable glass UI |

### Set in Vercel

1. Go to: Project Settings → Environment Variables
2. Add variables for: Production, Preview, Development
3. Redeploy to apply changes

### Local Development

Create `.env.local`:
```env
VITE_UX_V2=1
VITE_UX_V3=1
```

---

## Pre-Deployment Checklist

Before deploying:

- [ ] All tests passing: `npm test`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Build succeeds: `npm run build`
- [ ] Local preview works: `npm run preview`
- [ ] Version displays in footer
- [ ] Environment variables configured
- [ ] GitHub secrets added (for Actions)

---

## Post-Deployment Checklist

After deploying:

- [ ] Site loads at production URL
- [ ] Footer shows correct commit SHA
- [ ] All pages accessible
- [ ] File upload works
- [ ] Text extraction works
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Dark mode works

---

## Deploy Savings

**Before:** ~100 deploys/day (rate limit)
- Every commit → Deploy
- Every PR commit → Preview
- Docs updates → Wasted deploys

**After:** ~5-15 deploys/day
- Feature PRs → Only when labeled
- Docs-only → Auto-skipped
- WIP commits → No deploy

**Savings:** 70-90% reduction 🎉

---

## Architecture

### Files Involved

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml              # Gated workflow
├── scripts/
│   ├── deploy-prod.mjs             # CLI deploy script
│   ├── verify-prod.mjs             # Verification script
│   └── should-build.mjs            # Smart build detection
├── lib/
│   └── version.ts                  # Version info for footer
├── vercel.json                     # Vercel config + ignoreCommand
├── vite.config.ts                  # Inject VITE_COMMIT at build
└── App.tsx                         # Display version in footer
```

### Deploy Flow

```
1. Developer pushes to main
   ↓
2. GitHub Actions triggered
   ↓
3. Path filter checks changed files
   ↓ (app files changed)
4. Vercel build triggered
   ↓
5. should-build.mjs double-checks
   ↓ (proceed)
6. Vite build with commit SHA
   ↓
7. Deploy to Vercel
   ↓
8. Production URL updated
   ↓
9. CDN propagates (1-2 min)
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Deploy to production | `npm run deploy:prod` |
| Verify deployment | `npm run verify:prod` |
| Link to Vercel | `npm run vercel:link` |
| Pull prod settings | `npm run vercel:pull:prod` |
| Test build locally | `npm run build && npm run preview` |
| Skip deployment | Add `[skip deploy]` to commit message |

---

## Support

- **Documentation:** [README.md](README.md)
- **Vercel Docs:** https://vercel.com/docs
- **GitHub Actions:** https://docs.github.com/actions

---

**Last Updated:** November 8, 2025  
**Maintained By:** Development Team
