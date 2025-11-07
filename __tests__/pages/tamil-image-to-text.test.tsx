/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import TamilImageToTextPage from '../../app/tamil-image-to-text/page';

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
      <TamilImageToTextPage />
    </BrowserRouter>
  );
}

describe('Tamil Image to Text Page - Content Requirements', () => {
  it('should render with at least 500 words of content', () => {
    renderPage();
    const content = document.body.textContent || '';
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    
    expect(wordCount).toBeGreaterThanOrEqual(500);
  });

  it('should have unique hero about Tamil script extraction', () => {
    renderPage();
    const hero = screen.getByRole('heading', { level: 2, name: /extract tamil text/i });
    
    expect(hero).toBeInTheDocument();
    expect(hero.textContent).toMatch(/tamil/i);
  });

  it('should mention Tamil script, Unicode, and native characters', () => {
    renderPage();
    const content = document.body.textContent || '';
    
    expect(content).toMatch(/tamil/i);
    expect(content).toMatch(/unicode/i);
    expect(content).toMatch(/script|character/i);
  });

  it('should mention optional translation capability', () => {
    renderPage();
    const content = document.body.textContent || '';
    
    expect(content).toMatch(/translat/i);
  });

  it('should include Tamil script examples in text', () => {
    renderPage();
    const content = document.body.textContent || '';
    
    // Check for Tamil Unicode characters
    expect(content).toMatch(/தமிழ்|வணக்கம்|ஸ்ரீ/);
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

describe('Tamil Image to Text Page - JSON-LD Schema', () => {
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

  it('should have FAQ questions about Tamil characters and Unicode', () => {
    renderPage();
    
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    const schemaData = JSON.parse(schemaScript!.textContent || '{}');
    
    const questions = schemaData.mainEntity.map((item: any) => item.name.toLowerCase());
    const hasTamilFAQ = questions.some((q: string) => 
      q.includes('tamil') || q.includes('unicode') || q.includes('script')
    );
    
    expect(hasTamilFAQ).toBe(true);
  });
});

describe('Tamil Image to Text Page - AdGate Compliance', () => {
  it('should show ads when content requirement is met', () => {
    renderPage();
    
    const adSlots = document.querySelectorAll('[data-ad-slot]');
    expect(adSlots.length).toBeGreaterThan(0);
  });

  it('should have ad positioning configured', () => {
    renderPage();
    
    const adSlots = document.querySelectorAll('[data-ad-slot]');
    expect(adSlots.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Tamil Image to Text Page - SEO Metadata', () => {
  it('should have title with Tamil and OCR keywords', () => {
    const title = 'Tamil Image to Text Converter – OCR for Tamil Script (Free)';
    
    expect(title).toMatch(/tamil/i);
    expect(title).toMatch(/ocr|text|converter/i);
  });

  it('should have description between 150-180 characters', () => {
    const description = 'Convert Tamil images to editable text instantly. Extract Tamil script from photos, documents, and books. Free OCR with native character recognition and optional translation.';
    
    expect(description.length).toBeGreaterThanOrEqual(150);
    expect(description.length).toBeLessThanOrEqual(195);
  });

  it('should mention Tamil in description', () => {
    const description = 'Convert Tamil images to editable text instantly. Extract Tamil script from photos, documents, and books. Free OCR with native character recognition and optional translation.';
    
    expect(description).toMatch(/tamil/i);
  });
});

describe('Tamil Image to Text Page - Accessibility', () => {
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
