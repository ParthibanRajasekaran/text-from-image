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

// jsdom has no IntersectionObserver. The shared scroll reveal (components/ui/reveal.ts) uses
// whileInView, so without this every route that reveals on scroll logs a crash that the route error
// boundary swallows. Individual specs can still replace it with their own mock.
if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class {
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
}
