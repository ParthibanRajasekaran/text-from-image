# Feature Flags & Environment Analysis Report

**Generated:** 2025-11-08  
**Framework:** Vite 6.2.0 + React 19.2.0  
**Build Command:** `vite build`  
**Dev Command:** `vite`

---

## 🎯 Executive Summary

**CRITICAL FINDING:** Production shows old UI because `VITE_UX_V2` environment variable is not set in Vercel.

- **Local:** `VITE_UX_V2=1` in `.env.local` → Shows **NEW UI** (HeroOCR with aurora background)
- **Production:** `VITE_UX_V2` unset → Defaults to `false` → Shows **OLD UI** (classic App.tsx)

---

## 🔍 All Feature Flags Discovered

### Primary UI Toggle (CRITICAL)

| Flag | Type | Default | Purpose | Files Affected |
|------|------|---------|---------|----------------|
| `VITE_UX_V2` | boolean | `false` ⚠️ | **Toggles between old and new UI** | `index.tsx`, `utils/env.ts`, `router.tsx`, `lib/config/flags.ts` |

**How it works:**
```typescript
// index.tsx:20
const AppComponent = isUXV2Enabled() ? (
  <AppRouter />  // ← NEW UI (HeroOCR, routes, aurora)
) : <App />;     // ← OLD UI (classic single page)

// utils/env.ts:6
export const isUXV2Enabled = (): boolean => {
  return import.meta.env.VITE_UX_V2 === '1' || 
         import.meta.env.VITE_UX_V2 === 'true';
};
```

**Default in Production:** If `VITE_UX_V2` is not set, it defaults to `false`, showing the **legacy/old UI**.

---

### Secondary Feature Flags

| Flag | Type | Default | Purpose | Location |
|------|------|---------|---------|----------|
| `VITE_UX_V3` | boolean | `false` (falls back to `VITE_UX_V2`) | V3 variant (currently same as V2) | `lib/config/flags.ts:86` |
| `VITE_ANALYTICS_ENABLED` | boolean | `true` (prod), `false` (dev) | Web Vitals tracking | `lib/config/flags.ts:93` |
| `VITE_DEBUG` | boolean | `false` | Verbose logging | `lib/config/flags.ts:100` |
| `VITE_OCR_MIN_CONFIDENCE` | number | `60` | Tesseract confidence threshold | `lib/config/flags.ts:107` |
| `VITE_OCR_MIN_TEXT_LENGTH` | number | `3` | Minimum extracted text length | `lib/config/flags.ts:114` |

---

### Build-Injected Variables (Auto-Generated)

| Variable | Source | Purpose | Location |
|----------|--------|---------|----------|
| `VITE_COMMIT` | Git SHA (vite.config.ts) | Version tracking in footer | `vite.config.ts:42`, `lib/version.ts:21` |
| `VITE_BUILD_TIME` | Build timestamp | Build time display | `vite.config.ts:43`, `lib/version.ts:35` |
| `VITE_VERCEL_GIT_COMMIT_SHA` | Vercel (automatic) | Vercel deployment commit | `lib/version.ts:22` |

---

## 📁 Files Consuming Feature Flags

### Critical Path (UI Selection)

1. **`index.tsx`** (lines 6, 11, 20)
   ```typescript
   import { isUXV2Enabled } from './utils/env';
   if (isUXV2Enabled()) { initWebVitals(); }
   const AppComponent = isUXV2Enabled() ? <AppRouter /> : <App />;
   ```

2. **`utils/env.ts`** (lines 6-9, 13-15)
   ```typescript
   export const isUXV2Enabled = (): boolean => {
     return import.meta.env.VITE_UX_V2 === '1' || 
            import.meta.env.VITE_UX_V2 === 'true';
   };
   ```

3. **`router.tsx`** (line 4, 32)
   ```typescript
   import { isUXV3Enabled } from './utils/env';
   // Comment: "Uses V3 HeroOCR if VITE_UX_V2=1, otherwise legacy App"
   ```

4. **`App.tsx`** (line 14, 41, 74, 90, 115, 214, 245, 293)
   ```typescript
   import { isUXV2Enabled } from './utils/env';
   const useEnhancedUI = isUXV2Enabled();
   // Used to conditionally render history drawer, shortcuts, etc.
   ```

### Centralized Configuration

5. **`lib/config/flags.ts`** (NEW - Created during bundle optimization)
   - Centralizes all flag reads
   - Exports `FLAGS` object with type-safe defaults
   - Provides `Config.isEnhancedUI()` helper

---

## 🏗️ Build Framework Details

**Framework:** Vite (not Next.js)

**Package.json Scripts:**
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "deploy:prod": "node scripts/deploy-prod.mjs",
  "vercel:link": "vercel link --yes",
  "vercel:pull:prod": "vercel pull --environment=production --yes"
}
```

**Environment Variable Loading:**
- Vite loads `.env.local` (gitignored) for local development
- Vite requires `VITE_` prefix for client-side variables
- Variables are **replaced at build time** (not runtime)
- Vercel Project Settings → Environment Variables for production

---

## 🚨 Root Cause of Production Drift

### The Problem

```
┌─────────────────────────────────────────────────────────────┐
│ Environment          │ VITE_UX_V2 │ Result                  │
├─────────────────────────────────────────────────────────────┤
│ Local (.env.local)   │ "1"        │ ✅ NEW UI (HeroOCR)    │
│ Production (Vercel)  │ undefined  │ ❌ OLD UI (classic)    │
└─────────────────────────────────────────────────────────────┘
```

### Why This Happens

1. **Local Development:**
   - `.env.local` has `VITE_UX_V2=1`
   - Vite reads this during `npm run dev`
   - `isUXV2Enabled()` returns `true`
   - Shows new UI with HeroOCR

2. **Production Build (Vercel):**
   - `.env.local` is gitignored (not deployed)
   - Vercel environment variables not set
   - `import.meta.env.VITE_UX_V2` is `undefined`
   - `isUXV2Enabled()` returns `false` (default)
   - Shows old UI with classic App.tsx

### The Fix

**Set `VITE_UX_V2=true` in Vercel:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add: `VITE_UX_V2` = `true` (Production environment)
3. Redeploy: `npm run deploy:prod`

---

## 📋 Required Production Environment Variables

| Variable | Recommended Value | Required? | Purpose |
|----------|-------------------|-----------|---------|
| `VITE_UX_V2` | `true` or `1` | **YES** ⚠️ | Enable new UI (HeroOCR) |
| `VITE_ANALYTICS_ENABLED` | `true` | Optional | Enable Web Vitals tracking |
| `VITE_DEBUG` | `false` | Optional | Disable debug logs in prod |
| `VITE_OCR_MIN_CONFIDENCE` | `60` | Optional | OCR confidence threshold |
| `VITE_OCR_MIN_TEXT_LENGTH` | `3` | Optional | Min text length |

**Important:** All `VITE_*` variables must be set **before build**. After adding/changing variables in Vercel, you **must redeploy**.

---

## 🔧 Flag Refactoring Status

### Current State

- ✅ Centralized config exists: `lib/config/flags.ts`
- ✅ Type-safe `FLAGS` object with defaults
- ⚠️ Old helper still used: `isUXV2Enabled()` from `utils/env.ts`
- ⚠️ Scattered imports: Some files import from `utils/env.ts`, others from `lib/config/flags.ts`

### Recommended Refactoring

**Consolidate to single source:**
```typescript
// Remove: utils/env.ts helpers
// Use: lib/config/flags.ts everywhere

// Instead of:
import { isUXV2Enabled } from './utils/env';

// Use:
import { FLAGS, Config } from '@/lib/config/flags';
if (Config.isEnhancedUI()) { /* ... */ }
```

---

## 🎯 Action Items

### Immediate (Fix Production Drift)

1. ✅ **Set `VITE_UX_V2=true` in Vercel** (DONE by user)
2. ⏳ **Redeploy:** `npm run deploy:prod`
3. ⏳ **Verify:** Check footer shows correct commit SHA
4. ⏳ **Test:** Hard refresh and confirm new UI loads

### Short-term (Code Quality)

1. Create `scripts/env-diff.mjs` to compare local vs production env
2. Refactor `index.tsx` to use `Config.isEnhancedUI()` instead of `isUXV2Enabled()`
3. Deprecate `utils/env.ts` in favor of `lib/config/flags.ts`
4. Add production env check to CI/CD

### Long-term (Prevent Future Drift)

1. Add env validation script that fails build if critical flags missing
2. Document required env vars in `.env.example`
3. Add verification endpoint (`/__health`) that returns flag states
4. Automate env parity checks in deployment workflow

---

## 📖 References

- **Flag definitions:** `lib/config/flags.ts`
- **UI selection logic:** `index.tsx:20`
- **Helper functions:** `utils/env.ts`
- **Router configuration:** `router.tsx`
- **Deployment guide:** `docs/DEPLOYMENT.md`
- **Vite env docs:** https://vitejs.dev/guide/env-and-mode.html

---

**Report Version:** 1.0  
**Last Updated:** 2025-11-08  
**Status:** ✅ Root cause identified, fix in progress
