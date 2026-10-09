/**
 * Cypress, browser side. Import it from your support file:
 *
 *   import '@freetextfromimage/rendercheck/cypress';
 *
 *   cy.visit('/checkout');
 *   cy.matchText('Total: $14.00', { minConfidence: 85, minContrastRatio: 4.5 });
 *   cy.get('.total').matchText('Total: $14.00');          // the element's screenshot, plus its DOM text
 *
 * Needs `registerRenderCheck(on)` in setupNodeEvents (see ./plugin).
 */
import type { AssertionOptions } from '../core/types';
import { TASK_NAME, type VerifyTaskArgs } from './plugin-shared';

export type { AssertionOptions };

type Report = { pass: boolean; message: string; read: string; confidence: number };

// Minimal view of the Cypress globals this file uses, so it type-checks without Cypress installed.
interface CyLike {
  screenshot(name: string, opts: Record<string, unknown>): CyLike;
  readFile(path: string, enc: string, opts?: Record<string, unknown>): CyLike;
  task(name: string, arg: unknown, opts?: Record<string, unknown>): CyLike;
  wrap(v: unknown, opts?: Record<string, unknown>): CyLike;
  then(fn: (v: never) => unknown): CyLike;
  wait(ms: number, opts?: Record<string, unknown>): CyLike;
}
declare const cy: CyLike;
declare const Cypress: {
  Commands: { add(name: string, opts: unknown, fn: (...args: never[]) => unknown): void };
  spec?: { relative?: string };
  currentTest?: { titlePath?: string[]; title?: string };
};

const DEFAULT_TIMEOUT = 5000;
const DEFAULT_INTERVAL = 250;

export function addMatchTextCommand(): void {
  Cypress.Commands.add(
    'matchText',
    { prevSubject: ['optional', 'element'] },
    ((subject: { text(): string } | undefined, expected: string, options: AssertionOptions = {}) => {
      const timeout = options.timeout ?? DEFAULT_TIMEOUT;
      const interval = options.interval ?? DEFAULT_INTERVAL;
      const started = Date.now();
      const domText = subject && options.dom !== false ? subject.text() : undefined;

      const run = (): CyLike => {
        let shotPath = '';
        const opts = {
          log: false,
          overwrite: true,
          capture: options.fullPage ? 'fullPage' : 'viewport',
          onAfterScreenshot: (_el: unknown, props: { path: string }) => {
            shotPath = props.path;
          },
        };
        const shot = subject
          ? (cy.wrap(subject, { log: false }) as unknown as { screenshot: CyLike['screenshot'] }).screenshot('rendercheck', opts)
          : cy.screenshot('rendercheck', opts);
        return shot
          .then((() => cy.readFile(shotPath, 'base64', { log: false })) as never)
          .then(((imageBase64: string) => {
            const test = Cypress.currentTest;
            const args: VerifyTaskArgs = {
              imageBase64,
              expected,
              options,
              domText,
              spec: Cypress.spec?.relative,
              testTitle: test?.titlePath?.join(' › ') || test?.title,
            };
            return cy.task(TASK_NAME, args, { log: false, timeout: 60_000 });
          }) as never)
          .then(((report: Report) => {
            if (report.pass || Date.now() - started >= timeout) {
              if (!report.pass) throw new Error(report.message);
              return report;
            }
            return cy.wait(interval, { log: false }).then((() => run()) as never);
          }) as never);
      };
      return run();
    }) as never
  );
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      /** Assert that the screenshot (or the subject element's screenshot) visibly shows this text, via local OCR. */
      matchText(expected: string, options?: AssertionOptions): Chainable<Subject>;
    }
  }
}

// Importing this file from the support file registers the command.
if (typeof Cypress !== 'undefined') addMatchTextCommand();
