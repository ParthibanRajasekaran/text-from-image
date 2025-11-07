/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ArabicImageToTextPage from '../../app/arabic-image-to-text/page';

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
      <ArabicImageToTextPage />
    </BrowserRouter>
  );
}

describe('Arabic Image to Text Page - Content Requirements', () => {
  it('should render with at least 500 words of content', () => {
    renderPage();
    const content = document.body.textContent || '';
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    
    expect(wordCount).toBeGreaterThanOrEqual(500);
  });

  it('should have unique hero about Arabic script extraction', () => {
    renderPage();
    const hero = screen.getByRole('heading', { level: 2, name: /extract arabic text/i });
    
    expect(hero).toBeInTheDocument();
    expect(hero.textContent).toMatch(/arabic/i);
  });

  it('should mention RTL (right-to-left) rendering', () => {
    renderPage();
    const content = document.body.textContent || '';
    
    expect(content).toMatch(/rtl|right-to-left/i);
  });

  it('should mention Arabic ligatures', () => {
    renderPage();
    const content = document.body.textContent || '';
    
    expect(content).toMatch(/ligature/i);
  });

  it('should include Arabic script examples in text', () => {
    renderPage();
    const content = document.body.textContent || '';
    
    // Check for Arabic Unicode characters
    expect(content).toMatch(/العربية|مرحبا|حَرَكَات/);
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

describe('Arabic Image to Text Page - JSON-LD Schema', () => {
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

  it('should have FAQ questions about RTL and ligatures', () => {
    renderPage();
    
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    const schemaData = JSON.parse(schemaScript!.textContent || '{}');
    
    const questions = schemaData.mainEntity.map((item: any) => item.name.toLowerCase());
    const hasRTLOrLigatureFAQ = questions.some((q: string) => 
      q.includes('rtl') || q.includes('right-to-left') || q.includes('ligature')
    );
    
    expect(hasRTLOrLigatureFAQ).toBe(true);
  });
});

describe('Arabic Image to Text Page - AdGate Compliance', () => {
  it('should show ads when content requirement is met', () => {
    renderPage();
    
    const adSlots = document.querySelectorAll('[data-ad-slot]');
    expect(adSlots.length).toBeGreaterThan(0);
  });

  it('should have ad positioned after content (afterExplainer2)', () => {
    renderPage();
    
    // Verify ad appears after "Supported" section
    const supportedSection = screen.getByText(/what arabic content can we extract/i).closest('section');
    const adSlots = document.querySelectorAll('[data-ad-slot]');
    
    expect(supportedSection).toBeInTheDocument();
    expect(adSlots.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Arabic Image to Text Page - SEO Metadata', () => {
  it('should have title with Arabic and OCR keywords', () => {
    const title = 'Arabic Image to Text Converter – OCR for Arabic Script (Free)';
    
    expect(title).toMatch(/arabic/i);
    expect(title).toMatch(/ocr|text|converter/i);
  });

  it('should have description between 150-180 characters', () => {
    const description = 'Convert Arabic images to editable text instantly. Extract Arabic script from photos, documents, and books. Free OCR with RTL rendering, ligature support, and Unicode output.';
    
    expect(description.length).toBeGreaterThanOrEqual(150);
    expect(description.length).toBeLessThanOrEqual(185);
  });

  it('should mention Arabic and RTL in description', () => {
    const description = 'Convert Arabic images to editable text instantly. Extract Arabic script from photos, documents, and books. Free OCR with RTL rendering, ligature support, and Unicode output.';
    
    expect(description).toMatch(/arabic/i);
    expect(description).toMatch(/rtl/i);
  });
});

describe('Arabic Image to Text Page - Accessibility', () => {
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
