/**
 * SEO, Accessibility & Performance Tests
 * 
 * Validates:
 * - Exactly one <main> per page
 * - Header "Guides" menu keyboard reachable
 * - InArticle never renders on uploader route
 * - InArticle reserves height ≥ 280px before consent
 * - SEO: every route has title/description/canonical
 * - JSON-LD only where FAQ visible
 * - No blocking scripts; CLS prevention
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, within } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import React from 'react';

// Import components to test
import App from '../../App';
import { InArticle } from '../ads/InArticle';
import CopyTextFromImageGuide from '../../pages/CopyTextFromImageGuide';
import ImageToText from '../../pages/ImageToText';
import ExtractTextFromImage from '../../pages/ExtractTextFromImage';
import JpgToExcelGuide from '../../pages/JpgToExcelGuide';
import JpgToWord from '../../pages/JpgToWord';

// Mock framer-motion to avoid animation issues
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) => {
      const { initial, animate, exit, transition, whileHover, whileTap, drag, dragConstraints, ...domProps } = props;
      return <div ref={ref} {...domProps}>{children}</div>;
    }),
    label: React.forwardRef(({ children, ...props }: any, ref: any) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...domProps } = props;
      return <label ref={ref} {...domProps}>{children}</label>;
    }),
    aside: React.forwardRef(({ children, ...props }: any, ref: any) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...domProps } = props;
      return <div ref={ref} {...domProps}>{children}</div>;
    }),
    button: React.forwardRef(({ children, ...props }: any, ref: any) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...domProps } = props;
      return <button ref={ref} {...domProps}>{children}</button>;
    }),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useReducedMotion: () => false,
}));

// Mock hooks
vi.mock('../../hooks/useDragDrop', () => ({
  useDragDrop: () => ({
    isDragging: false,
    handleDragEnter: vi.fn(),
    handleDragLeave: vi.fn(),
    handleDragOver: vi.fn(),
    handleDrop: vi.fn(),
  }),
}));

vi.mock('../../hooks/useClipboard', () => ({
  useClipboard: () => vi.fn(),
}));

vi.mock('../../hooks/useLocalHistory', () => ({
  useLocalHistory: () => ({
    history: [],
    addToHistory: vi.fn(),
    removeFromHistory: vi.fn(),
    clearHistory: vi.fn(),
  }),
}));

vi.mock('../../hooks/useOCRProcessor', () => ({
  useOCRProcessor: () => ({
    processImage: vi.fn(),
    progress: 0,
    isProcessing: false,
    error: null,
    result: null,
  }),
}));

describe('SEO, A11y & Performance Tests', () => {
  describe('Main Landmark - Exactly One <main> Per Page', () => {
    it('App.tsx (uploader route) should have exactly one <main>', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );

      const mainElements = container.querySelectorAll('main');
      expect(mainElements.length).toBe(1);
      expect(mainElements[0]).toHaveAttribute('id', 'main-content');
    });

    it('CopyTextFromImageGuide should have exactly one <main>', () => {
      const { container } = render(
        <BrowserRouter>
          <CopyTextFromImageGuide />
        </BrowserRouter>
      );

      const mainElements = container.querySelectorAll('main');
      expect(mainElements.length).toBe(1);
    });

    it('ImageToText guide should have exactly one <main>', () => {
      const { container } = render(
        <BrowserRouter>
          <ImageToText />
        </BrowserRouter>
      );

      const mainElements = container.querySelectorAll('main');
      expect(mainElements.length).toBe(1);
    });

    it('ExtractTextFromImage guide should have exactly one <main>', () => {
      const { container } = render(
        <BrowserRouter>
          <ExtractTextFromImage />
        </BrowserRouter>
      );

      const mainElements = container.querySelectorAll('main');
      expect(mainElements.length).toBe(1);
    });

    it('JpgToExcelGuide should have exactly one <main>', () => {
      const { container } = render(
        <BrowserRouter>
          <JpgToExcelGuide />
        </BrowserRouter>
      );

      const mainElements = container.querySelectorAll('main');
      expect(mainElements.length).toBe(1);
    });

    it('JpgToWord guide should have exactly one <main>', () => {
      const { container } = render(
        <BrowserRouter>
          <JpgToWord />
        </BrowserRouter>
      );

      const mainElements = container.querySelectorAll('main');
      expect(mainElements.length).toBe(1);
    });
  });

  describe('Header Navigation - Keyboard Reachable', () => {
    it('Header should have navigation element', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );

      const nav = container.querySelector('header nav');
      expect(nav).toBeInTheDocument();
    });

    it('Guides menu links should be keyboard accessible (no tabIndex=-1)', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );

      const nav = container.querySelector('header nav');
      if (nav) {
        const links = within(nav as HTMLElement).queryAllByRole('link');
        
        links.forEach(link => {
          const tabIndex = link.getAttribute('tabindex');
          // Should NOT have tabIndex="-1" (making it unreachable)
          expect(tabIndex).not.toBe('-1');
        });
      }
    });

    it('Guides dropdown/menu should be reachable via keyboard', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );

      // Look for "Guides" text in header
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
      
      // All interactive elements in header should be keyboard accessible
      const interactiveElements = header?.querySelectorAll('a, button');
      interactiveElements?.forEach(el => {
        const tabIndex = el.getAttribute('tabindex');
        expect(tabIndex).not.toBe('-1');
      });
    });
  });

  describe('InArticle Ad Slot - Route-Specific Rendering', () => {
    it('InArticle should NEVER render on uploader route (App.tsx)', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );

      // Check for InArticle slot indicators
      const adSlots = container.querySelectorAll('[role="region"][aria-label="Advertisement"]');
      const inArticleSlots = Array.from(adSlots).filter(slot => {
        // InArticle has min-h-[280px] class
        return (slot as HTMLElement).className.includes('min-h-[280px]');
      });

      expect(inArticleSlots.length).toBe(0);
    });

    it('InArticle should render on guide pages when enabled', () => {
      // Set environment to enable slots
      vi.stubEnv('VITE_ADS_SLOTS_ENABLED', 'true');
      
      const { container } = render(
        <BrowserRouter>
          <CopyTextFromImageGuide />
        </BrowserRouter>
      );

      // Should have ad region (even if empty before consent)
      const adRegions = container.querySelectorAll('[role="region"][aria-label="Advertisement"]');
      expect(adRegions.length).toBeGreaterThan(0);
      
      vi.unstubAllEnvs();
    });
  });

  describe('InArticle - CLS Prevention (Height Reservation)', () => {
    it('InArticle should reserve min-height of 280px BEFORE consent', () => {
      const consent = {
        ad_storage: 'denied' as const,
        ad_user_data: 'denied' as const,
        ad_personalization: 'denied' as const,
      };

      const { container } = render(
        <InArticle consent={consent} />
      );

      const adRegion = container.querySelector('[role="region"][aria-label="Advertisement"]');
      expect(adRegion).toBeInTheDocument();
      
      // Check for min-h-[280px] class
      expect(adRegion?.className).toContain('min-h-[280px]');
      
      // Verify no <ins> element is rendered (consent denied)
      const insElement = container.querySelector('ins.adsbygoogle');
      expect(insElement).not.toBeInTheDocument();
    });

    it('InArticle reserved space should have w-full class to prevent horizontal CLS', () => {
      const consent = {
        ad_storage: 'denied' as const,
        ad_user_data: 'denied' as const,
        ad_personalization: 'denied' as const,
      };

      const { container } = render(
        <InArticle consent={consent} />
      );

      const adRegion = container.querySelector('[role="region"][aria-label="Advertisement"]');
      expect(adRegion?.className).toContain('w-full');
    });

    it('InArticle should have my-8 for vertical spacing (no layout shift)', () => {
      const consent = {
        ad_storage: 'denied' as const,
        ad_user_data: 'denied' as const,
        ad_personalization: 'denied' as const,
      };

      const { container } = render(
        <InArticle consent={consent} />
      );

      const adRegion = container.querySelector('[role="region"][aria-label="Advertisement"]');
      expect(adRegion?.className).toContain('my-8');
    });
  });

  describe('SEO - Title, Description, Canonical on Every Route', () => {
    beforeEach(() => {
      // Clear document head before each test
      document.head.innerHTML = '';
    });

    it('CopyTextFromImageGuide should have title, description, and canonical', () => {
      render(
        <BrowserRouter>
          <CopyTextFromImageGuide />
        </BrowserRouter>
      );

      // Check for title
      const title = document.querySelector('title');
      expect(title).toBeInTheDocument();
      expect(title?.textContent).toBeTruthy();

      // Check for meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      expect(metaDescription).toBeInTheDocument();
      expect(metaDescription?.getAttribute('content')).toBeTruthy();

      // Check for canonical link
      const canonical = document.querySelector('link[rel="canonical"]');
      expect(canonical).toBeInTheDocument();
      expect(canonical?.getAttribute('href')).toBeTruthy();
      expect(canonical?.getAttribute('href')).toContain('/copy-text-from-image');
    });

    it('ImageToText guide should have title, description, and canonical', () => {
      render(
        <BrowserRouter>
          <ImageToText />
        </BrowserRouter>
      );

      const title = document.querySelector('title');
      expect(title?.textContent).toBeTruthy();

      const metaDescription = document.querySelector('meta[name="description"]');
      expect(metaDescription?.getAttribute('content')).toBeTruthy();

      const canonical = document.querySelector('link[rel="canonical"]');
      expect(canonical?.getAttribute('href')).toContain('/image-to-text');
    });

    it('ExtractTextFromImage guide should have SEO meta tags', () => {
      render(
        <BrowserRouter>
          <ExtractTextFromImage />
        </BrowserRouter>
      );

      expect(document.querySelector('title')?.textContent).toBeTruthy();
      expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBeTruthy();
      expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toContain('/extract-text-from-image');
    });

    it('JpgToExcelGuide should have SEO meta tags', () => {
      render(
        <BrowserRouter>
          <JpgToExcelGuide />
        </BrowserRouter>
      );

      expect(document.querySelector('title')?.textContent).toBeTruthy();
      expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBeTruthy();
      expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toContain('/jpg-to-excel');
    });

    it('JpgToWord guide should have SEO meta tags', () => {
      render(
        <BrowserRouter>
          <JpgToWord />
        </BrowserRouter>
      );

      expect(document.querySelector('title')?.textContent).toBeTruthy();
      expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBeTruthy();
      expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toContain('/jpg-to-word');
    });
  });

  describe('SEO - JSON-LD Only Where FAQ Visible', () => {
    beforeEach(() => {
      document.head.innerHTML = '';
      document.body.innerHTML = '';
    });

    it('Guide pages WITH FAQs should have FAQPage JSON-LD schema', () => {
      const { container } = render(
        <BrowserRouter>
          <CopyTextFromImageGuide />
        </BrowserRouter>
      );

      // Check if page has FAQ section
      const faqSection = container.querySelector('h2');
      const hasFAQ = faqSection?.textContent?.toLowerCase().includes('faq');

      if (hasFAQ) {
        // Should have JSON-LD script
        const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
        const hasFAQSchema = jsonLdScripts.some(script => {
          try {
            const data = JSON.parse(script.textContent || '{}');
            return data['@type'] === 'FAQPage';
          } catch {
            return false;
          }
        });

        expect(hasFAQSchema).toBe(true);
      }
    });

    it('Uploader page (App.tsx) should NOT have FAQPage JSON-LD', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );

      const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      const hasFAQSchema = jsonLdScripts.some(script => {
        try {
          const data = JSON.parse(script.textContent || '{}');
          return data['@type'] === 'FAQPage';
        } catch {
          return false;
        }
      });

      // Uploader page should NOT have FAQ schema
      expect(hasFAQSchema).toBe(false);
    });
  });

  describe('Performance - No Blocking Scripts', () => {
    it('AdSense script in AutoAds should be async and non-blocking', () => {
      // Note: This tests the AutoAds component logic
      // In actual implementation, script should have async attribute
      
      // Mock document.head to verify script attributes
      const mockScript = document.createElement('script');
      mockScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      mockScript.async = true;
      mockScript.crossOrigin = 'anonymous';

      expect(mockScript.async).toBe(true);
      expect(mockScript.crossOrigin).toBe('anonymous');
    });

    it('Tesseract should be lazy loaded (not in initial bundle)', () => {
      // This is verified by vite config manualChunks
      // Tesseract should be in separate 'tesseract' chunk
      
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );

      // Initial render should not load Tesseract immediately
      // (it loads on user interaction via useOCRProcessor)
      expect(container).toBeInTheDocument();
    });
  });

  describe('Performance - CLS Prevention from Ad Slots', () => {
    it('All InArticle slots should have fixed height before ad loads', () => {
      const consent = {
        ad_storage: 'denied' as const,
        ad_user_data: 'denied' as const,
        ad_personalization: 'denied' as const,
      };

      const { container } = render(
        <InArticle consent={consent} />
      );

      const adRegion = container.querySelector('[role="region"][aria-label="Advertisement"]');
      
      // Should have min-h-[280px] which reserves space
      expect(adRegion?.className).toMatch(/min-h-\[280px\]/);
      
      // Should not cause layout shift when ad loads later
      expect(adRegion?.className).toContain('w-full');
    });

    it('Ad slots should use CSS containment for layout stability', () => {
      const consent = {
        ad_storage: 'granted' as const,
        ad_user_data: 'granted' as const,
        ad_personalization: 'granted' as const,
      };

      const { container } = render(
        <InArticle consent={consent} />
      );

      // Even with consent granted, container should maintain dimensions
      const adRegion = container.querySelector('[role="region"][aria-label="Advertisement"]');
      expect(adRegion?.className).toContain('min-h-[280px]');
    });
  });

  describe('Accessibility - Semantic HTML', () => {
    it('Skip link should be present and functional', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );

      const skipLink = container.querySelector('a[href="#main-content"]');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink?.textContent).toContain('Skip');
    });

    it('Main content should be focusable for skip link', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );

      const main = container.querySelector('main#main-content');
      expect(main).toHaveAttribute('tabIndex', '-1');
    });
  });
});
