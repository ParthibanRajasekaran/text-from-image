import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { TextEncoder, TextDecoder } from 'util';

// Extend Jest matchers for jest-axe
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
}

// Polyfill TextEncoder and TextDecoder for jsdom
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(function IntersectionObserver() {
  return {
    disconnect: vi.fn(),
    observe: vi.fn(),
    takeRecords: vi.fn(() => []),
    unobserve: vi.fn(),
  };
}) as any;

// Mock ResizeObserver
global.ResizeObserver = vi.fn(function ResizeObserver() {
  return {
    disconnect: vi.fn(),
    observe: vi.fn(),
    unobserve: vi.fn(),
  };
}) as any;

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock ClipboardEvent
global.ClipboardEvent = class ClipboardEvent extends Event {
  clipboardData: any;
  constructor(type: string, init?: any) {
    super(type, init);
    this.clipboardData = init?.clipboardData || null;
  }
} as any;
