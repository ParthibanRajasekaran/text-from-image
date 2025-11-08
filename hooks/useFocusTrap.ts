import { useEffect, useRef } from 'react';

/**
 * Focus trap hook for modals and dialogs
 * 
 * Traps keyboard focus within a container element, preventing users from
 * tabbing to elements outside the modal. Essential for accessibility.
 * 
 * Also sets the background as inert to prevent interaction.
 * 
 * @param isActive - Whether the focus trap is active
 * @param restoreFocusOnClean - Element to restore focus to on cleanup (optional)
 * @param inertSelector - CSS selector for element to mark as inert (default: '#app, #root, main')
 * 
 * @returns Ref to attach to the focus trap container
 * 
 * @example
 * const modalRef = useFocusTrap(isOpen);
 * return <dialog ref={modalRef} {...props} />
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  isActive: boolean,
  restoreFocusOnCleanup: boolean = true,
  inertSelector: string = 'main, #app, #root'
) {
  const containerRef = useRef<T>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    // Save the currently focused element to restore later
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Set background as inert (prevents interaction)
    const inertElements = document.querySelectorAll<HTMLElement>(inertSelector);
    inertElements.forEach((el) => {
      el.setAttribute('inert', '');
    });

    // Focus first focusable element in container
    const focusableElements = getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Handle Tab key to trap focus
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements(container);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: Move to last element if on first
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab: Move to first element if on last
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);

      // Remove inert from background
      inertElements.forEach((el) => {
        el.removeAttribute('inert');
      });

      // Restore focus to previous element
      if (restoreFocusOnCleanup && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive, inertSelector, restoreFocusOnCleanup]);

  return containerRef;
}

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => {
      // Exclude elements with display: none or visibility: hidden
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    }
  );
}
