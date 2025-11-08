# ADR 0001: Adopt Spec-Driven Development (SDD)

## Status
Accepted

## Context
To improve reliability, accessibility, and maintainability, we are migrating to Spec-Driven Development (SDD). This approach introduces product, API, schema, UX, and AI specs as first-class citizens, with CI gates to enforce contracts and BDD scenarios.

## Decision
- Add `/specs` folder for product features, schemas, API, UX contracts, and AI goldens.
- Wire Spectral, oasdiff, jsonschema-diff, and Playwright BDD into CI.
- Require all PRs to pass spec lint, schema validation, contract diff, and BDD tests.
- Document spec usage and PR checklist in README.

## Consequences
- Any breaking change to API/schema/UX contracts must bump version and update tests.
- BDD scenarios must pass for all features.
- App behavior remains unchanged; new preview respects CLS and a11y rules.
- Future changes violating specs or contracts will fail CI.
