# Accessibility Audit Findings

**Date:** November 8, 2025  
**Scope:** Complete codebase accessibility audit  
**Tools:** Manual code review, grep search, semantic analysis

---

## Executive Summary

Found **3 main categories** of accessibility issues across the application:

1. ✅ **Interactive elements with mismatched accessible names** (5 instances)
2. ✅ **aria-hidden on containers with focusables** (2 instances)
3. ✅ **Missing/multiple main landmarks** (3 pages affected)

---

## 1. Interactive Elements: Accessible Name ≠ Visible Text

### Issue A: GlassDropzone (Premium UI)
**File:** `components/v3/GlassDropzone.tsx`  
**Lines:** 105-107, 157

**Problem:**
```tsx
<motion.div
  role="button"
  aria-label="Upload image file. Drag and drop, click, or paste with Cmd+V or Ctrl+V"
  // ...
>
  <p className="text-xl font-semibold">
    Drop image or click to upload  {/* ← Visible text */}
  </p>
</motion.div>
```

**Issues:**
- Using `<div role="button">` instead of semantic `<button>` or `<label>`
- `aria-label` doesn't match visible text "Drop image or click to upload"
- File input is hidden with `sr-only` but not properly connected to dropzone
- No keyboard interaction for file selection (only drag/drop works)

**Impact:** Screen reader announces different text than what's visible, violating WCAG 2.5.3

---

### Issue B: Dropzone (Standard UI)
**File:** `components/Dropzone.tsx`  
**Lines:** 290-298, 327

**Problem:**
```tsx
<motion.div
  role="region"
  aria-label="File upload drop zone"
  // ...
>
  <button onClick={handleClick}>
    Upload Image  {/* ← Visible text */}
  </button>
  <input className="sr-only" aria-label="File upload input (...)" />
</motion.div>
```

**Issues:**
- Dropzone uses `role="region"` but contains interactive button
- Hidden file input has redundant `aria-label` that doesn't match button text
- Button text is "Upload Image" but file input says "File upload input (use button to select files)"

**Impact:** Confusing announcements for screen reader users

---

### Issue C: HistoryDrawer Cards
**File:** `components/HistoryDrawer.tsx`  
**Line:** 192

**Problem:**
```tsx
<motion.div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => { /* Enter/Space handler */ }}
  // No aria-label!
>
  {/* Card content */}
</motion.div>
```

**Issues:**
- Using `<div role="button">` instead of semantic `<button>`
- No accessible name provided
- Keyboard navigation works but announces as "button" with no label

**Impact:** Screen reader users don't know what the button does

---

### Issue D: Theme Toggle
**File:** `components/ThemeToggle.tsx`  
**Line:** 17

**Status:** ✅ **GOOD** - Already properly labeled!

```tsx
<button aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
  {theme === 'light' ? <MoonIcon /> : <SunIcon />}
</button>
```

**Note:** Icons are decorative, aria-label is appropriate here.

---

### Issue E: Icon Buttons Throughout
**Files:** Multiple (ResultToolbar, GlassResultCard, HistoryDrawer, Toast)

**Status:** ✅ **MOSTLY GOOD** - Most icon buttons have proper `aria-label`

Examples:
- `components/ResultToolbar.tsx` line 250: `aria-label={tooltip || label}` ✅
- `components/v3/GlassResultCard.tsx` lines 114, 162: Proper labels ✅
- `components/Toast.tsx` line 35: `aria-label="Close notification"` ✅
- `components/FileInput.tsx` line 96: `aria-label="Remove image"` ✅

**Icons marked with `aria-hidden="true"`:** ✅ Correct pattern

---

## 2. aria-hidden with Focusable Elements

### Issue A: HistoryDrawer Backdrop
**File:** `components/HistoryDrawer.tsx`  
**Line:** 79

**Problem:**
```tsx
<motion.div
  onClick={onClose}
  className="fixed inset-0 bg-black/50 z-40"
  aria-hidden="true"  {/* ← Backdrop is clickable! */}
/>
```

**Issues:**
- Backdrop has `aria-hidden="true"` but is interactive (clickable to close)
- This is acceptable for backdrop clicks, but should use proper modal pattern

**Impact:** Minor - backdrop clicks are supplementary, not primary interaction

---

### Issue B: V3 HistoryDrawer Backdrop
**File:** `components/v3/HistoryDrawer.tsx`  
**Line:** Similar pattern

**Status:** Same as Issue A

---

### Issue C: No aria-hidden on #root
**Status:** ✅ **GOOD** - No application-level `aria-hidden` found

Searched for `aria-hidden` on containers like:
- `#root`
- `#app`
- `<html>`
- `<body>`

**Result:** None found. Only used appropriately on:
- Decorative icons
- Modal backdrops
- Ad placeholders

---

## 3. Main Landmark Issues

### Issue A: Multiple <main> Elements
**Files Affected:**
- `components/v3/HeroOCR.tsx` line 169: `<main id="main-content">`
- `app/(tools)/_builder.tsx` line 317: `<main id="main-content">`
- `App.tsx` line 251: `<main className="container">`

**Problem:**
- App has 3 different pages that each render a `<main>` element
- When routes change, no issue (only one rendered at a time)
- BUT: `App.tsx` and `HeroOCR.tsx` might both be in DOM if routing is misconfigured

**Status:** ⚠️ **NEEDS VERIFICATION** - Depends on routing setup

**Current Routing:**
```tsx
// router.tsx
const HomeComponent = HeroOCR;  // ← Home uses HeroOCR

{
  path: '/',
  element: <HomeComponent />,  // ← Only one main per route
}
```

**Conclusion:** ✅ Likely OK - Only one route rendered at a time

---

### Issue B: Missing Skip Link
**Files:**
- ✅ `components/v3/HeroOCR.tsx` line 115: Has skip link!
- ✅ `app/(tools)/_builder.tsx` line 294: Has skip link!
- ❌ `App.tsx`: **MISSING skip link**

**Problem:**
```tsx
// App.tsx line 251
<main className="container mx-auto p-4 md:p-8">
  {/* No skip link before main */}
  {/* No id="main" attribute */}
</main>
```

**Impact:** Keyboard users can't skip navigation on legacy App.tsx pages

---

### Issue C: Multiple H1 Elements Per Page
**Files Checked:**
- ✅ `components/v3/HeroOCR.tsx`: 
  - Line 136: `<h1>` "TextFromImage" (header/brand)
  - Line 179: `<h2>` "Image → Text, instantly" (hero)
- ✅ `app/(tools)/_builder.tsx`:
  - Line 308: `<h1>` "TextFromImage" (header/brand)
  - Line 326: `<h2>` Hero heading (dynamic)
- ❌ `App.tsx`:
  - Line 244: `<h1>` "Extract Text from Image for Free"
  - No other H1s

**Status:** ✅ **ACCEPTABLE** - Each page has exactly one H1

**Note:** Brand name in header could be demoted to `<div>` or `<span>` with larger font, keeping H1 for page title only.

---

## 4. Missing: Live Regions for OCR Status

**Current Status:** ❌ **NOT IMPLEMENTED**

**Files Checked:**
- `components/v3/HeroOCR.tsx`: No live region
- `app/(tools)/_builder.tsx`: No live region
- `App.tsx`: No live region

**Problem:**
- OCR processing status changes (e.g., "Processing image..." → "Complete!")
- Status is visual only (progress bars, text changes)
- Screen readers don't announce status changes

**Expected:**
```tsx
<div role="status" aria-live="polite" className="sr-only">
  {isProcessing ? 'Processing image...' : 'Ready'}
</div>
```

**Impact:** Screen reader users don't know when OCR completes

---

## 5. Modal/Dialog Issues

### Issue A: HistoryDrawer Modal Semantics
**Files:** `components/HistoryDrawer.tsx`, `components/v3/HistoryDrawer.tsx`

**Current Implementation:**
```tsx
<motion.aside
  role="dialog"
  aria-modal="true"
  aria-label="OCR History"  // or aria-labelledby
>
```

**Status:** ✅ **GOOD** - Proper dialog semantics

**Missing:**
- ❌ No focus trap (can tab to background elements)
- ❌ No `inert` on background content when drawer open
- ✅ Escape key handling implemented
- ✅ Backdrop click to close implemented

**Impact:** Keyboard users can accidentally tab to background elements while drawer is open

---

### Issue B: ConfirmDialog
**File:** `components/v3/ConfirmDialog.tsx` (referenced but not in scan results)

**Status:** ⏭️ **NEEDS CHECK** - File exists, needs review

---

## 6. Keyboard Navigation Issues

### Issue A: Dropzone Keyboard Interaction
**Files:** `components/v3/GlassDropzone.tsx`, `components/Dropzone.tsx`

**Current:**
```tsx
<motion.div
  role="button"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();  // Opens file picker
    }
  }}
>
```

**Status:** ✅ **WORKS** - Enter/Space triggers file picker

**But:**
- Using `<div role="button">` instead of semantic button
- File input hidden with `sr-only` and `tabIndex={-1}`

**Better Pattern:** Use `<label htmlFor="file-input">` with visible input that's styled to be hidden

---

## 7. Focus Management

### Issue A: Focus Indicators
**Status:** ✅ **GOOD** - Most interactive elements have focus styles

Examples:
```tsx
focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
```

**Found in:**
- All buttons
- All links
- All interactive elements
- Skip link has enhanced focus:not-sr-only

---

## Summary of Findings

| Issue | Severity | Count | Files Affected |
|-------|----------|-------|----------------|
| Accessible name mismatch | High | 2 | GlassDropzone, Dropzone |
| `<div role="button">` | Medium | 3 | GlassDropzone, Dropzone, HistoryDrawer |
| Missing live regions | Medium | 3 | All main pages |
| No focus trap in modals | Medium | 2 | HistoryDrawer components |
| Missing skip link | Low | 1 | App.tsx |
| aria-hidden on backdrop | Low | 2 | HistoryDrawer components |

**Total Issues:** 13 instances across 6 categories

---

## Recommended Fixes Priority

### P0 (High - Breaks screen readers)
1. ✅ Fix GlassDropzone accessible name
2. ✅ Fix Dropzone accessible name
3. ✅ Convert `<div role="button">` to semantic elements

### P1 (Medium - Reduces usability)
4. ✅ Add live regions for OCR status
5. ✅ Implement focus trap in modals
6. ✅ Add `inert` to background when modal open

### P2 (Low - Minor improvements)
7. ✅ Add skip link to App.tsx
8. ✅ Remove redundant aria-labels
9. ✅ Consider demoting brand H1 to div

---

## Next Steps

1. Implement fixes in priority order
2. Add eslint-plugin-jsx-a11y
3. Add jest-axe tests
4. Run Lighthouse audit
5. Test with screen reader (NVDA/JAWS/VoiceOver)

