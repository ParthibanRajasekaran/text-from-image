import { test, expect } from '@playwright/test';
import fs from 'node:fs';

// Answer every question with its riskiest option (always the last button here, except where noted).
async function answerAll(page: import('@playwright/test').Page, pick: 'first' | 'last') {
  for (let i = 0; i < 9; i++) {
    await expect(page.getByText(`Question ${i + 1} of 9`)).toBeVisible();
    const buttons = page.locator('section h2 ~ div button');
    await (pick === 'first' ? buttons.first() : buttons.last()).click();
  }
}

test.describe('Verification Debt Score', () => {
  test('the radar is live while answering and a result is shareable', async ({ page }) => {
    await page.goto('/verify-debt-score');
    const shape = page.getByTestId('debt-radar-shape');
    const before = await shape.getAttribute('points');
    await page.locator('section h2 ~ div button').last().click();
    await expect.poll(() => shape.getAttribute('points')).not.toBe(before);

    // finish
    for (let i = 1; i < 9; i++) await page.locator('section h2 ~ div button').last().click();
    await expect(page.getByText('Share your score')).toBeVisible();
    await expect(page).toHaveURL(/#r=\d{9}$/);
  });

  test('Download image gives a 1200x630 PNG', async ({ page }) => {
    await page.goto('/verify-debt-score');
    await answerAll(page, 'last');
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download image' }).click()]);
    const file = await download.path();
    const buf = fs.readFileSync(file!);
    expect(buf.subarray(1, 4).toString()).toBe('PNG');
    expect(buf.readUInt32BE(16)).toBe(1200);
    expect(buf.readUInt32BE(20)).toBe(630);
    expect(buf.length).toBeGreaterThan(10_000);
  });

  test('a shared link restores the result', async ({ page }) => {
    await page.goto('/verify-debt-score#r=000000000');
    await expect(page.getByText('Share your score')).toBeVisible();
    await expect(page.getByText('✓ Low (0-25)')).toBeVisible();
    await page.goto('/verify-debt-score#r=bogus');
    await page.reload(); // a hash-only change is not a new page load
    await expect(page.getByText('Question 1 of 9')).toBeVisible();
  });

  test('the worst answers reach Critical', async ({ page }) => {
    await page.goto('/verify-debt-score#r=012200000');
    await expect(page.getByText(/\/ 100/).first()).toBeVisible();
    await page.goto('/verify-debt-score');
    await page.reload();
    await answerAll(page, 'last');
    await expect(page.getByText(/Critical/).first()).toBeVisible();
  });
});
