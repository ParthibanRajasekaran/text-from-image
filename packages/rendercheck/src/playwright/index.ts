import { expect as baseExpect } from '@playwright/test';
import { toShowCurrency, toShowDate, toShowText } from './matcher';

export { toShowText, toShowCurrency, toShowDate } from './matcher';
export type { CurrencyOptions, DateOptions } from './matcher';
export { expectedCurrency, expectedDate } from '../core/locale';
export { shutdown } from '../core/ocr';
export type { AssertionOptions, VerifyReport, Region, FailureKind } from '../core/types';

/**
 * Playwright's `expect` plus `toShowText`:
 *
 *   import { test } from '@playwright/test';
 *   import { expect } from '@freetextfromimage/rendercheck/playwright';
 *
 *   await expect(page).toShowText('Total: $14.00', { minConfidence: 85, minContrastRatio: 4.5 });
 *   await expect(page.locator('.total')).toShowText('Total: $14.00');
 *   await expect(page).toShowCurrency(1234.5, { currency: 'EUR', locale: 'de-DE' });
 *   await expect(page).toShowDate('2026-03-04', { locale: 'en-GB' });
 */
export const expect = baseExpect.extend({ toShowText, toShowCurrency, toShowDate });
export { test } from '@playwright/test';
