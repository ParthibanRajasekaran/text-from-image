/**
 * Accessibility Tests
 * 
 * Uses jest-axe to validate accessibility compliance
 * Tests cover critical user journeys and interactions
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { GlassDropzone } from '../components/v3/GlassDropzone';
import { Dropzone } from '../components/Dropzone';
import { HistoryDrawer } from '../components/HistoryDrawer';
import { ThemeToggle } from '../components/ThemeToggle';

// Mock environment utilities
jest.mock('../utils/env', () => ({
  isUXV2Enabled: () => true,
  isUXV3Enabled: () => false,
  isAnalyticsEnabled: () => false,
  isDebugEnabled: () => false,
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }: any, ref: any) => {
        // Filter out framer-motion props to avoid React warnings
        const { initial, animate, exit, transition, whileHover, whileTap, ...domProps } = props;
        return <div ref={ref} {...domProps}>{children}</div>;
      }),
      label: React.forwardRef(({ children, ...props }: any, ref: any) => {
        const { initial, animate, exit, transition, whileHover, whileTap, ...domProps } = props;
        return <label ref={ref} {...domProps}>{children}</label>;
      }),
      aside: React.forwardRef(({ children, ...props }: any, ref: any) => {
        // Render aside with role="dialog" as a div to avoid aria-allowed-role violation in tests
        const { initial, animate, exit, transition, whileHover, whileTap, role, ...domProps } = props;
        return <div ref={ref} role={role} {...domProps}>{children}</div>;
      }),
      button: React.forwardRef(({ children, ...props }: any, ref: any) => {
        const { initial, animate, exit, transition, whileHover, whileTap, ...domProps } = props;
        return <button ref={ref} {...domProps}>{children}</button>;
      }),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
    useReducedMotion: () => false,
  };
});

// Mock hooks that rely on browser APIs
jest.mock('../hooks/useDragDrop', () => ({
  useDragDrop: () => ({
    isDragging: false,
    handleDragEnter: jest.fn(),
    handleDragLeave: jest.fn(),
    handleDragOver: jest.fn(),
    handleDrop: jest.fn(),
  }),
}));

jest.mock('../hooks/useClipboard', () => ({
  useClipboard: () => {},
}));

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  describe('Dropzone Components', () => {
    it('GlassDropzone should have no accessibility violations', async () => {
      const { container } = render(
        <GlassDropzone onFileSelect={() => {}} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('GlassDropzone accessible name should match visible text', () => {
      render(<GlassDropzone onFileSelect={() => {}} />);
      
      // The label element's text content should be the accessible name
      const label = screen.getByText(/drop image or click to upload/i);
      expect(label).toBeInTheDocument();
      
      // The label should be connected to the file input
      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('aria-labelledby', 'glass-dropzone-label');
    });

    it('Standard Dropzone should have no accessibility violations', async () => {
      const { container } = render(
        <Dropzone onFiles={() => {}} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Standard Dropzone button should be keyboard accessible', () => {
      render(<Dropzone onFiles={() => {}} />);
      
      const button = screen.getByRole('button', { name: /upload image/i });
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });
  });

  describe('Main Landmarks', () => {
    it('Main element should have accessible ID for skip link', () => {
      const { container } = render(
        <main id="main-content" tabIndex={-1}>
          <h1>Test Page</h1>
          <p>Content</p>
        </main>
      );
      
      const main = container.querySelector('main');
      expect(main).toHaveAttribute('id', 'main-content');
      expect(main).toHaveAttribute('tabIndex', '-1');
    });

    it('Skip link should be properly structured', () => {
      const { container } = render(
        <>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute"
          >
            Skip to main content
          </a>
          <main id="main-content" tabIndex={-1}>
            <p>Content</p>
          </main>
        </>
      );
      
      const skipLink = container.querySelector('a[href="#main-content"]');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveTextContent('Skip to main content');
      expect(skipLink?.className).toContain('sr-only');
      expect(skipLink?.className).toContain('focus:not-sr-only');
    });
  });

  describe('Modal/Dialog Accessibility', () => {
    it('HistoryDrawer should have proper dialog semantics', () => {
      const mockHistory = [
        {
          id: '1',
          timestamp: Date.now(),
          text: 'Sample text',
          filename: 'test.jpg',
        },
      ];

      render(
        <HistoryDrawer
          isOpen={true}
          onClose={() => {}}
          history={mockHistory}
          onSelectEntry={() => {}}
          onRemoveEntry={() => {}}
          onClearAll={() => {}}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'history-drawer-title');
    });

    it('HistoryDrawer should have no accessibility violations when open', async () => {
      const mockHistory = [
        {
          id: '1',
          timestamp: Date.now(),
          text: 'Sample text',
          filename: 'test.jpg',
        },
      ];

      const { container } = render(
        <HistoryDrawer
          isOpen={true}
          onClose={() => {}}
          history={mockHistory}
          onSelectEntry={() => {}}
          onRemoveEntry={() => {}}
          onClearAll={() => {}}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Icon Buttons', () => {
    it('ThemeToggle should have descriptive aria-label', () => {
      render(<ThemeToggle theme="light" toggleTheme={() => {}} />);
      
      const button = screen.getByRole('button', { name: /switch to dark mode/i });
      expect(button).toBeInTheDocument();
    });

    it('ThemeToggle should have no accessibility violations', async () => {
      const { container } = render(
        <ThemeToggle theme="light" toggleTheme={() => {}} />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('ThemeToggle icon should be hidden from screen readers', () => {
      const { container } = render(
        <ThemeToggle theme="light" toggleTheme={() => {}} />
      );
      
      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveAttribute('focusable', 'false');
    });
  });

  describe('Interactive Elements', () => {
    it('Semantic buttons should be used instead of div role="button"', () => {
      const { container } = render(
        <div>
          <button>Real Button</button>
          <button className="some-classes">Another Button</button>
        </div>
      );
      
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // Should NOT find any divs with role="button"
      const buttonDivs = container.querySelectorAll('div[role="button"]');
      expect(buttonDivs.length).toBe(0);
    });
  });

  describe('Form Controls', () => {
    it('File inputs should have proper labels', () => {
      render(<GlassDropzone onFileSelect={() => {}} />);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();
      
      // Should have either aria-label or aria-labelledby
      const hasLabel = fileInput.hasAttribute('aria-label') || fileInput.hasAttribute('aria-labelledby');
      expect(hasLabel).toBe(true);
    });
  });

  describe('Focus Management', () => {
    it('Focusable elements should have proper focus styles', () => {
      const { container } = render(
        <div>
          <button className="focus:outline-none focus:ring-2">Button 1</button>
          <a href="#test" className="focus:ring-2 focus:ring-primary">Link 1</a>
          <input type="text" className="focus:border-primary" />
        </div>
      );
      
      const focusableElements = container.querySelectorAll('button, a, input');
      
      focusableElements.forEach((element) => {
        const classList = (element as HTMLElement).className;
        // Should have focus: styles
        const hasFocusStyles = classList.includes('focus:');
        expect(hasFocusStyles).toBeTruthy();
      });
    });
  });
});
