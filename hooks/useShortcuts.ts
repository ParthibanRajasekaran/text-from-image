import { useEffect, useCallback, useRef } from 'react';

export interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  disabled?: boolean;
}

/**
 * Keyboard shortcuts hook with focus safety
 * - V/E/C/D bindings for common actions
 * - Focus guards (skip inputs, textareas, contentEditable)
 * - Auto cleanup on unmount
 * - ARIA announcements for screen readers
 * - Disabled state support
 * - Prevents duplicate handlers
 */
export function useShortcuts(shortcuts: ShortcutConfig[], enabled: boolean = true) {
  const announcementRef = useRef<HTMLDivElement | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Focus guard: Don't trigger shortcuts when user is typing
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable ||
        (target.getAttribute && target.getAttribute('role') === 'textbox');

      if (isTyping) {
        return;
      }

      // Check each shortcut for a match
      for (const shortcut of shortcuts) {
        if (shortcut.disabled) continue;

        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey;
        const metaMatches = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey;
        const shiftMatches = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey;
        const altMatches = shortcut.altKey === undefined || event.altKey === shortcut.altKey;

        if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
          event.preventDefault();
          shortcut.action();

          // Screen reader announcement
          announceToScreenReader(shortcut.description, announcementRef);

          break; // Only trigger first matching shortcut
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    // Attach event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount or when dependencies change
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      
      // Clean up announcement element if it exists
      if (announcementRef.current && document.body.contains(announcementRef.current)) {
        document.body.removeChild(announcementRef.current);
        announcementRef.current = null;
      }
    };
  }, [handleKeyDown, enabled]);

  return shortcuts;
}

/**
 * Helper function to announce actions to screen readers
 * Reuses announcement element to avoid DOM pollution
 */
function announceToScreenReader(
  message: string,
  announcementRef: React.MutableRefObject<HTMLDivElement | null>
) {
  // Create or reuse announcement element
  if (!announcementRef.current) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    document.body.appendChild(announcement);
    announcementRef.current = announcement;
  }

  // Update message
  announcementRef.current.textContent = message;

  // Clear message after announcement
  setTimeout(() => {
    if (announcementRef.current) {
      announcementRef.current.textContent = '';
    }
  }, 1000);
}

/**
 * Common keyboard shortcuts for OCR app
 * Usage: const shortcuts = getCommonShortcuts({ onCopy, onDownload, ... })
 */
export function getCommonShortcuts(handlers: {
  onCopy?: () => void;
  onDownload?: () => void;
  onViewHistory?: () => void;
  onExtract?: () => void;
  onClear?: () => void;
}): ShortcutConfig[] {
  return [
    {
      key: 'c',
      action: handlers.onCopy || (() => {}),
      description: 'Copy text to clipboard',
      disabled: !handlers.onCopy,
    },
    {
      key: 'd',
      action: handlers.onDownload || (() => {}),
      description: 'Download text as file',
      disabled: !handlers.onDownload,
    },
    {
      key: 'h',
      action: handlers.onViewHistory || (() => {}),
      description: 'View history',
      disabled: !handlers.onViewHistory,
    },
    {
      key: 'e',
      action: handlers.onExtract || (() => {}),
      description: 'Extract text from image',
      disabled: !handlers.onExtract,
    },
    {
      key: 'v',
      action: handlers.onViewHistory || (() => {}),
      description: 'View results',
      disabled: !handlers.onViewHistory,
    },
    {
      key: 'Escape',
      action: handlers.onClear || (() => {}),
      description: 'Clear current result',
      disabled: !handlers.onClear,
    },
  ];
}
