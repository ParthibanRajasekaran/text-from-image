import type { AssertionOptions } from '../core/types';

export const TASK_NAME = 'rendercheck:verify';

export interface VerifyTaskArgs {
  /** Screenshot bytes, base64. */
  imageBase64: string;
  expected: string;
  options?: AssertionOptions;
  domText?: string;
}
