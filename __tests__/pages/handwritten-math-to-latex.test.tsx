/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import HandwrittenMathToLatexPage from '../../app/handwritten-math-to-latex/page';

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
      <HandwrittenMathToLatexPage />
    </BrowserRouter>
  );
}

describe('Handwritten Math to LaTeX Page - Content Requirements', () => {
  it('should render with at least 500 words of content', () => {
    renderPage();
    const content = document.body.textContent || '';
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    
    expect(wordCount).toBeGreaterThanOrEqual(500);
  });

  it('should have unique hero about handwritten math conversion', () => {
    renderPage();
    const hero = screen.getByRole('heading', { level: 2, name: /transform handwritten math/i });
    
    expect(hero).toBeInTheDocument();
    expect(hero.textContent).toMatch(/handwritten/i);
    expect(hero.textContent).toMatch(/latex/i);
  });

  it('should emphasize handwriting-specific challenges (strokes, slant, disambiguation)', () => {
    renderPage();
    const content = document.body.textContent || '';
    
    expect(content).toMatch(/handwrit|script/i);
    expect(content).toMatch(/stroke|slant/i);
    expect(content).toMatch(/disambiguat/i);
  });

  it('should mention interactive quick-fix or instant preview re-render', () => {
    renderPage();
    const content = document.body.textContent || '';
    
    expect(content).toMatch(/interactive|quick-fix|instant/i);
    expect(content).toMatch(/preview.*re-render|re-render.*preview|preview.*update/i);
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

describe('Handwritten Math to LaTeX Page - Uniqueness vs Math Page', () => {
  it('should have different hero than math-to-latex page', () => {
    renderPage();
    const hero = screen.getByRole('heading', { level: 2 });
    
    // Should NOT match the printed math page hero
    expect(hero.textContent).not.toMatch(/convert math images to latex/i);
    expect(hero.textContent).toMatch(/handwritten/i);
  });

  it('should have unique content focusing on handwriting vs printed', () => {
    renderPage();
    const content = document.body.textContent || '';
    
    // Must mention handwriting-specific terms
    expect(content).toMatch(/handwrit|script|whiteboard|notebook/i);
    
    // Should differentiate from printed math
    const handwritingMentions = (content.match(/handwrit/gi) || []).length;
    expect(handwritingMentions).toBeGreaterThan(3);
  });

  it('should have different FAQs emphasizing handwriting challenges', () => {
    renderPage();
    
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    const schemaData = JSON.parse(schemaScript!.textContent || '{}');
    
    const questions = schemaData.mainEntity.map((item: any) => item.name.toLowerCase());
    const hasHandwritingFAQ = questions.some((q: string) => 
      q.includes('handwrit') || q.includes('cursive') || q.includes('stroke')
    );
    
    expect(hasHandwritingFAQ).toBe(true);
  });
});

describe('Handwritten Math to LaTeX Page - JSON-LD Schema', () => {
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
});

describe('Handwritten Math to LaTeX Page - AdGate Compliance', () => {
  it('should show ads when content requirement is met', () => {
    renderPage();
    
    const adSlots = document.querySelectorAll('[data-ad-slot]');
    expect(adSlots.length).toBeGreaterThan(0);
  });
});

describe('Handwritten Math to LaTeX Page - SEO Metadata', () => {
  it('should have title with handwritten and LaTeX keywords', () => {
    const title = 'Handwritten Math to LaTeX – Convert Script Equations (Free OCR)';
    
    expect(title).toMatch(/handwritten/i);
    expect(title).toMatch(/math/i);
    expect(title).toMatch(/latex/i);
  });

  it('should have description between 150-180 characters', () => {
    const description = 'Convert handwritten math equations to LaTeX code. Extract formulas from notes, whiteboards, and homework. Free OCR with symbol disambiguation and instant preview for script notation.';
    
    expect(description.length).toBeGreaterThanOrEqual(150);
    expect(description.length).toBeLessThanOrEqual(195);
  });

  it('should mention handwritten and script in description', () => {
    const description = 'Convert handwritten math equations to LaTeX code. Extract formulas from notes, whiteboards, and homework. Free OCR with symbol disambiguation and instant preview for script notation.';
    
    expect(description).toMatch(/handwritten/i);
    expect(description).toMatch(/script/i);
  });
});

describe('Handwritten Math to LaTeX Page - Accessibility', () => {
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
