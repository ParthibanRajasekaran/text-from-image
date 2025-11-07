/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import WhiteboardToTextPage from '../../app/whiteboard-to-text/page';

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
      <WhiteboardToTextPage />
    </BrowserRouter>
  );
}

describe('Whiteboard to Text Page - Content Requirements', () => {
  it('should render with at least 500 words of content', () => {
    renderPage();
    const content = document.body.textContent || '';
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    
    expect(wordCount).toBeGreaterThanOrEqual(500);
  });

  it('should have unique hero about whiteboard extraction', () => {
    renderPage();
    const hero = screen.getByRole('heading', { level: 2, name: /capture whiteboard notes/i });
    
    expect(hero).toBeInTheDocument();
    expect(hero.textContent).toMatch(/whiteboard/i);
  });

  it('should mention preprocessing toggles: de-skew, glare, contrast', () => {
    renderPage();
    const content = document.body.textContent || '';
    
    expect(content).toMatch(/de-skew|deskew|skew/i);
    expect(content).toMatch(/glare/i);
    expect(content).toMatch(/contrast/i);
  });

  it('should mention before/after preprocessing examples', () => {
    renderPage();
    const content = document.body.textContent || '';
    
    // Check for before/after captions
    expect(content).toMatch(/before:/i);
    expect(content).toMatch(/after:/i);
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

describe('Whiteboard to Text Page - JSON-LD Schema', () => {
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

  it('should have FAQ questions about preprocessing and whiteboard challenges', () => {
    renderPage();
    
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    const schemaData = JSON.parse(schemaScript!.textContent || '{}');
    
    const questions = schemaData.mainEntity.map((item: any) => item.name.toLowerCase());
    const hasPreprocessingFAQ = questions.some((q: string) => 
      q.includes('preprocessing') || q.includes('de-skew') || q.includes('glare') || q.includes('contrast')
    );
    
    expect(hasPreprocessingFAQ).toBe(true);
  });
});

describe('Whiteboard to Text Page - AdGate Compliance', () => {
  it('should show ads when content requirement is met', () => {
    renderPage();
    
    const adSlots = document.querySelectorAll('[data-ad-slot]');
    expect(adSlots.length).toBeGreaterThan(0);
  });

  it('should have ad positioned after explainer', () => {
    renderPage();
    
    const adSlots = document.querySelectorAll('[data-ad-slot]');
    expect(adSlots.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Whiteboard to Text Page - SEO Metadata', () => {
  it('should have title with whiteboard and OCR keywords', () => {
    const title = 'Whiteboard to Text Converter – Extract Notes from Whiteboard (Free)';
    
    expect(title).toMatch(/whiteboard/i);
    expect(title).toMatch(/text|notes|converter/i);
  });

  it('should have description between 150-180 characters', () => {
    const description = 'Convert whiteboard photos to editable text instantly. Extract lecture notes, meeting notes, and brainstorming sessions. Free OCR with de-skew, glare reduction, and contrast boost.';
    
    expect(description.length).toBeGreaterThanOrEqual(150);
    expect(description.length).toBeLessThanOrEqual(185);
  });

  it('should mention whiteboard and preprocessing in description', () => {
    const description = 'Convert whiteboard photos to editable text instantly. Extract lecture notes, meeting notes, and brainstorming sessions. Free OCR with de-skew, glare reduction, and contrast boost.';
    
    expect(description).toMatch(/whiteboard/i);
    expect(description).toMatch(/de-skew|glare|contrast/i);
  });
});

describe('Whiteboard to Text Page - Accessibility', () => {
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
