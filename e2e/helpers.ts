import { expect, type BrowserContext, type Page } from '@playwright/test';

// The only third-party hosts the CSP allows (web fonts). They are answered locally so the
// tests do not depend on the network, and they are excluded from the OCR-run assertions.

export interface Recorder {
  problems: string[];
  requests: Array<{ url: string; method: string; at: number }>;
}

export async function record(context: BrowserContext, page: Page): Promise<Recorder> {
  const rec: Recorder = { problems: [], requests: [] };

  // Console messages from the page AND from its workers.
  context.on('console', (msg) => {
    if (msg.type() === 'error') rec.problems.push(`console.error: ${msg.text()}`);
  });
  page.on('pageerror', (err) => rec.problems.push(`pageerror: ${err.message}`));
  context.on('request', (req) => {
    rec.requests.push({ url: req.url(), method: req.method(), at: Date.now() });
  });

  // Catch CSP violations raised in the page itself, even if they are not logged.
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      (window as unknown as { __csp: string[] }).__csp ??= [];
      (window as unknown as { __csp: string[] }).__csp.push(
        `${e.violatedDirective} blocked ${e.blockedURI}`
      );
    });
  });

  return rec;
}

export async function cspViolations(page: Page): Promise<string[]> {
  return page.evaluate(() => (window as unknown as { __csp?: string[] }).__csp ?? []);
}


/**
 * Run `start` (which should hand an image to the demo) and wait until a NEW run has finished.
 * Checking the phase alone is not enough: it still says "done" from the previous run until
 * the new one begins.
 */
export async function waitForNewRun(page: Page, start: () => Promise<void>, timeout = 90_000): Promise<void> {
  const status = page.getByTestId('hero-demo-status');
  const prev = Number((await status.getAttribute('data-run')) ?? 0);
  await start();
  await expect
    .poll(
      async () => {
        const run = Number((await status.getAttribute('data-run')) ?? 0);
        const phase = await status.getAttribute('data-phase');
        return run > prev && (phase === 'done' || phase === 'error');
      },
      { timeout, intervals: [100, 250, 500] }
    )
    .toBe(true);
  await expect(status).toHaveAttribute('data-phase', 'done');
}
