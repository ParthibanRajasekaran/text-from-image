# rendercheck v0.4.0

Package name at this version: `@freetextfromimage/rendercheck`. Released 2026-10-09.

## Added

- Locale rule packs. Playwright `toShowCurrency(amount, { currency, locale })` and `toShowDate(date, { locale })`, and Cypress `cy.matchCurrency` and `cy.matchDate`. The expected text is built with `Intl`. When a check fails, the message says whether the screen shows another currency or another locale's format.
- New core exports: `expectedCurrency`, `expectedDate`, `explainCurrency`, `explainDate`, `visibleText`, `ocrLangFor` and `isRtl`.
- Right-to-left support. Bidi direction marks and non-breaking spaces are ignored when comparing text. When `langPath` is set, the OCR language follows the locale.

## Notes

Earlier changes are listed in `packages/rendercheck/CHANGELOG.md`.
