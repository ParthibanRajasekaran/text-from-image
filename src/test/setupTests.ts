// Polyfill window.matchMedia for jsdom
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: query.includes('dark') ? false : true,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import { expect } from 'vitest';
expect.extend({ toHaveNoViolations });

// Polyfill URL.createObjectURL / URL.revokeObjectURL for jsdom
window.URL.createObjectURL = globalThis.vi?.fn?.(() => 'blob:mock-url') || (() => 'blob:mock-url');
window.URL.revokeObjectURL = globalThis.vi?.fn?.(() => {}) || (() => {});

// Silence noisy React errors during tests
const originalError = console.error;
globalThis.beforeAll?.(() => {
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) return;
    originalError(...args);
  };
});
globalThis.afterAll?.(() => {
  console.error = originalError;
});
