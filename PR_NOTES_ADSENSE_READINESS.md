PR: Feat/adsense-readiness — AdSense readiness, guide layout and a11y fixes

Summary

- Mounts AutoAds globally and wires consent-gated InArticle slots (one mid-article slot) across all guide pages.
- Adds `GuideLayout` and `TableWrap` components and updates guide pages for consistent visuals.
- Replaces the V3 IntentPage inline placeholder with a consent-gated InArticle slot.
- Fixes accessibility heading-order by promoting site title to <h1> and making footer headings semantic (<h3>) while preserving visual size.

Files changed (high level)

- src/ads/AutoAds.tsx (script loader) — existing
- src/ads/InArticle.tsx (consent-gated slot) — existing
- components/v3/IntentPage.tsx — replaced InlineAdSlot with InArticle and added env gating
- pages/CopyTextFromImageGuide.tsx — added InArticle slot + env gating
- pages/JpgToExcelGuide.tsx — added InArticle slot + env gating
- App.tsx — accessibility: skip link, header h1, footer headings h3 (visual size preserved)

Why

- Preserve Production pixel-parity: ad slots are feature-flag gated and default to not showing in Production unless flags are set.
- Ensure CLS-free reserved space for ad slots.
- Improve accessibility (heading order) to satisfy automated a11y checks.

Verification steps (local)

1. Install deps and start dev server

```bash
npm install
npm run dev
# open http://localhost:3000 or the alternate port printed by Vite
```

2. Run tests (unit + accessibility)

```bash
npm run test
```

Expected results

- All tests should pass (vitest). Accessibility tests for `layout.accessibility.a11y.spec.tsx` should be green after the heading fixes.
- No runtime errors in dev server.
- With no flags set (production-like), no `<ins.adsbygoogle>` elements should be mounted. With `VITE_ADS_SLOTS_ENABLED=true` (or preview flag), the InArticle reserved slots will be present and will mount `<ins.adsbygoogle>` only when consent is `'granted'` and the AdSense script is present.

How to create a PR locally

```bash
# From your feature branch (changes are made locally on feat/adsense-readiness)
git checkout -b feat/adsense-readiness
git add .
git commit -m "feat(ads): Add consent-gated InArticle slots to guides; fix heading order a11y"
git push origin feat/adsense-readiness
# then open a PR on GitHub comparing feat/adsense-readiness -> main
```

Notes & safety

- No ad script will load in Production unless `VITE_ADSENSE_PUB_ID` is set and consent is granted.
- The consent defaults are intentionally set to denied so that ads never fire until a certified CMP updates consent.
- If you want me to open the PR for you, I can prepare the branch and PR body here; however I don't have network push permission from this environment. I can provide the exact git commands (above) and the PR body.

Follow-ups

- Add a tiny integration test that verifies the InArticle slot renders its reserved container when `VITE_ADS_SLOTS_ENABLED=true` in preview mode.
- Add documentation for CMP integration and consent wiring in `docs/`.
