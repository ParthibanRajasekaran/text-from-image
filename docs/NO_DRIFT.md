# 🚫 Production Drift Prevention System

**Stop production from showing different UI/behavior than your local dev environment.**

---

## 🎯 Purpose

Ensure production **always** uses the **same version and UI** you see locally with `npm run dev`. No more surprises where prod shows the old UI while your local shows the new one.

---

## 📋 Quick Start

### 1️⃣ **Setup Environment Variables**

```bash
# Copy example to local development
cp .env.example .env.local

# Edit .env.local and set your values
# Make sure VITE_UX_V2=true for new UI
```

### 2️⃣ **Sync to Production**

```bash
# Set same variables in Vercel Dashboard:
# https://vercel.com/[your-project]/settings/environment-variables
# 
# Add: VITE_UX_V2 = true
# Environment: Production, Preview, Development
```

### 3️⃣ **Deploy**

```bash
npm run deploy:prod
```

### 4️⃣ **Verify**

```bash
# Full verification (production health + env sync)
npm run verify:full

# Or just check env differences
npm run vercel:pull:prod
npm run env:diff
```

---

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `npm run deploy:prod` | Deploy current working tree to production with commit SHA |
| `npm run verify:prod` | Verify production deployment and commit SHA |
| `npm run verify:full` | **Comprehensive check**: UI variant, env vars, build version |
| `npm run env:diff` | Compare local vs production environment variables |
| `npm run vercel:pull:prod` | Pull production environment variables from Vercel |

---

## 🔍 What Gets Checked

### ✅ `verify:full` - Comprehensive Verification

```bash
npm run verify:full
```

**Checks:**
- ✅ Production URL accessible
- ✅ Correct UI variant deployed (V2/V3)
- ✅ Build commit SHA matches local git commit
- ✅ Environment variables match between local and production
- ✅ No critical feature flag drift

**Exit Codes:**
- `0` - All checks passed, production matches local
- `1` - Critical issues (UI mismatch, env drift)
- `2` - Cannot connect to production

### ⚙️ `env:diff` - Environment Comparison

```bash
npm run env:diff
```

**Shows:**
- 🚨 **Critical differences** (UI-breaking flags like `VITE_UX_V2`)
- ⚠️ **Important differences** (behavior changes like `VITE_ANALYTICS_ENABLED`)
- ℹ️ **Build-time differences** (expected, like `VITE_COMMIT`)
- 📋 **Other differences** (non-critical)

**Exit Codes:**
- `0` - Environments match
- `1` - Critical differences found
- `2` - Cannot read environment files

---

## 📚 Feature Flags Reference

### 🎨 UI Variant Flags (CRITICAL)

| Variable | Values | Default | Impact |
|----------|--------|---------|--------|
| `VITE_UX_V2` | `'1'`, `'true'`, `'0'`, `'false'` | `false` | **Toggles entire UI** - `true` = New HeroOCR, `false` = Old classic |
| `VITE_UX_V3` | `'1'`, `'true'`, `'0'`, `'false'` | Falls back to `VITE_UX_V2` | Enables V3 premium UI (experimental) |

⚠️ **CRITICAL**: If `VITE_UX_V2` differs between local and production, you'll see completely different UIs!

### 📊 Analytics & Monitoring

| Variable | Values | Default | Impact |
|----------|--------|---------|--------|
| `VITE_ANALYTICS_ENABLED` | `'1'`, `'true'`, `'0'`, `'false'` | `true` | Web Vitals tracking |

### 🐛 Debugging

| Variable | Values | Default | Impact |
|----------|--------|---------|--------|
| `VITE_DEBUG` | `'1'`, `'true'`, `'0'`, `'false'` | `false` | Debug logging in console |

### 🎯 OCR Settings

| Variable | Values | Default | Impact |
|----------|--------|---------|--------|
| `VITE_OCR_MIN_CONFIDENCE` | `0-100` | `60` | Tesseract confidence threshold |
| `VITE_OCR_MIN_TEXT_LENGTH` | Number | `1` | Minimum text length to keep |

### 🔨 Build-Time Variables (Auto-Generated)

| Variable | Source | Impact |
|----------|--------|--------|
| `VITE_COMMIT` | `git rev-parse --short HEAD` | Displayed in footer for version tracking |
| `VITE_BUILD_TIME` | Current timestamp | Build time metadata |
| `VITE_VERCEL_GIT_COMMIT_SHA` | Vercel system | Vercel's commit reference |

ℹ️ **Note**: These are automatically injected by `vite.config.ts` - don't set them manually.

---

## 🚨 Common Issues & Solutions

### Issue 1: Production Shows Old UI, Local Shows New UI

**Symptom:**
- Local dev (`npm run dev`) shows new HeroOCR UI with aurora background
- Production shows old classic single-page UI

**Root Cause:**
- `VITE_UX_V2` not set in Vercel (defaults to `false` → old UI)

**Fix:**
```bash
# 1. Verify local environment
cat .env.local | grep VITE_UX_V2
# Should show: VITE_UX_V2=true

# 2. Check production environment
npm run vercel:pull:prod
npm run env:diff

# 3. If different, go to Vercel Dashboard:
# https://vercel.com/[project]/settings/environment-variables
# Add: VITE_UX_V2 = true (Environment: Production)

# 4. Redeploy
npm run deploy:prod

# 5. Verify
npm run verify:full
```

### Issue 2: Changes Not Appearing After Redeploy

**Symptom:**
- Updated environment variables in Vercel
- Redeployed
- Still seeing old behavior

**Root Cause:**
- Vite replaces environment variables at **BUILD TIME**, not runtime
- Browser cache showing old version

**Fix:**
```bash
# 1. Ensure env vars are set in Vercel for correct environment
# 2. Trigger fresh build
npm run deploy:prod

# 3. Hard refresh browser
# Mac: Cmd+Shift+R
# Windows: Ctrl+Shift+R

# 4. Check build version in footer matches local
git rev-parse --short HEAD  # Local commit
# Compare with footer on production site
```

### Issue 3: Cannot Pull Production Environment

**Symptom:**
```bash
npm run vercel:pull:prod
# Error: Not linked to a Vercel project
```

**Fix:**
```bash
# Link to Vercel project first
npm run vercel:link

# Then pull production env
npm run vercel:pull:prod
```

### Issue 4: env:diff Shows "Production env not found"

**Symptom:**
```bash
npm run env:diff
# ❌ Production env not found
```

**Fix:**
```bash
# Pull production environment first
npm run vercel:pull:prod

# Then compare
npm run env:diff
```

---

## 📖 Workflow Examples

### 🆕 New Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/new-ui-component

# 2. Develop locally with correct env
npm run dev  # Uses .env.local

# 3. Before deploying, verify environment
npm run vercel:pull:prod
npm run env:diff

# 4. If environments differ, update Vercel Dashboard first

# 5. Deploy
npm run deploy:prod

# 6. Verify production matches
npm run verify:full
```

### 🐛 Debug Production Issue

```bash
# 1. Pull production environment
npm run vercel:pull:prod

# 2. Compare with local
npm run env:diff

# 3. If UI differs, check specific flag
cat .env.local | grep VITE_UX_V2
cat .vercel/.env.production.local | grep VITE_UX_V2

# 4. Test production environment locally
cp .vercel/.env.production.local .env.local
npm run dev

# 5. If issue reproduces, fix code
# If issue doesn't reproduce, it's an env var problem

# 6. Restore local env
git checkout .env.local
```

### 🔄 Update Production Environment

```bash
# 1. Update local environment
echo "VITE_UX_V2=true" >> .env.local

# 2. Test locally
npm run dev

# 3. Update Vercel Dashboard
# https://vercel.com/[project]/settings/environment-variables

# 4. Deploy
npm run deploy:prod

# 5. Verify
npm run verify:full

# 6. Check diff is clear
npm run vercel:pull:prod
npm run env:diff
# Should show: ✅ ENVIRONMENTS MATCH
```

---

## 📁 Files Reference

### Configuration Files

| File | Purpose | Version Control |
|------|---------|----------------|
| `.env.example` | Template with all required variables | ✅ Committed |
| `.env.local` | Your local development values | ❌ Gitignored |
| `.vercel/.env.production.local` | Pulled from Vercel (after `vercel:pull:prod`) | ❌ Gitignored |

### Scripts

| Script | Location | Purpose |
|--------|----------|---------|
| `deploy-prod.mjs` | `scripts/` | Deploy with commit SHA tracking |
| `verify-prod.mjs` | `scripts/` | Verify deployment and commit |
| `verify-full.mjs` | `scripts/` | Comprehensive verification (new) |
| `env-diff.mjs` | `scripts/` | Compare environments (new) |
| `check-bundle.mjs` | `scripts/` | Bundle size analysis |
| `should-build.mjs` | `scripts/` | Smart build skipping |

### Documentation

| File | Purpose |
|------|---------|
| `docs/DEPLOYMENT.md` | Complete deployment guide |
| `docs/FEATURE_FLAGS_ANALYSIS.md` | Comprehensive flags analysis |
| `docs/NO_DRIFT.md` | This file - drift prevention system |

---

## 🔐 Security Notes

### ✅ Safe to Commit
- `.env.example` - Template with no secrets
- All scripts in `scripts/` directory
- Documentation in `docs/` directory

### ❌ NEVER Commit
- `.env.local` - Contains your actual values
- `.env.production` - Production secrets
- `.vercel/.env.production.local` - Pulled from Vercel

### 🔒 Secrets Management
- Sensitive values (API keys): Store in Vercel as **encrypted** environment variables
- Public flags (feature toggles): Can be in plain text
- Always use `VITE_` prefix for client-side variables (exposed in browser)
- Use no prefix or different prefix for server-side secrets (if applicable)

---

## 🎓 Best Practices

### 1. **Always Pull Before Comparing**
```bash
# Good ✅
npm run vercel:pull:prod && npm run env:diff

# Bad ❌ (stale production env)
npm run env:diff
```

### 2. **Verify After Deploy**
```bash
# Good ✅
npm run deploy:prod && npm run verify:full

# Bad ❌ (don't assume success)
npm run deploy:prod
```

### 3. **Update Example Template**
```bash
# When adding new env var, update template
echo "# New feature flag" >> .env.example
echo "VITE_NEW_FEATURE=false" >> .env.example
git add .env.example
git commit -m "docs: add VITE_NEW_FEATURE to env template"
```

### 4. **Document Flag Impact**
When adding new feature flags:
- ✅ Update `.env.example` with description
- ✅ Add to `FEATURE_FLAGS_ANALYSIS.md`
- ✅ Update `scripts/env-diff.mjs` if critical
- ✅ Document in `NO_DRIFT.md` reference section

### 5. **Test Environment Parity**
Before major releases:
```bash
# 1. Pull production env
npm run vercel:pull:prod

# 2. Test with production environment locally
cp .vercel/.env.production.local .env.local.backup
cp .vercel/.env.production.local .env.local

# 3. Run dev server
npm run dev

# 4. Verify behavior matches production
# Open http://localhost:5173

# 5. Restore local env
mv .env.local.backup .env.local
```

---

## 🚀 CI/CD Integration (Future Enhancement)

### GitHub Actions Workflow (Planned)

```yaml
name: Verify Environment Parity

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check-env:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Pull production env
        run: npm run vercel:pull:prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
      
      - name: Check environment parity
        run: npm run env:diff
      
      - name: Fail if critical differences
        run: |
          if npm run env:diff | grep "CRITICAL DIFFERENCES"; then
            echo "❌ Production env differs from expected"
            exit 1
          fi
```

---

## 📞 Support

### Need Help?

1. **Check Documentation**:
   - `docs/DEPLOYMENT.md` - Deployment guide
   - `docs/FEATURE_FLAGS_ANALYSIS.md` - Complete flags analysis
   - This file - Drift prevention

2. **Run Diagnostics**:
   ```bash
   npm run verify:full
   npm run env:diff
   ```

3. **Common Commands**:
   ```bash
   # See all available scripts
   npm run
   
   # Check current environment
   cat .env.local
   
   # Check production environment
   npm run vercel:pull:prod
   cat .vercel/.env.production.local
   
   # Check local commit
   git rev-parse --short HEAD
   
   # Check what's changed
   git status
   git diff
   ```

---

## ✨ Summary

**Key Takeaways:**

1. **Environment variables control UI** - `VITE_UX_V2` is critical
2. **Vite replaces vars at build time** - Changes require redeploy
3. **Always verify after deploy** - Use `npm run verify:full`
4. **Compare environments regularly** - Use `npm run env:diff`
5. **Keep .env.example updated** - Template for new developers

**One-Command Workflow:**

```bash
# Before deploying
npm run vercel:pull:prod && npm run env:diff

# Deploy
npm run deploy:prod

# After deploying
npm run verify:full
```

**Questions? Check:**
- Is `VITE_UX_V2` set in Vercel? ✅
- Did you redeploy after changing env vars? ✅
- Did you hard refresh browser? ✅
- Does `verify:full` pass? ✅

---

**🎯 Goal Achieved: Production always uses the SAME version and UI you see locally with `npm run dev`**
