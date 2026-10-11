# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2026-10-11

### Changed

- **Renamed** from `@freetextfromimage/rendercheck` to `@rendercheck/sdk`. The API is identical to 0.4.1; only the
  package name and import paths change. To migrate, run
  `npm uninstall @freetextfromimage/rendercheck && npm install --save-dev @rendercheck/sdk` and replace
  `@freetextfromimage/rendercheck` with `@rendercheck/sdk` in your imports. The old package stays on npm,
  deprecated, with a pointer to the new name.

## [0.4.1] - 2026-10-10

### Changed

- Package metadata only, no code changes: the npm homepage now points to https://getrendercheck.com/rendercheck
  (it still pointed at the old domain), and `author` links to the maintainer's GitHub profile.
- README: added a Links section (documentation, architecture and security model, issues, security reports).

## [0.4.0] - 2026-10-09

### Added

- Locale rule packs. Playwright `toShowCurrency(amount, { currency, locale })` and `toShowDate(date, { locale })`,
  Cypress `cy.matchCurrency` and `cy.matchDate`. The expected text is built with `Intl`, and a failure says
  whether the screen shows another currency or another locale's format.
- Core exports: `expectedCurrency`, `expectedDate`, `explainCurrency`, `explainDate`, `visibleText`, `ocrLangFor`, `isRtl`.
- Right-to-left support: bidi direction marks and non-breaking spaces are ignored when comparing text.
  With `langPath` set, the OCR language follows the locale.

## [0.3.0] - 2026-10-09

### Added

- `VerifyReport.box`: where on the screenshot the failing text is (the line that best matches what you expected).
- Failure records for CI. On a failed assertion RenderCheck can write a JSON file and a copy of the screenshot
  with the failing text outlined in red. It is off unless `RENDERCHECK_REPORT_DIR` is set, and defaults to
  `rendercheck-report` on GitHub Actions. Playwright records the test file and line; Cypress the spec and title.
  A retry that passes removes the record. Core exports: `recordFailure`, `clearFailure`, `markRegion`, `callSite`.
- GitHub Action (`packages/rendercheck/action`): annotates the pull request on the failing test line with what OCR
  read and the failing region, writes a job summary table, and uploads the outlined screenshots as an artifact.

## [0.2.0] - 2026-10-09

### Breaking

- Removed `verify()` and its API mode. It uploaded the screenshot to the FreeTextFromImage API with an
  API key. RenderCheck now runs OCR locally and makes no network calls.

### Added

- `@freetextfromimage/rendercheck/playwright`: `expect` with the `toShowText` matcher (retrying, `.not`,
  locator DOM check, `region`, `minConfidence`, `minContrastRatio`).
- `@freetextfromimage/rendercheck/cypress` and `/cypress/plugin`: `cy.matchText`.
- `@freetextfromimage/rendercheck/core`: `verifyText`, `recognize`, WCAG 2.1 contrast analysis.
- Failure messages that say what OCR read and where it differs.
- Example Playwright and Cypress suites on a mock checkout page (Cypress run in Cypress 13.17, Electron).

## [0.1.0] - 2026-06-15

### Added

- Initial release of RenderCheck
- `verify()` function for comparing screenshot text against expected content
- Support for both file paths and image buffers
- API mode using FreeTextFromImage OCR API
- Playwright and Cypress integration examples
- TypeScript types and full type safety
- Comprehensive test suite
- Privacy-first design (no image/text persistence)

### Known Limitations

- Local OCR mode not yet supported (API mode only)
- Text matching is word-based and case-insensitive
- OCR accuracy depends on image quality
- Does not verify layout, colour, or accessibility
