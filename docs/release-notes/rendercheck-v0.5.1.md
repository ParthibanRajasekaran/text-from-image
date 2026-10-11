# rendercheck v0.5.1

Package name: `@rendercheck/sdk` (renamed from `@freetextfromimage/rendercheck` in 0.5.0). Released 2026-10-11.

## Changed

- Release process only, no code changes. This is the first version published from GitHub Actions with npm trusted publishing, so it carries a provenance attestation that links the package to its source commit.
- 0.5.0 was published by hand from a maintainer's machine and has no provenance attestation. The code in 0.5.0 and 0.5.1 is the same.

## Package rename (from 0.5.0)

The package was renamed from `@freetextfromimage/rendercheck` to `@rendercheck/sdk`. The API is identical to 0.4.1; only the package name and import paths change. To migrate:

```
npm uninstall @freetextfromimage/rendercheck && npm install --save-dev @rendercheck/sdk
```

Then replace `@freetextfromimage/rendercheck` with `@rendercheck/sdk` in your imports. The old package stays on npm, deprecated, with a pointer to the new name.
