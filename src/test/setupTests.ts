import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

declare var expect: any;
declare var beforeAll: any;
declare var afterAll: any;
declare var vi: any;

expect.extend({ toHaveNoViolations });

// Polyfill URL.createObjectURL / URL.revokeObjectURL for jsdom
if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
}
if (!window.URL.revokeObjectURL) {
  window.URL.revokeObjectURL = vi.fn();
}

// Silence noisy React errors during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) return;
    originalError(...args);
  };
});
afterAll(() => {
  console.error = originalError;
});
