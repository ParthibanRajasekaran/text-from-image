# Pages Structure

All routed pages are located in this directory for clarity and maintainability.

## Tool Pages (Main Routes)

Core OCR tool pages—each serves a specific document/image type:

| File | Route | Purpose |
|------|-------|---------|
| `ImageToText.tsx` | `/image-to-text` | General image-to-text OCR |
| `ImageToTextConverter.tsx` | `/image-to-text-converter` | Alternative entry point |
| `JpgToWord.tsx` | `/jpg-to-word` | JPG images to editable text (Word format) |
| `ImageToExcel.tsx` | `/image-to-excel` | Table detection and Excel export |
| `ExtractTextFromImage.tsx` | `/extract-text-from-image` | Text extraction from any image |

## Guide Pages

Detailed guides with examples, FAQs, and step-by-step instructions:

| File | Route | Purpose |
|------|-------|---------|
| `CopyTextFromImageGuide.tsx` | `/copy-text-from-image` | Guide: how to copy text from images |
| `JpgToExcelGuide.tsx` | `/jpg-to-excel` | Guide: JPG to Excel conversion |

## Other Pages

| File | Route | Purpose |
|------|-------|---------|
| `NotFound.tsx` | `*` (catch-all) | 404 error page |
| `CopyTextFromImage.tsx` | `NOT ROUTED` | Wrapper component (see docs/DEPRECATED.md) |

## Import Organization

**From `router.tsx`:**
```tsx
const ImageToText = lazy(() => import('./pages/ImageToText'));
const CopyTextFromImageGuide = lazy(() => import('./pages/CopyTextFromImageGuide'));
```

**From tests:**
```tsx
import CopyTextFromImageGuide from '../../pages/CopyTextFromImageGuide';
```

**From components:**
```tsx
import { PageComponent } from '../../pages/SpecificPage';
```

## File Naming Convention

- **Components:** PascalCase matching default export name
- **Files:** Match the component name exactly (e.g., `ImageToText.tsx` exports `ImageToText`)
- **All pages:** `.tsx` files with React components
- **Consistency:** Always use PascalCase for filenames and component names

## Lazy Loading & Code Splitting

All pages are lazy-loaded in `router.tsx` to enable code splitting:

```tsx
const Page = lazy(() => import('./pages/PageName'));
```

This ensures:
- ✅ Initial bundle size is minimal
- ✅ Each page loads on demand
- ✅ Better performance for users

## Future Structure

When guide count exceeds 3-4 pages, consider moving to `pages/guides/`:

```
pages/
├── _structure.md
├── ImageToText.tsx
├── JpgToWord.tsx
├── NotFound.tsx
└── guides/
    ├── CopyTextFromImageGuide.tsx
    ├── JpgToExcelGuide.tsx
    └── _README.md
```

**Note:** Lazy imports in `router.tsx` will still use `./pages/GuideFileName` (no path change needed).

---

**See also:** `router.tsx` for all route definitions, `src/seo.tsx` for SEO utilities
