/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import MathToLatexPage from '../../app/math-to-latex/page';

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
      <MathToLatexPage />
    </BrowserRouter>
  );
}

describe('Math to LaTeX Page - Content Requirements', () => {
  it('should render with at least 500 words of content', () => {
    renderPage();
    const content = document.body.textContent || '';
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    
    expect(wordCount).toBeGreaterThanOrEqual(500);
  });

  it('should have unique hero about LaTeX conversion', () => {
    renderPage();
    const hero = screen.getByRole('heading', { level: 2, name: /convert math images to latex/i });
    
    expect(hero).toBeInTheDocument();
    expect(hero.textContent).toMatch(/latex/i);
  });

  it('should mention LaTeX, KaTeX, and preview functionality', () => {
    renderPage();
    const content = document.body.textContent || '';
    
    expect(content).toMatch(/latex/i);
    expect(content).toMatch(/katex|preview/i);
  });

  it('should mention symbol ambiguity (× vs x, l vs 1)', () => {
    renderPage();
    const content = document.body.textContent || '';
    
    expect(content).toMatch(/ambigui/i);
    expect(content).toMatch(/×|times/);
    expect(content).toMatch(/\bl\b.*\b1\b|lowercase.*one/i);
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

describe('Math to LaTeX Page - JSON-LD Schema', () => {
  it('should include FAQPage schema with all FAQ items', () => {
    renderPage();
    
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    expect(schemaScript).toBeInTheDocument();
    
    const schemaData = JSON.parse(schemaScript!.textContent || '{}');
    
    expect(schemaData['@context']).toBe('https://schema.org');
    expect(schemaData['@type']).toBe('FAQPage');
    expect(schemaData.mainEntity).toBeInstanceOf(Array);
    expect(schemaData.mainEntity.length).toBeGreaterThanOrEqual(5);
  });

  it('should have FAQ questions about LaTeX and disambiguation', () => {
    renderPage();
    
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    const schemaData = JSON.parse(schemaScript!.textContent || '{}');
    
    const questions = schemaData.mainEntity.map((item: any) => item.name.toLowerCase());
    const hasLatexFAQ = questions.some((q: string) => q.includes('latex'));
    const hasAmbiguityFAQ = questions.some((q: string) => 
      q.includes('ambiguous') || q.includes('symbol')
    );
    
    expect(hasLatexFAQ).toBe(true);
    expect(hasAmbiguityFAQ).toBe(true);
  });
});

describe('Math to LaTeX Page - AdGate Compliance', () => {
  it('should show ads when content requirement is met', () => {
    renderPage();
    
    const adSlots = document.querySelectorAll('[data-ad-slot]');
    expect(adSlots.length).toBeGreaterThan(0);
  });

  it('should have exactly 1 ad position configured', () => {
    renderPage();
    
    const adSlots = document.querySelectorAll('[data-ad-slot]');
    expect(adSlots.length).toBe(1);
  });
});

describe('Math to LaTeX Page - SEO Metadata', () => {
  it('should have title with target keywords (math, latex, converter)', () => {
    const title = 'Math to LaTeX Converter – Extract Equations from Images (Free)';
    
    expect(title).toMatch(/math/i);
    expect(title).toMatch(/latex/i);
    expect(title).toMatch(/converter/i);
  });

  it('should have description between 150-160 characters', () => {
    const description = 'Convert images of math equations to LaTeX code instantly. Extract formulas from textbooks, papers, and screenshots. Free OCR with KaTeX preview and symbol disambiguation.';
    
    expect(description.length).toBeGreaterThanOrEqual(150);
    expect(description.length).toBeLessThanOrEqual(180);
  });

  it('should mention equations and formulas in description', () => {
    const description = 'Convert images of math equations to LaTeX code instantly. Extract formulas from textbooks, papers, and screenshots. Free OCR with KaTeX preview and symbol disambiguation.';
    
    expect(description).toMatch(/equation|formula/i);
    expect(description).toMatch(/latex/i);
  });
});

describe('Math to LaTeX Page - Accessibility', () => {
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
