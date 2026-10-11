/**
 * Cypress, Node side. Register it in `setupNodeEvents`:
 *
 *   import { registerRenderCheck } from '@rendercheck/sdk/cypress/plugin';
 *   export default defineConfig({ e2e: { setupNodeEvents(on) { registerRenderCheck(on); } } });
 *
 * The browser cannot run Tesseract on a screenshot file, so `cy.matchText` hands the screenshot to
 * this task, which runs the same local OCR as the Playwright matcher. No network is involved.
 */
import { verifyText } from '../core/verify';
import { shutdown } from '../core/ocr';
import type { VerifyReport } from '../core/types';
import { clearFailure, recordFailure } from '../core/failures';

import { TASK_NAME, type VerifyTaskArgs } from './plugin-shared';

export { TASK_NAME };
export type { VerifyTaskArgs };

type Events = { (action: 'task', tasks: Record<string, (arg: never) => unknown>): void; (action: 'after:run', fn: () => unknown): void };

export async function verifyTask(args: VerifyTaskArgs): Promise<Omit<VerifyReport, 'ocr'> & { ocr: { text: string; words: number } }> {
  const report = await verifyText({
    image: Buffer.from(args.imageBase64, 'base64'),
    expected: args.expected,
    options: args.options,
    domText: args.domText,
  });
  try {
    if (report.pass) clearFailure({ file: args.spec, testTitle: args.testTitle, expected: args.expected });
    else recordFailure({ report, image: Buffer.from(args.imageBase64, 'base64'), file: args.spec, testTitle: args.testTitle });
  } catch {
    /* recording must never change the result of an assertion */
  }
  // Cypress tasks must return JSON. Keep the answer small.
  return { ...report, ocr: { text: report.ocr.text, words: report.ocr.words.length } };
}

export function registerRenderCheck(on: Events): void {
  on('task', { [TASK_NAME]: verifyTask as (arg: never) => unknown });
  on('after:run', () => shutdown());
}
