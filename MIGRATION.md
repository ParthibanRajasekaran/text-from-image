# Migration Guide: From Legacy to Current Architecture

## Overview

This guide helps developers understand the transition from the **pre-guides monolithic structure** to the **current spec-driven, intent-page architecture** with deprecation management.

---

## What Changed

### Before (Legacy)
- Single `/` home page with all routes
- Monolithic `App.tsx` component
- Direct Tesseract/TrOCR imports (no lazy loading)
- No deprecation tracking
- Manual testing

### After (Current)
- 5 intent-based guide pages (`/image-to-text`, `/extract-text-from-image`, etc.)
- Component-based lazy-loaded pages
- Dynamic imports for OCR engines (code splitting)
- Deprecation policy & legacy-shims re-export layer
- Spec-driven development (tests enforce contracts)
- Accessibility (a11y) validation in CI

**Timeline:**
- **v1 (Legacy):** Single page, no guides
- **v2 (Transition):** Added guides, monolithic fallback
- **v3 (Current):** Guide pages primary, legacy routes deprecated

---

## File Structure Migration

### Routes

| Old Route | New Route | Status | Migration |
|-----------|-----------|--------|-----------|
| `/` (all features) | `/` (hero page) | ✅ Updated | Use new home layout |
| N/A | `/image-to-text` | ✨ New | SEO guide for image OCR |
| N/A | `/extract-text-from-image` | ✨ New | SEO guide for text extraction |
| N/A | `/copy-text-from-image` | ✨ New | SEO guide for copying text |
| N/A | `/jpg-to-word` | ✨ New | SEO guide for JPG→Word |
| N/A | `/jpg-to-excel` | ✨ New | SEO guide for JPG→Excel |
| `/privacy` | `/privacy-policy` | ✅ Renamed | Use new route |
| `/legal` | `/terms` | ✅ Renamed | Use new route |

**All old routes still work** (redirects to new locations via router fallback).

### Components

| Old | New | Status | Note |
|-----|-----|--------|------|
| `App.tsx` | `App.tsx` (simplified) | ✅ Cleaned up | Route delegation only |
| `FileInput.tsx` | Marked `@deprecated` | ⚠️ Legacy | Use `<GlassDropzone />` (v3) |
| `ProgressBar.tsx` | Marked `@deprecated` | ⚠️ Legacy | Use `GlassProgressBar` (v3) |
| `ResultDisplay.tsx` | Marked `@deprecated` | ⚠️ Legacy | Use `GlassResultCard` (v3) |
| N/A | `components/v3/*` | ✨ New | Premium UI components |

**Deprecated components** are available in `components/` but marked with `@deprecated` JSDoc banner. See [docs/DEPRECATED.md](./docs/DEPRECATED.md) for migration timeline.

### Services

| Old | New | Status | Migration |
|-----|-----|--------|-----------|
| `services/tesseractService.ts` | ✅ Same | Unchanged | Dynamic import in `useOCRProcessor` |
| `services/transformersService.ts` | ✅ Same | Unchanged | Lazy loaded on fallback |
| `services/hybridService.ts` | ✅ Same | Unchanged | Orchestrates both |

**Change:** Services now use dynamic imports (loaded on-demand).

### Hooks

| Hook | Old | New | Status | Migration |
|------|-----|-----|--------|-----------|
| `useShortcuts` | ✅ v1 | ✅ Enhanced | Use in any page | Works everywhere |
| `useLocalHistory` | ✅ v1 | ✅ Enhanced | Persists across sessions | Same API |
| `useOCRProcessor` | ❌ N/A | ✨ New | Hook-based OCR flow | Replaces direct imports |
| `useFocusTrap` | ❌ N/A | ✨ New | A11y focus management | Use in modals/drawers |

---

## Deprecation Policy

### Timeline

| Phase | Duration | Action | Users |
|-------|----------|--------|-------|
| **Announce** | Day 1 | Add `@deprecated` banner to component | See deprecation warning in IDE |
| **Warn** | 4 weeks | Component works, but discouraged | Encouraged to migrate |
| **Soft Remove** | Week 5-8 | Move to `src/legacy-shims/` | Works but flagged in CI |
| **Hard Remove** | Week 9+ | Delete component entirely | Breaking change |

### Current Deprecated Components (In Deprecation Phase)

```typescript
// src/components/FileInput.tsx
/** 
 * @deprecated Use <GlassDropzone /> instead (components/v3/GlassDropzone.tsx)
 * Timeline: Deprecate v2 UI (4 weeks), then migrate to legacy-shims
 */
export function FileInput() { ... }
```

**Check status:** [docs/DEPRECATED.md](./docs/DEPRECATED.md) (auto-generated list with timelines)

---

## Deprecation System: `legacy-shims/`

### Purpose

A temporary `src/legacy-shims/` directory allows controlled removal of old code:
- Components can be re-exported here during deprecation
- CI forbids new imports to legacy-shims in **production code**
- Test files can import freely (migration period)
- Provides bridge to new API

### Structure

```
src/legacy-shims/
├── index.ts              # Central re-exports
├── FileInput.ts          # Deprecated FileInput wrapper
├── ProgressBar.ts        # Deprecated ProgressBar wrapper
└── ResultDisplay.ts      # Deprecated ResultDisplay wrapper
```

### Example: Migrating a Component

**Before (direct import, now discouraged):**
```typescript
// ❌ Old way - discouraged
import FileInput from 'src/components/FileInput';

export function OldPage() {
  return <FileInput onChange={handleFile} />;
}
```

**During Deprecation (via legacy-shims):**
```typescript
// ⚠️ Temporary migration bridge
import FileInput from 'src/legacy-shims/FileInput';

export function TransitionPage() {
  return <FileInput onChange={handleFile} />;
}
```

**After Migration (new API):**
```typescript
// ✅ New way - encouraged
import GlassDropzone from 'src/components/v3/GlassDropzone';

export function NewPage() {
  return <GlassDropzone onFilesSelected={handleFiles} />;
}
```

### CI Enforcement

```bash
npm run test
# Checks: Production code cannot import from src/legacy-shims/**
# Allows: Test files can import (migration period)
```

**If you see this error:**
```
Error: Production file 'src/pages/NewFeature.tsx' imports from src/legacy-shims/
       This is only allowed during the 4-week deprecation window.
       Migrate to the new component now: see docs/DEPRECATED.md
```

**Solution:**
1. Find the deprecated component in [docs/DEPRECATED.md](./docs/DEPRECATED.md)
2. Check the migration guide
3. Replace with new component
4. Test with `npm run test`

---

## How to Update Code

### Step 1: Identify Deprecated Code

Check if using deprecated components:

```bash
# Search your code
grep -r "from 'src/components/FileInput'" src/pages/
grep -r "from 'src/components/ProgressBar'" src/pages/
```

Or check [docs/DEPRECATED.md](./docs/DEPRECATED.md) for full list.

### Step 2: Check the JSDoc Banner

```typescript
// src/components/FileInput.tsx
/**
 * @deprecated Use <GlassDropzone /> instead
 * Migration: See docs/DEPRECATED.md line 45
 * Timeline: Soft remove in v2.5 (2025-01-15)
 */
export function FileInput() { ... }
```

### Step 3: Read Migration Guide

Each deprecated component has a migration section in [docs/DEPRECATED.md](./docs/DEPRECATED.md):

```markdown
### FileInput → GlassDropzone

**Old API:**
```typescript
<FileInput onChange={handleFile} disabled={false} />
```

**New API:**
```typescript
<GlassDropzone onFilesSelected={handleFiles} />
```

**Differences:**
- Renamed `onChange` → `onFilesSelected`
- Renamed return from `File` → `File[]` (array)
- Added animated loading state
- Added aurora background
```

### Step 4: Update Your Code

Replace the deprecated import:

```typescript
// Before
import FileInput from 'src/components/FileInput';

// After
import GlassDropzone from 'src/components/v3/GlassDropzone';
```

Update the component usage:

```typescript
// Before
<FileInput onChange={(file) => process(file)} />

// After
<GlassDropzone onFilesSelected={(files) => process(files[0])} />
```

### Step 5: Test

```bash
npm run test      # Ensure no legacy-shims imports in production code
npm run build     # Ensure build succeeds
```

---

## Spec-Driven Development

### What Are Specs?

Specs are the single source of truth for features, routes, and contracts:

```
specs/
├── routes.json           # All valid routes, metadata
├── seo.spec.json         # SEO requirements (title, canonical, og:image)
├── a11y.spec.json        # Accessibility requirements (WCAG 2.1 AA)
├── adsense.spec.json     # AdSense policy (slot placement, consent)
└── ...
```

### When You Add a New Feature

**Before:** Just code it and hope tests pass  
**After:** Update the relevant spec, then code

**Example: Adding a new guide page**

1. Update `specs/routes.json`:
```json
{
  "routes": [
    { "path": "/my-new-guide", "lazy": true, "title": "My Guide" }
  ]
}
```

2. Add the page component: `src/pages/MyNewGuide.tsx`

3. Update `router.tsx` to include the new route

4. Run tests: `npm run test` (routes.spec will validate)

### Using Specs in Tests

Tests read specs and validate code matches them:

```typescript
// __tests__/routes.spec.tsx
it('all routes from spec.json render without crashing', () => {
  routesSpec.routes.forEach((route) => {
    const element = render(<Route path={route.path} />);
    expect(element).toBeInTheDocument();
  });
});
```

---

## Key Concepts

### Intent-Based Pages

Each guide page targets a specific user intent:

| Page | Intent | Audience |
|------|--------|----------|
| `/image-to-text` | "How do I extract text from images?" | General users |
| `/jpg-to-word` | "Can I convert JPG to Word?" | Business users |
| `/jpg-to-excel` | "Extract data from receipts/invoices" | Finance users |

Each has:
- Unique meta tags (SEO)
- FAQ section (Google rich snippets)
- Related links (internal linking)
- Performance optimized (lazy loading)

### Code Splitting

OCR engines are **not** bundled upfront—they load on-demand:

```typescript
// ❌ Bad: Loads 23 KB + 199 KB upfront
import Tesseract from 'tesseract.js';
import { pipeline } from '@xenova/transformers';

// ✅ Good: Loads only when user clicks "Process"
const { recognize } = await import('tesseract.js');
const { pipeline } = await import('@xenova/transformers');
```

**Result:** Initial bundle reduced from 850 KB → 285 KB (67% reduction)

### Lazy Page Loading

Pages are code-split and loaded only when visited:

```typescript
// router.tsx
const routes = [
  { path: '/', element: <Home /> },
  { path: '/image-to-text', element: <Suspense fallback={<Spinner />}><ImageToText /></Suspense> },
  { path: '/jpg-to-word', element: <Suspense fallback={<Spinner />}><JpgToWord /></Suspense> },
];
```

---

## Troubleshooting Migration

### Q: I see `@deprecated` warning in my IDE
**A:** Safe to ignore for now, but plan to migrate. Check [docs/DEPRECATED.md](./docs/DEPRECATED.md) for timeline.

### Q: Tests fail with "legacy-shims import not allowed"
**A:** Your production code imports from legacy-shims. Either:
1. Migrate to new component now
2. Move to test file (temporarily, if still developing)

### Q: Old route doesn't work anymore
**A:** Old routes are redirected automatically via router fallback. If not working:
1. Check `router.tsx` has fallback route
2. Verify new route exists
3. Clear browser cache (hard refresh)

### Q: How do I know which component is the replacement?
**A:** Check JSDoc banner: `@deprecated Use <NewComponent /> instead`  
Or read [docs/DEPRECATED.md](./docs/DEPRECATED.md)

---

## Support

- **Questions?** Check [docs/DEPRECATED.md](./docs/DEPRECATED.md) and [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Found a bug?** Open an issue on [GitHub](https://github.com/ParthibanRajasekaran/text-from-image/issues)
- **Contributing?** See [CONTRIBUTING.md](./CONTRIBUTING.md) for code standards

