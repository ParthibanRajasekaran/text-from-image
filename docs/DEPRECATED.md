# 📦 Deprecation Policy & Migration Guide

**Effective Date:** 2025-11-09  
**Policy:** Deprecated code is removed after 2 minor versions.

---

## Overview

This document tracks deprecated modules, components, and APIs. Deprecation follows a graceful 2-version window:

1. **v1.x** — Marked @deprecated with JSDoc warnings and console.warn in DEV
2. **v2.0** — Code still present but discouraged; shims redirect to new targets
3. **v2.1+** — Code removed entirely

---

## Deprecated Modules (2025-11-09)

### Legacy UI Components

These components represent the pre-V2/V3 UI era and are superseded by glass-morphism variants.

#### 1. `App.tsx` → Use `HeroOCR`

**Status:** Deprecated in v1.x  
**Removal Target:** v2.1  
**Why:** Legacy root component only used when `VITE_UX_V2=false`. New UI architecture uses `router.tsx` with `HeroOCR`.

**Migration:**
```tsx
// ❌ Before (legacy UI)
import App from './App';
export default App;

// ✅ After (new UI)
import { HeroOCR } from './components/v3/HeroOCR';
export default HeroOCR;
```

**Timeline:**
- v1.x: ✅ Still works; console warnings in DEV
- v2.0: Shim redirects to `HeroOCR`
- v2.1+: Removed

---

#### 2. `components/FileInput.tsx` → Use `GlassDropzone`

**Status:** Deprecated in v1.x  
**Removal Target:** v2.1  
**Why:** Legacy uploader only in pre-V2 UI. `GlassDropzone` is the modern replacement.

**Migration:**
```tsx
// ❌ Before
import { FileInput } from './components/FileInput';
<FileInput onFileChange={handleChange} />

// ✅ After
import { GlassDropzone } from './components/v3/GlassDropzone';
<GlassDropzone onFileSelect={handleSelect} />
```

**API Changes:**
- `onFileChange(file | null)` → `onFileSelect(file)`
- `previewUrl` prop → Built-in preview rendering
- `imageFile` prop → Managed internally

**Timeline:**
- v1.x: ✅ Still works; console warnings in DEV
- v2.0: Shim redirects to `GlassDropzone`
- v2.1+: Removed

---

#### 3. `components/Dropzone.tsx` → Use `GlassDropzone`

**Status:** Deprecated in v1.x  
**Removal Target:** v2.1  
**Why:** V2 dropzone lacks glass-morphism design. `GlassDropzone` is the unified replacement.

**Migration:**
```tsx
// ❌ Before (V2 dropzone)
import { Dropzone } from './components/Dropzone';
<Dropzone onFiles={handleFiles} />

// ✅ After (V3 glass-morphism)
import { GlassDropzone } from './components/v3/GlassDropzone';
<GlassDropzone onFileSelect={handleSelect} />
```

**API Changes:**
- `onFiles(files[])` → `onFileSelect(file)` — Now single file with batch support via multiple calls
- `maxFiles` prop → Removed; enforced in hook
- Sample images UI → Built-in

**Timeline:**
- v1.x: ✅ Still works; console warnings in DEV
- v2.0: Shim redirects to `GlassDropzone`
- v2.1+: Removed

---

#### 4. `components/ProgressBar.tsx` → Use `GlassProgressBar`

**Status:** Deprecated in v1.x  
**Removal Target:** v2.1  
**Why:** Legacy progress indicator. `GlassProgressBar` matches design system.

**Migration:**
```tsx
// ❌ Before
import { ProgressBar, ProgressStage } from './components/ProgressBar';
<ProgressBar stage={stage} percent={percent} />

// ✅ After
import { GlassProgressBar, type ProgressStage } from './components/v3/GlassProgressBar';
<GlassProgressBar stage={stage} percent={percent} />
```

**API:** Same (names match)

**Timeline:**
- v1.x: ✅ Still works; console warnings in DEV
- v2.0: Shim redirects to `GlassProgressBar`
- v2.1+: Removed

---

## Unreferenced Pages (High Confidence)

These pages exist but are not registered in `router.tsx` and are inaccessible.

### Pages in `src/pages/`

These are not imported in the active router and may be dead code:

| Component | Issue | Status |
|-----------|-------|--------|
| `src/pages/ImageToTextGuide.tsx` | Not in router.tsx | Candidate for removal v2.0 |
| `src/pages/Contact.tsx` | Not in router.tsx | Candidate for removal v2.0 |
| `src/pages/About.tsx` | Not in router.tsx | Candidate for removal v2.0 |
| `src/pages/PrivacyPolicy.tsx` | Not in router.tsx | Candidate for removal v2.0 |
| `src/pages/Terms.tsx` | Not in router.tsx | Candidate for removal v2.0 |

**Migration:** Review with product/design if these should be added to router or archived.

---

## Console Warnings (Development Only)

When `import.meta.env.DEV` is true, deprecated modules emit warnings:

```
[DEPRECATED] App (src/App.tsx) is deprecated. Use HeroOCR from components/v3/HeroOCR.tsx instead. This will be removed in a future version. See docs/DEPRECATED.md.

[DEPRECATED] FileInput (components/FileInput.tsx) is deprecated. Use GlassDropzone from components/v3/GlassDropzone.tsx instead. This will be removed in a future version. See docs/DEPRECATED.md.
```

These warnings:
- ✅ Only show in development (`npm run dev`)
- ✅ Do NOT appear in production builds
- ✅ Help developers identify migration paths
- ✅ Are non-blocking

---

## Legacy Shims (REMOVED in v2.1)

**Status:** ✅ Removed (2025-11-09)

For backward compatibility during deprecation window (v1.x - v2.0), shim modules redirected old imports to new ones with warnings:

```bash
src/legacy-shims/
├── App.ts              # Re-exported App (DELETED)
├── FileInput.ts        # Re-exported FileInput (DELETED)
├── Dropzone.ts         # Re-exported Dropzone (DELETED)
└── ProgressBar.ts      # Re-exported ProgressBar (DELETED)
```

**Why removed:** No production code imported from legacy-shims. All code was migrated to v3 components during deprecation window.

**If you still need the legacy UI:** Use `VITE_UX_V2=false` to enable App.tsx fallback (still available in components/App.tsx).

---

## Removal Checklist (For v2.1 Release)

**Status:** ✅ COMPLETED (2025-11-09)

Deprecated code removal has been completed:

- ✅ All imports updated to new paths (v3 components)
- ✅ No hardcoded references in production code
- ✅ Removed from router.tsx (uses HeroOCR)
- ✅ Deleted `src/legacy-shims/*` directory (no consumers found)
- ✅ Updated deprecation test to verify removal
- ✅ Updated this document
- ✅ Deprecation banners remain in original components (for VITE_UX_V2=false fallback UI)

---

## Questions & Support

- **Why deprecate rather than remove?** — Gradual migration reduces risk of breakage and gives consuming code time to update.
- **How long will shims stay?** — 2 minor versions (e.g., deprecated in 1.x, removed in 2.1+).
- **Can I ignore the warnings?** — Yes; in production they don't appear. But migrate before the removal target.
- **What if I'm blocked on a migration?** — Open an issue describing the blocker; we can extend the timeline.

---

**Next Review:** 2026-01-09 (check if any candidates should be removed)
