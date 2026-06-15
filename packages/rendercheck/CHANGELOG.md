# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
