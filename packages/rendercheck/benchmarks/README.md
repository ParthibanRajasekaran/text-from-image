# RenderCheck benchmark

Read this first: **this is a self-made suite.** The fixtures were written by the author of RenderCheck, the labels are the author's judgement, and the fixtures were chosen to show one class of bug. It is evidence that the class exists and that pixel-level checking sees it. It is **not** a claim of general accuracy, and it says nothing about how RenderCheck performs on your app, your fonts or real-world pages.

The class of bug: the DOM says the text is there, but a person cannot read it.

## What it does

`npm run bench` (from `packages/rendercheck`) builds the package, then:

1. Renders each tiny HTML fixture in Chromium via Playwright and takes a screenshot.
2. Runs two checks on every fixture:
   - **Naive DOM assertion**: Playwright `expect(locator).toContainText(expected)` on the target element.
   - **RenderCheck**: `verifyText({ image, expected, options: { minContrastRatio: 4.5 } })` on the screenshot. No DOM text is passed, so only pixels are judged. Other options are the defaults (OCR confidence 80, case-sensitive).
3. Labels each result against the fixture's `truth` (`bug` = a person cannot read the expected text as expected, `ok` = they can) and writes `results.json` and `results.md`.

A detector "flags" a fixture when its assertion fails. TP = bug flagged, FN = bug missed, FP = readable text flagged, TN = readable text passed.

Run it: `RENDERCHECK_BENCH_CHROMIUM=/path/to/chrome npm run bench` (the variable is optional; without it Playwright uses its own installed Chromium). Screenshots go to `benchmarks/out/` (git-ignored). Nothing here is part of the published package (`files` is unchanged) and vitest does not collect it.

## Results

From the committed run (`results.md` has the per-fixture table, environment versions and OCR time for every fixture):

| Detector | TP | FN | FP | TN |
| --- | --- | --- | --- | --- |
| Naive DOM assertion | 0 | 13 | 0 | 8 |
| RenderCheck, minContrastRatio 4.5 | 12 | 1 | 3 | 5 |

21 fixtures: 13 with a bug, 8 where a person can read the text.

How to read this honestly:

- The naive assertion scores 0 of 13 **by construction**. Every bug fixture was built so that the element exists and its text contains the expected string. The suite does not show the naive assertion is a bad test in general; it shows it cannot see this bug class.
- RenderCheck is not perfect on this suite even though the author wrote the fixtures: it missed 1 bug and raised 3 false alarms. Those four results are the useful part.

## Where RenderCheck was wrong or missed

- **Missed: `limit-same-text-visible-elsewhere`.** The target element is invisible, but another element on the page shows the same words. A whole-screenshot check finds them there and passes. Screenshotting the element or passing a `region` avoids this; the benchmark deliberately does not.
- **False alarm: `control-aa-boundary-grey`.** `#767676` on white is about 4.5:1 by the WCAG formula, but RenderCheck measures contrast from rendered pixels and measured 4.35 in the committed run (likely anti-aliasing, not verified). Text sitting exactly on the AA line can be flagged. Treat the threshold as approximate near the boundary.
- **False alarm: `limit-large-text-3-to-1`.** Large text at about 3.4:1 passes WCAG AA for large text (3:1) but fails the 4.5:1 this run asks for. `verifyText` applies the single `minContrastRatio` you give it and does not switch to the large-text threshold. This is a configuration mismatch more than an error, but it is a false positive against the rule most teams mean.
- **False alarm: `limit-small-text-9px`.** 9px text that a person can read at 1x was misread by OCR (see the "OCR read" column in `results.md`) and reported as not found. Tiny text is where OCR is weakest.
- **Weak signal: `white-on-near-white`.** It was caught, but via `LOW_CONFIDENCE`, not a contrast measurement. Near-identical colours leave OCR too little signal to produce a contrast number, so the failure reason is less precise than for the other low-contrast fixtures.

## Other limits

- **Decorative fonts are not really tested.** `limit-decorative-font` asks for a cursive face, but the benchmark machine has no cursive font installed and the browser fell back to the default sans (italic). That fixture passing says nothing about script or display fonts, which OCR is expected to handle worse. Add real font files before drawing any conclusion.
- **Fonts and rendering depend on the machine.** Outcomes near the thresholds (the three false alarms above, `white-on-near-white`) could differ with other fonts, other Chromium versions or other display scaling. The run is deterministic on one machine; it was repeated and the pass/fail matrix was identical, but that is not a cross-machine guarantee.
- **English text only, one viewport, one device scale factor** (520x120 at 1x), one short phrase per fixture. No real pages, no photos behind text, no animation, no right-to-left or non-Latin text.
- **"Truth" is a judgement.** For example, `mid-grey-fails-aa` is readable to many people and is labelled a bug only because it fails the 4.5:1 AA threshold this run applies.
- **Small n.** With 21 fixtures, do not turn the counts into percentages or compare them with other tools.

## Timing

`results.md` lists the OCR time for each fixture (the OCR step only, after one warm-up run, on the machine named there). Blank or nearly blank screenshots return in a few milliseconds and text-heavy ones take longer; the committed run ranges from 5 ms to 212 ms across fixtures. Timings vary between runs; the TP/FN/FP/TN columns do not.

## Reproducing and extending

- `fixtures.mjs` holds the fixtures. Add one object with `id`, `cls`, `truth`, `expected`, `why` and `html`.
- `run.mjs` is the runner. It uses only the built package plus `@playwright/test`, already a dev dependency.
- If you add fixtures you think are fairer to the naive assertion or harder for RenderCheck, please send them; that is how the suite gets more honest.
