import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';

/** Make a PNG of a screenshot-like page that contains an email and a card number. */
async function makeImage(page: Page): Promise<Buffer> {
  const p = await page.context().newPage();
  await p.setViewportSize({ width: 640, height: 220 });
  await p.setContent(
    `<body style="margin:0;background:#fff;color:#000;font:28px Arial;padding:24px">
       <div>Contact: jane.doe@example.com</div>
       <div style="margin-top:20px">Card: 4242 4242 4242 4242</div>
       <div style="margin-top:20px">Order shipped today</div>
     </body>`
  );
  const buf = await p.screenshot();
  await p.close();
  return buf;
}

test.describe('Redact an image', () => {
  test('finds an email and a card, and the downloaded image no longer contains them', async ({ page }) => {
    const foreign: string[] = [];
    const origin = new URL(page.url() === 'about:blank' ? 'http://localhost' : page.url()).origin;
    page.on('request', (r) => {
      const u = new URL(r.url());
      if (!/^(data|blob):/.test(r.url()) && u.hostname !== 'localhost' && u.hostname !== '127.0.0.1') foreign.push(r.url());
    });
    void origin;

    const png = await makeImage(page);
    await page.goto('/redact-image');
    await page.getByTestId('redact-input').setInputFiles({ name: 'shot.png', mimeType: 'image/png', buffer: png });

    const findings = page.getByTestId('redact-findings');
    await expect(findings).toContainText('jane.doe@example.com', { timeout: 90_000 });
    await expect(findings).toContainText('4242');
    expect(await page.getByTestId('redact-box').count()).toBeGreaterThanOrEqual(2);

    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download redacted image' }).click()]);
    const out = fs.readFileSync((await download.path())!);
    expect(out.subarray(1, 4).toString()).toBe('PNG');

    // Read the redacted image again with the same tool: nothing sensitive should be found.
    await page.getByRole('button', { name: 'Start over' }).click();
    await page.getByTestId('redact-input').setInputFiles({ name: 'out.png', mimeType: 'image/png', buffer: out });
    await expect(page.getByTestId('redact-status')).toContainText(/Nothing that looks sensitive|Found/, { timeout: 90_000 });
    await expect(page.getByTestId('redact-status')).toContainText('Nothing that looks sensitive');

    expect(foreign).toEqual([]);
  });
});
