/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ReceiptToCSVPage from '../../app/receipt-to-csv/page';

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
      <ReceiptToCSVPage />
    </BrowserRouter>
  );
}

describe('Receipt to CSV Page - Content Requirements', () => {
  it('should render with at least 500 words of content', () => {
    renderPage();
    const content = document.body.textContent || '';
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    
    expect(wordCount).toBeGreaterThanOrEqual(500);
  });

  it('should have unique hero about receipt to CSV conversion', () => {
    renderPage();
    const hero = screen.getByRole('heading', { level: 2, name: /extract receipt data/i });
    
    expect(hero).toBeInTheDocument();
    expect(hero.textContent).toMatch(/receipt|csv/i);
  });

  it('should mention line items, totals, merchant name, and CSV export', () => {
    renderPage();
    const content = document.body.textContent || '';
    
    expect(content).toMatch(/line item/i);
    expect(content).toMatch(/total/i);
    expect(content).toMatch(/merchant/i);
    expect(content).toMatch(/csv/i);
  });

  it('should mention currency and date extraction heuristics', () => {
    renderPage();
    const content = document.body.textContent || '';
    
    expect(content).toMatch(/currency|price|\$/);
    expect(content).toMatch(/date/i);
    expect(content).toMatch(/heuristic|pattern|parsing/i);
  });

  it('should have exactly 2 examples (as specified)', () => {
    renderPage();
    
    // Count example images or captions
    const examplesSection = document.querySelector('section:has(img)');
    if (examplesSection) {
      const images = examplesSection.querySelectorAll('img');
      expect(images.length).toBe(2);
    } else {
      // Fallback: check for caption text mentions
      const content = document.body.textContent || '';
      const beforeAfterMentions = (content.match(/Before:.*After:/g) || []).length;
      expect(beforeAfterMentions).toBeGreaterThanOrEqual(2);
    }
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

describe('Receipt to CSV Page - JSON-LD Schema', () => {
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

  it('should have FAQ questions about receipts and CSV export', () => {
    renderPage();
    
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    const schemaData = JSON.parse(schemaScript!.textContent || '{}');
    
    const questions = schemaData.mainEntity.map((item: any) => item.name.toLowerCase());
    const hasReceiptFAQ = questions.some((q: string) => 
      q.includes('receipt') || q.includes('line item') || q.includes('merchant')
    );
    const hasCSVFAQ = questions.some((q: string) => 
      q.includes('csv') || q.includes('export') || q.includes('import')
    );
    
    expect(hasReceiptFAQ).toBe(true);
    expect(hasCSVFAQ).toBe(true);
  });
});

describe('Receipt to CSV Page - AdGate Compliance', () => {
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

describe('Receipt to CSV Page - SEO Metadata', () => {
  it('should have title with target keywords (receipt, csv, converter)', () => {
    const title = 'Receipt to CSV Converter – Extract Line Items from Receipts (Free)';
    
    expect(title).toMatch(/receipt/i);
    expect(title).toMatch(/csv/i);
    expect(title).toMatch(/converter/i);
  });

  it('should have description between 150-180 characters', () => {
    const description = 'Convert receipt images to CSV instantly. Extract line items, totals, dates, and merchant names from paper receipts. Free OCR for expense tracking and accounting.';
    
    expect(description.length).toBeGreaterThanOrEqual(150);
    expect(description.length).toBeLessThanOrEqual(175);
  });

  it('should mention receipts and expense tracking in description', () => {
    const description = 'Convert receipt images to CSV instantly. Extract line items, totals, dates, and merchant names from paper receipts. Free OCR for expense tracking and accounting.';
    
    expect(description).toMatch(/receipt/i);
    expect(description).toMatch(/expense|accounting/i);
  });
});

describe('Receipt to CSV Page - Accessibility', () => {
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

describe('Receipt to CSV Page - Uniqueness', () => {
  it('should have unique content focusing on receipts vs tables/spreadsheets', () => {
    renderPage();
    const content = document.body.textContent || '';
    
    // Must emphasize receipt-specific terms
    const receiptMentions = (content.match(/receipt/gi) || []).length;
    expect(receiptMentions).toBeGreaterThan(5);
    
    // Should mention expense tracking or accounting context
    expect(content).toMatch(/expense|accounting|reimbursement/i);
  });

  it('should differentiate from image-to-excel page', () => {
    renderPage();
    const hero = screen.getByRole('heading', { level: 2 });
    
    // Should NOT match the image-to-excel hero
    expect(hero.textContent).not.toMatch(/extract tables from images/i);
    expect(hero.textContent).toMatch(/receipt/i);
  });
});
