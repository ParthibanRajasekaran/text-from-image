import { renderHook, act } from '@testing-library/react';
import { useShortcuts, getCommonShortcuts } from '../hooks/useShortcuts';

describe('useShortcuts', () => {
  let mockCallback: jest.Mock;

  beforeEach(() => {
    mockCallback = jest.fn();
  });

  it('triggers callback when matching key is pressed', () => {
    const shortcuts = [
      {
        key: 'c',
        action: mockCallback,
        description: 'Copy',
      },
    ];

    renderHook(() => useShortcuts(shortcuts, true));

    const event = new KeyboardEvent('keydown', { key: 'c' });
    act(() => {
      window.dispatchEvent(event);
    });

    expect(mockCallback).toHaveBeenCalled();
  });

  it('does not trigger when shortcuts are disabled', () => {
    const shortcuts = [
      {
        key: 'c',
        action: mockCallback,
        description: 'Copy',
      },
    ];

    renderHook(() => useShortcuts(shortcuts, false));

    const event = new KeyboardEvent('keydown', { key: 'c' });
    act(() => {
      window.dispatchEvent(event);
    });

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('does not trigger when typing in input field', () => {
    const shortcuts = [
      {
        key: 'c',
        action: mockCallback,
        description: 'Copy',
      },
    ];

    renderHook(() => useShortcuts(shortcuts, true));

    // Create input and dispatch event from it
    const input = document.createElement('input');
    document.body.appendChild(input);

    const event = new KeyboardEvent('keydown', {
      key: 'c',
      bubbles: true,
    });
    Object.defineProperty(event, 'target', { value: input });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(mockCallback).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('respects modifier keys', () => {
    const shortcuts = [
      {
        key: 's',
        ctrlKey: true,
        action: mockCallback,
        description: 'Save',
      },
    ];

    renderHook(() => useShortcuts(shortcuts, true));

    // Without ctrl key
    const event1 = new KeyboardEvent('keydown', { key: 's' });
    act(() => {
      window.dispatchEvent(event1);
    });
    expect(mockCallback).not.toHaveBeenCalled();

    // With ctrl key
    const event2 = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
    act(() => {
      window.dispatchEvent(event2);
    });
    expect(mockCallback).toHaveBeenCalled();
  });

  it('skips disabled shortcuts', () => {
    const shortcuts = [
      {
        key: 'c',
        action: mockCallback,
        description: 'Copy',
        disabled: true,
      },
    ];

    renderHook(() => useShortcuts(shortcuts, true));

    const event = new KeyboardEvent('keydown', { key: 'c' });
    act(() => {
      window.dispatchEvent(event);
    });

    expect(mockCallback).not.toHaveBeenCalled();
  });
});

describe('getCommonShortcuts', () => {
  it('returns array of shortcuts', () => {
    const handlers = {
      onCopy: jest.fn(),
      onDownload: jest.fn(),
    };

    const shortcuts = getCommonShortcuts(handlers);

    expect(Array.isArray(shortcuts)).toBe(true);
    expect(shortcuts.length).toBeGreaterThan(0);
  });

  it('disables shortcuts without handlers', () => {
    const handlers = {
      onCopy: jest.fn(),
      // onDownload not provided
    };

    const shortcuts = getCommonShortcuts(handlers);
    const copyShortcut = shortcuts.find((s) => s.key === 'c');
    const downloadShortcut = shortcuts.find((s) => s.key === 'd');

    expect(copyShortcut?.disabled).toBe(false);
    expect(downloadShortcut?.disabled).toBe(true);
  });
});
