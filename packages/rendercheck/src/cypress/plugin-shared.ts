import type { AssertionOptions } from '../core/types';

export const TASK_NAME = 'rendercheck:verify';

export interface VerifyTaskArgs {
  /** Screenshot bytes, base64. */
  imageBase64: string;
  expected: string;
  options?: AssertionOptions;
  domText?: string;
  /** Spec file (project-relative) and test title, for failure records. */
  spec?: string;
  testTitle?: string;
}
