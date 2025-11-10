# Contributing Guide

Welcome! We appreciate contributions to the text-from-image project. This guide will help you get started and maintain code quality.

---

## Before You Start

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/text-from-image.git`
3. **Create a branch:** `git checkout -b feat/your-feature` or `fix/your-fix`
4. **Read** [MIGRATION.md](./MIGRATION.md) to understand the current architecture
5. **Ask questions** if unsure: Open an issue or discussion

---

## Development Setup

### Prerequisites

- **Node.js 20+**
- **npm 10+** (or yarn 4+)
- **Git 2.30+**

### Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# Open http://localhost:5173

# Run tests (watch mode)
npm run test

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Code Standards

### TypeScript

- **Strict mode:** `"strict": true` in `tsconfig.json`
- **No `any`:** Use proper types or `unknown` + type guard
- **Interfaces over types:** Use `interface` for public APIs
- **JSDoc for exports:** Document public functions, components, types

**Example:**
```typescript
/**
 * Process image and extract text using hybrid OCR
 * @param file - Image file to process
 * @param options - Processing options
 * @returns Promise resolving to extracted text with confidence score
 * @throws Error if file is invalid or processing fails
 */
export async function processImage(
  file: File,
  options?: { preprocess?: boolean }
): Promise<OCRResult> {
  // ...
}
```

### React Components

- **Functional components only** (no class components)
- **Custom hooks** for shared logic
- **Props interface** named `{ComponentName}Props`
- **Export component as default** (if single export)

**Example:**
```typescript
interface ImageUploadProps {
  onFile: (file: File) => void;
  maxSizeMB?: number;
  accept?: string;
}

export default function ImageUpload({
  onFile,
  maxSizeMB = 20,
  accept = 'image/*',
}: ImageUploadProps) {
  // ...
  return <div>...</div>;
}
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| **Components** | PascalCase | `ImageUpload`, `GlassDropzone` |
| **Files** | Same as component | `ImageUpload.tsx` |
| **Functions** | camelCase | `processImage()`, `updateConsent()` |
| **Constants** | SCREAMING_SNAKE_CASE | `MIN_FILE_SIZE`, `DEFAULT_TIMEOUT` |
| **Hooks** | camelCase, prefix `use` | `useLocalHistory()`, `useOCRProcessor()` |
| **Types/Interfaces** | PascalCase | `OCRResult`, `ImageUploadProps` |
| **Events** | camelCase, prefix `on` | `onChange`, `onFilesSelected` |

### CSS & Styling

- **Tailwind CSS** for utility classes
- **CSS custom properties** for theming (dark/light mode)
- **No inline styles** unless dynamic
- **BEM naming** for custom CSS classes

**Example:**
```tsx
// ✅ Good
<div className="flex gap-4 rounded-lg border border-border bg-card p-4">
  <button className="btn btn-primary">Upload</button>
</div>

// ✅ Good (custom CSS with custom properties)
<div className="custom-dropzone" style={{ '--color': theme.primary }}>
  Drop here
</div>

// ❌ Bad (inline styles)
<div style={{ display: 'flex', gap: '16px' }}>
  Drop here
</div>
```

### Import Organization

```typescript
// 1. External libraries
import React from 'react';
import { useEffect } from 'react';

// 2. App imports (absolute paths)
import Button from '@/components/Button';
import { useLocalHistory } from '@/hooks/useLocalHistory';

// 3. Type imports (separate group)
import type { OCRResult, ImageFile } from '@/types';

// 4. Relative imports (if needed)
import { helper } from './utils';
```

---

## Accessibility (a11y) Requirements

### WCAG 2.1 Level AA Compliance

All components must support:

- ✅ **Keyboard navigation** — Tab through all interactive elements
- ✅ **Screen readers** — Proper ARIA labels and semantic HTML
- ✅ **Color contrast** — Minimum 4.5:1 for text, 3:1 for graphics
- ✅ **Focus visible** — Clear focus indicator (not removed)
- ✅ **Motion reduced** — Respect `prefers-reduced-motion`
- ✅ **Form labels** — All inputs have associated labels

### Checklist for Components

Before submitting PR, verify:

```html
<!-- ✅ Use semantic HTML -->
<button>Click me</button>  <!-- Not <div onClick={...}> -->
<nav>...</nav>             <!-- Not <div role="navigation"> -->
<main>...</main>           <!-- Not <div id="main-content"> -->

<!-- ✅ Provide ARIA labels -->
<button aria-label="Upload file">📤</button>
<div role="region" aria-label="Processing results">...</div>

<!-- ✅ Link labels to inputs -->
<label htmlFor="file-input">Select image:</label>
<input id="file-input" type="file" />

<!-- ✅ Indicate loading state -->
<button disabled aria-busy={isLoading}>
  {isLoading ? 'Processing...' : 'Process'}
</button>

<!-- ✅ Announce changes to screen readers -->
<div role="status" aria-live="polite">
  {resultMessage}
</div>
```

### Testing a11y Locally

```bash
# Run accessibility tests
npm run test -- a11y

# Or use browser tools
# 1. Install: Axe DevTools Chrome extension
# 2. Open DevTools → Axe DevTools → Scan
# 3. Fix any violations
```

### Resources

- [MDN ARIA Documentation](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Axe DevTools](https://www.deque.com/axe/devtools/)

---

## Commit Conventions

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

| Type | Use For |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (no logic change) |
| `refactor` | Code refactor (no feature/fix) |
| `perf` | Performance improvement |
| `test` | Test changes |
| `chore` | Build, deps, config |

### Examples

```bash
# ✅ Good commits
git commit -m "feat(ocr): add preprocessing options"
git commit -m "fix(a11y): improve focus trap in modals"
git commit -m "docs(contributing): update code standards"
git commit -m "refactor(services): simplify hybrid OCR flow"
git commit -m "test(routes): add guide page rendering tests"

# ❌ Avoid
git commit -m "fixed stuff"
git commit -m "WIP: trying something"
git commit -m "asjkdhaksjdhaksd"
```

### Commit Body

Include motivation and context:

```
feat(consent): implement Consent Mode v2

Adds Google Consent Mode v2 support with default denied state.
Wires CMP callbacks to update ad_storage, ad_user_data, ad_personalization.

- Default all consents to 'denied' on page load
- Add updateConsent() function for CMP integration
- Test with Tag Assistant Chrome extension
- See docs/adsense-submit.md for CMP wiring example
```

---

## Testing

### Run Tests

```bash
# Run all tests once
npm run test

# Run with coverage
npm run test -- --coverage

# Run specific test file
npm run test -- routes.spec.tsx

# Watch mode (auto-rerun on file change)
npm run test -- --watch
```

### Test Structure

Tests are in `__tests__/` and named `*.spec.tsx`:

```
__tests__/
├── routes.spec.tsx           # Route rendering validation
├── seo.spec.tsx              # SEO tags & JSON-LD validation
├── adsense-readiness.spec.tsx # AdSense slot & consent tests
├── deprecation.spec.tsx       # Deprecation policy enforcement
├── a11y.spec.tsx             # Accessibility checks
└── ...
```

### Writing Tests

**Use Testing Library** (not testing implementation details):

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('displays upload button', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
  });

  it('calls onFile when file is selected', async () => {
    const onFile = vi.fn();
    render(<MyComponent onFile={onFile} />);
    
    const input = screen.getByLabelText('Select file');
    await userEvent.upload(input, new File(['test'], 'test.txt'));
    
    expect(onFile).toHaveBeenCalled();
  });
});
```

### Coverage Goals

- **Line coverage:** ≥80%
- **Branch coverage:** ≥75%
- **Function coverage:** ≥80%

Check coverage:
```bash
npm run test -- --coverage
```

---

## Pull Request Process

### Before Submitting

1. **Update code:**
   ```bash
   npm run lint          # Fix linting issues
   npm run test          # Ensure tests pass
   npm run build         # Verify production build
   ```

2. **Check deprecation:**
   ```bash
   npm run test -- deprecation.spec.tsx
   # Ensure no legacy-shims imports in production code
   ```

3. **Branch from `main`:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/your-feature
   ```

### PR Title & Description

**Title:** Use commit convention format
```
feat(ocr): add image preprocessing options
```

**Description:** Explain what and why
```markdown
## Changes
- Add 5 new image preprocessing filters
- Make preprocessing optional (default off)
- Update SEO guides with preprocessing tip

## Testing
- ✅ Unit tests for each filter
- ✅ E2E test on slow connection
- ✅ A11y audit passed

## Checklist
- [x] Tests passing
- [x] No deprecation violations
- [x] A11y checked
- [x] Updated docs/README.md
```

### Labeling

Add labels to your PR:
- `type: feature` — New feature
- `type: bug` — Bug fix
- `type: docs` — Docs only
- `area: a11y` — Accessibility
- `area: seo` — SEO/guides
- `deploy:preview` — Request preview deployment

### Review Process

1. **Automated checks:**
   - GitHub Actions (lint, test, build)
   - Coverage reports
   - Deprecation checks

2. **Maintainer review:**
   - Code standards
   - Architecture fit
   - Deprecation policy

3. **Merge:**
   - Squash and merge to `main`
   - Use PR title as commit message

---

## Deprecation Policy

### When Deprecating Components

1. **Add `@deprecated` banner:**
   ```typescript
   /**
    * @deprecated Use <NewComponent /> instead
    * Timeline: Remove in v3.0 (2025-02-01)
    * Migration: See docs/DEPRECATED.md
    */
   export function OldComponent() { ... }
   ```

2. **Add to docs/DEPRECATED.md:**
   ```markdown
   ### OldComponent → NewComponent (Deprecated: 2025-01-01)
   
   **Migration Timeline:**
   - Phase 1 (Week 1-2): @deprecated banner added
   - Phase 2 (Week 3-4): Move to src/legacy-shims/
   - Phase 3 (Week 5+): Hard remove
   
   **Migration guide:**
   Before: <OldComponent prop="value" />
   After: <NewComponent newProp="value" />
   ```

3. **Move to legacy-shims:**
   ```bash
   mv src/components/OldComponent.tsx src/legacy-shims/OldComponent.ts
   # Update exports in src/legacy-shims/index.ts
   ```

4. **CI enforces migration:**
   ```bash
   npm run test
   # Error: Production code cannot import from src/legacy-shims
   ```

---

## Performance Tips

### Bundle Size

- **Use dynamic imports:** Avoid large upfront bundles
- **Lazy-load routes:** Use React.lazy() + Suspense
- **Tree-shake:** Export named, not default, when possible
- **Monitor:** `npm run analyze` generates bundle visualization

### Runtime Performance

- **Memoization:** Use `useMemo` for expensive computations
- **Callback memoization:** `useCallback` for event handlers
- **Virtualization:** Long lists should use windowing
- **Web Workers:** Offload heavy processing (OCR already does this)

### Testing Performance

```bash
npm run build
# Check bundle size in build output
# Target: <350 KB gzipped
```

---

## Documentation

### README Changes

Update `README.md` if you:
- Add a new feature
- Change user-facing behavior
- Update deployment process

### JSDoc Comments

Document public APIs:

```typescript
/**
 * Extract text from image using hybrid OCR
 * 
 * @param file - Image file (PNG, JPG, WEBP)
 * @param options - Processing options
 * @returns OCR result with extracted text and confidence
 * 
 * @example
 * const result = await processImage(file, { preprocess: true });
 * console.log(result.text, result.confidence);
 */
export async function processImage(file: File, options?: ProcessOptions): Promise<OCRResult> {
  // ...
}
```

### Inline Comments

Use for complex logic:

```typescript
// Convert color image to grayscale for better Tesseract performance
const canvas = createCanvas();
const ctx = canvas.getContext('2d');
ctx.filter = 'grayscale(100%)';
ctx.drawImage(img, 0, 0);
```

---

## Common Tasks

### Adding a New Feature

1. **Plan:** Open an issue, discuss approach
2. **Branch:** `git checkout -b feat/your-feature`
3. **Implement:** Follow code standards
4. **Test:** Add tests, run full suite
5. **Document:** Update README/JSDoc if needed
6. **PR:** Submit with description
7. **Merge:** Maintainer merges after review

### Fixing a Bug

1. **Issue:** Find or open bug report
2. **Branch:** `git checkout -b fix/bug-name`
3. **Root cause:** Add test that reproduces bug
4. **Fix:** Implement solution
5. **Verify:** Test passes
6. **PR:** Reference issue in PR description

### Updating Docs

1. **Edit** `README.md`, `docs/*.md`, or `CONTRIBUTING.md`
2. **Preview:** Verify Markdown renders correctly
3. **PR:** Submit docs change
4. **Note:** Tag `type: docs` label

---

## Help & Support

- **Questions?** Open a [GitHub Discussion](https://github.com/ParthibanRajasekaran/text-from-image/discussions)
- **Found a bug?** Open a [GitHub Issue](https://github.com/ParthibanRajasekaran/text-from-image/issues)
- **Architecture questions?** See [MIGRATION.md](./MIGRATION.md) and [docs/IMPLEMENTATION_SUMMARY.md](./docs/IMPLEMENTATION_SUMMARY.md)
- **Accessibility help?** Check [docs/a11y-audit-findings.md](./docs/a11y-audit-findings.md)

---

## Code of Conduct

We're committed to providing a welcoming and inclusive environment. Please:

- ✅ Be respectful and inclusive
- ✅ Assume good intent
- ✅ Help others learn
- ❌ No harassment, discrimination, or hate speech

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing!** 🎉

Questions? Open an issue or start a discussion!

