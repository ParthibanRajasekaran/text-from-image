/**
 * Playwright matcher: `await expect(page).toShowText('Total: $14.00', { ... })`.
 *
 *   1. capture a screenshot of the viewport (Page) or the element (Locator)
 *   2. run OCR on it, locally
 *   3. for a Locator: also compare with the element's DOM text
 *   4. pass, or fail with a message that says what was read and how it differs
 *
 * Screenshots are taken with `scale: 'css'`, so a `region` is in CSS pixels from the top-left of
 * the screenshot (the viewport, or the element's box), whatever the device pixel ratio.
 */
import type { Locator, Page } from '@playwright/test';
import { verifyText } from '../core/verify';
import type { AssertionOptions, VerifyReport } from '../core/types';
import { callSite, clearFailure, recordFailure, reportDir } from '../core/failures';

const isPage = (r: Page | Locator): r is Page => typeof (r as Page).goto === 'function';

async function attempt(
  received: Page | Locator,
  expected: string,
  options: AssertionOptions
): Promise<{ report: VerifyReport; shot: Uint8Array }> {
  const shot = isPage(received)
    ? await received.screenshot({ scale: 'css', animations: 'disabled', caret: 'hide', fullPage: options.fullPage })
    : await received.screenshot({ scale: 'css', animations: 'disabled', caret: 'hide' });

  // DOM text only for a Locator, and only when asked for.
  const domText = !isPage(received) && options.dom !== false ? await received.innerText().catch(() => undefined) : undefined;
  return { report: await verifyText({ image: shot, expected, options, domText }), shot };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** The running test's file, line and title, when called from inside a Playwright test. */
async function testInfo(): Promise<{ file?: string; line?: number; title?: string } | undefined> {
  try {
    const { test } = await import('@playwright/test');
    const i = test.info();
    return { file: i.file, line: i.line, title: i.titlePath.slice(1).join(' › ') || i.title };
  } catch {
    return undefined;
  }
}

/**
 * Matcher function. Use it through `expect` from '@freetextfromimage/rendercheck/playwright',
 * or add it to your own `expect.extend({ toShowText })`.
 */
export async function toShowText(
  this: { isNot?: boolean },
  received: Page | Locator,
  expected: string,
  options: AssertionOptions = {}
) {
  const timeout = options.timeout ?? 5000;
  const interval = options.interval ?? 250;
  const wantPass = !this.isNot;
  const deadline = Date.now() + timeout;
  const site = callSite(new Error().stack); // where the test called the assertion

  // Like Playwright's own assertions, keep trying until the expectation holds or time is up.
  let last = await attempt(received, expected, options);
  while (last.report.pass !== wantPass && Date.now() < deadline) {
    await sleep(Math.min(interval, Math.max(0, deadline - Date.now())));
    last = await attempt(received, expected, options);
  }
  const report = last.report;

  // Final failure only (not each retry): leave a record for CI to annotate.
  if (wantPass && !report.pass && reportDir()) {
    try {
      const info = await testInfo();
      recordFailure({ report, image: last.shot, file: site?.file ?? info?.file, line: site?.line ?? info?.line, testTitle: info?.title });
    } catch {
      /* recording must never change the result of an assertion */
    }
  }

  // A test retry that passes replaces the failure its earlier attempt left behind.
  if (wantPass && report.pass && reportDir()) {
    try {
      const info = await testInfo();
      clearFailure({ file: site?.file ?? info?.file, line: site?.line ?? info?.line, testTitle: info?.title, expected });
    } catch {
      /* ignore */
    }
  }

  const message = () =>
    report.pass
      ? `Expected NOT to find text "[${expected}]" but OCR read "[${report.read}]" (Confidence: ${Math.round(report.confidence)}%)`
      : report.message;

  return {
    name: 'toShowText',
    pass: report.pass,
    message,
    expected,
    actual: report.read,
  };
}
