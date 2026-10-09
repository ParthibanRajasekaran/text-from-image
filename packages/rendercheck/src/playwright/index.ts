import { expect as baseExpect } from '@playwright/test';
import { toShowText } from './matcher';

export { toShowText } from './matcher';
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
 */
export const expect = baseExpect.extend({ toShowText });
export { test } from '@playwright/test';
