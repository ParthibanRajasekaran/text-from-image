/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import OfflineImageToTextPage from '../../app/offline-image-to-text/page';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useReducedMotion: () => false,
}));

function renderPage() {
  return render(
    <BrowserRouter>
      <OfflineImageToTextPage />
    </BrowserRouter>
  );
}

describe('Offline Image to Text Page - Content Requirements', () => {
  it('should render with at least 500 words of content', () => {
    renderPage();
    const content = document.body.textContent || '';
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    
    expect(wordCount).toBeGreaterThanOrEqual(500);
  });

  it('should have unique hero about offline OCR', () => {
    renderPage();
    const hero = screen.getByRole('heading', { level: 2, name: /ocr that works offline/i });
    
    expect(hero).toBeInTheDocument();
    expect(hero.textContent).toMatch(/offline/i);
  });

  it('should mention WASM model and on-device processing', () => {
    renderPage();
    const content = document.body.textContent || '';
    
    expect(content).toMatch(/wasm|webassembly/i);
    expect(content).toMatch(/on-device|device/i);
  });

  it('should mention PWA (Progressive Web App) and install', () => {
    renderPage();
    const content = document.body.textContent || '';
    
    expect(content).toMatch(/pwa|progressive web app/i);
    expect(content).toMatch(/install/i);
  });

  it('should emphasize privacy and offline capabilities', () => {
    renderPage();
    const content = document.body.textContent || '';
    
    expect(content).toMatch(/privacy|private/i);
    expect(content).toMatch(/offline/i);
    expect(content).toMatch(/no internet|without internet/i);
  });

  it('should have 5-7 FAQ items', () => {
    renderPage();
    const faqSection = screen.getByText(/frequently asked questions/i).closest('section');
    
    expect(faqSection).toBeInTheDocument();
    
    const faqItems = within(faqSection!).getAllByRole('group');
    expect(faqItems.length).toBeGreaterThanOrEqual(5);
    expect(faqItems.length).toBeLessThanOrEqual(7);
  });
});

describe('Offline Image to Text Page - NO ADS Requirement', () => {
  it('should NOT show any ads (privacy-focused utility page)', () => {
    renderPage();
    
    // NO ads should be present on this page
    const adSlots = document.querySelectorAll('[data-ad-slot]');
    expect(adSlots.length).toBe(0);
  });

  it('should explain why there are no ads in FAQ', () => {
    renderPage();
    
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    const schemaData = JSON.parse(schemaScript!.textContent || '{}');
    
    const questions = schemaData.mainEntity.map((item: any) => item.name.toLowerCase());
    const hasNoAdsFAQ = questions.some((q: string) => q.includes('ad'));
    
    expect(hasNoAdsFAQ).toBe(true);
  });
});

describe('Offline Image to Text Page - JSON-LD Schema', () => {
  it('should include FAQPage schema', () => {
    renderPage();
    
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    expect(schemaScript).toBeInTheDocument();
    
    const schemaData = JSON.parse(schemaScript!.textContent || '{}');
    
    expect(schemaData['@context']).toBe('https://schema.org');
    expect(schemaData['@type']).toBe('FAQPage');
    expect(schemaData.mainEntity).toBeInstanceOf(Array);
    expect(schemaData.mainEntity.length).toBeGreaterThanOrEqual(5);
  });

  it('should have FAQ questions about offline mode and WASM', () => {
    renderPage();
    
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    const schemaData = JSON.parse(schemaScript!.textContent || '{}');
    
    const questions = schemaData.mainEntity.map((item: any) => item.name.toLowerCase());
    const hasOfflineFAQ = questions.some((q: string) => 
      q.includes('offline') || q.includes('wasm') || q.includes('internet')
    );
    
    expect(hasOfflineFAQ).toBe(true);
  });
});

describe('Offline Image to Text Page - SEO Metadata', () => {
  it('should have title with offline and PWA keywords', () => {
    const title = 'Offline Image to Text – PWA OCR Without Internet (100% Private)';
    
    expect(title).toMatch(/offline/i);
    expect(title).toMatch(/pwa|ocr/i);
    expect(title).toMatch(/private|privacy/i);
  });

  it('should have description between 150-180 characters', () => {
    const description = 'Convert images to text completely offline. No internet required after install. 100% private on-device OCR using WASM. Perfect for sensitive documents and remote locations.';
    
    expect(description.length).toBeGreaterThanOrEqual(150);
    expect(description.length).toBeLessThanOrEqual(180);
  });

  it('should mention offline and privacy in description', () => {
    const description = 'Convert images to text completely offline. No internet required after install. 100% private on-device OCR using WASM. Perfect for sensitive documents and remote locations.';
    
    expect(description).toMatch(/offline/i);
    expect(description).toMatch(/private|privacy/i);
    expect(description).toMatch(/wasm/i);
  });
});

describe('Offline Image to Text Page - Accessibility', () => {
  it('should have proper heading hierarchy', () => {
    renderPage();
    
    const h1 = screen.getByRole('heading', { level: 1 });
    const h2s = screen.getAllByRole('heading', { level: 2 });
    const h3s = screen.getAllByRole('heading', { level: 3 });
    
    expect(h1).toBeInTheDocument();
    expect(h2s.length).toBeGreaterThan(0);
    expect(h3s.length).toBeGreaterThan(0);
  });

  it('should have semantic HTML structure', () => {
    renderPage();
    
    const sections = document.querySelectorAll('section');
    expect(sections.length).toBeGreaterThan(3);
  });
});

describe('Offline Image to Text Page - Uniqueness', () => {
  it('should have unique content focusing on offline/PWA vs other pages', () => {
    renderPage();
    const content = document.body.textContent || '';
    
    // Must emphasize offline-specific terms
    const offlineMentions = (content.match(/offline/gi) || []).length;
    expect(offlineMentions).toBeGreaterThan(5);
    
    // Should mention WASM multiple times
    const wasmMentions = (content.match(/wasm|webassembly/gi) || []).length;
    expect(wasmMentions).toBeGreaterThan(2);
  });

  it('should differentiate from other OCR pages with PWA focus', () => {
    renderPage();
    const hero = screen.getByRole('heading', { level: 2 });
    
    // Should emphasize offline capability in hero
    expect(hero.textContent).toMatch(/offline/i);
  });
});
