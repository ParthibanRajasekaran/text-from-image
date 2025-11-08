# Accessibility & SEO Test Suite

## Running Tests

- **Run all tests:**
  ```bash
  npm run test
  ```
- **Watch mode:**
  ```bash
  npm run test:watch
  ```
- **Accessibility-only tests:**
  ```bash
  npm run test:a11y
  ```

## Troubleshooting
- If you see errors about missing globals (`describe`, `it`, `expect`, `vi`), ensure Vitest is installed and configured in vite.config.ts.
- If you see jsdom errors, check vite.config.ts for `test: { environment: 'jsdom', setupFiles: 'src/test/setupTests.ts' }`.
- If you see React warnings, they are silenced in `src/test/setupTests.ts`.
- Polyfills for `URL.createObjectURL` and `URL.revokeObjectURL` are provided in setupTests.ts.

## Test Coverage
- **layout.accessibility.a11y.spec.tsx**: One <main> landmark, skip link focus, axe check
- **uploader.preview.a11y.spec.tsx**: Accessible name, preview behavior, create/revoke URL, axe check
- **modal.inert.a11y.spec.tsx**: (TODO) Modal inert/focus trap if modal exists
- **seo.head.spec.tsx**: Title, meta, canonical, axe check

## Adding More Tests
- Place new tests in `src/test/`.
- Use TypeScript and keep tests small and readable.
- Prefer `customRender` from `src/test/utils.tsx` for consistent setup.

## CI Integration
- To add CI, create a job in `.github/workflows/test.yml`:
  ```yaml
  name: Test
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
          with:
            node-version: 20
        - run: npm ci
        - run: npm run test
  ```
