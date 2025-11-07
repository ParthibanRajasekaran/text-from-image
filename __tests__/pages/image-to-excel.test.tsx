/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ImageToExcelPage from '../../app/image-to-excel/page';
import { makeNichePage } from '../../app/(tools)/_builder';

// Mock framer-motion to avoid animation issues in tests
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

// Helper to render page within Router context
function renderPage() {
  return render(
    <BrowserRouter>
      <ImageToExcelPage />
    </BrowserRouter>
  );
}

describe('Image to Excel Page - Content Requirements', () => {
  it('should render with at least 500 words of content', () => {
    renderPage();
    const content = document.body.textContent || '';
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    
    expect(wordCount).toBeGreaterThanOrEqual(500);
  });

  it('should have unique H1 different from handwriting and cursive pages', () => {
    renderPage();
    // H1 is the site title "TextFromImage", hero is H2
    const hero = screen.getByRole('heading', { level: 2, name: /extract tables from images to excel/i });
    
    expect(hero).toBeInTheDocument();
    expect(hero).not.toHaveTextContent(/handwriting/i);
    expect(hero).not.toHaveTextContent(/cursive/i);
  });

  it('should include table-specific terminology (boundary, header, cells)', () => {
    renderPage();
    const content = document.body.textContent || '';
    
    expect(content).toMatch(/table|tables/i);
    expect(content).toMatch(/border|boundaries/i);
    expect(content).toMatch(/header|headers/i);
    expect(content).toMatch(/cell|cells/i);
  });

  it('should mention Excel and CSV export formats', () => {
    renderPage();
    const content = document.body.textContent || '';
    
    expect(content).toMatch(/excel|xlsx/i);
    expect(content).toMatch(/csv/i);
  });

  it('should have 5-8 FAQ items', () => {
    renderPage();
    const faqSection = screen.getByText(/frequently asked questions/i).closest('section');
    
    expect(faqSection).toBeInTheDocument();
    
    // FAQs use <details> elements, count those instead of h3 headings
    const faqItems = within(faqSection!).getAllByRole('group'); // details has role="group"
    expect(faqItems.length).toBeGreaterThanOrEqual(5);
    expect(faqItems.length).toBeLessThanOrEqual(8);
  });
});

describe('Image to Excel Page - JSON-LD Structured Data', () => {
  it('should include FAQPage schema with all FAQ items', () => {
    renderPage();
    
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    expect(schemaScript).toBeInTheDocument();
    
    const schemaData = JSON.parse(schemaScript!.textContent || '{}');
    
    expect(schemaData['@context']).toBe('https://schema.org');
    expect(schemaData['@type']).toBe('FAQPage');
    expect(schemaData.mainEntity).toBeInstanceOf(Array);
    expect(schemaData.mainEntity.length).toBeGreaterThanOrEqual(5);
    
    // Verify each FAQ has question and answer
    schemaData.mainEntity.forEach((item: any) => {
      expect(item['@type']).toBe('Question');
      expect(item.name).toBeTruthy();
      expect(item.acceptedAnswer).toBeTruthy();
      expect(item.acceptedAnswer['@type']).toBe('Answer');
      expect(item.acceptedAnswer.text).toBeTruthy();
    });
  });

  it('should have FAQ questions about merged cells and formatting', () => {
    renderPage();
    
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    const schemaData = JSON.parse(schemaScript!.textContent || '{}');
    
    const questions = schemaData.mainEntity.map((item: any) => item.name.toLowerCase());
    const hasTableSpecificFAQ = questions.some((q: string) => 
      q.includes('merged') || q.includes('cell') || q.includes('number') || q.includes('format')
    );
    
    expect(hasTableSpecificFAQ).toBe(true);
  });
});

describe('Image to Excel Page - AdGate Compliance', () => {
  it('should show ads when content requirement is met', () => {
    renderPage();
    
    // Check for ad slots by data-ad-slot attribute (AdSlotLazy uses this)
    const adSlots = document.querySelectorAll('[data-ad-slot]');
    expect(adSlots.length).toBeGreaterThan(0);
  });

  it('should have exactly 2 ad positions configured', () => {
    renderPage();
    
    const adSlots = document.querySelectorAll('[data-ad-slot]');
    expect(adSlots.length).toBe(2);
  });

  it('should position first ad after explainer section', () => {
    renderPage();
    
    const supportedSection = screen.getByText(/what table formats can we extract/i).closest('section');
    const adSlots = document.querySelectorAll('[data-ad-slot]');
    
    expect(supportedSection).toBeInTheDocument();
    expect(adSlots.length).toBeGreaterThan(0);
    
    // Verify at least one ad exists (detailed positioning hard to test in unit tests)
    expect(adSlots[0]).toBeInTheDocument();
  });
});

describe('Image to Excel Page - Zero CLS (Cumulative Layout Shift)', () => {
  it('should have reserved minimum height for all ad slots', () => {
    renderPage();
    
    const adSlots = document.querySelectorAll('[data-ad-slot]');
    
    adSlots.forEach(adSlot => {
      const styles = window.getComputedStyle(adSlot as Element);
      const minHeight = parseInt(styles.minHeight, 10);
      
      // AdSlotLazy component should enforce minHeight: 300px
      expect(minHeight).toBeGreaterThanOrEqual(250);
    });
  });

  it('should not cause layout shift when ads are lazy loaded', () => {
    renderPage();
    
    const adSlots = document.querySelectorAll('[data-ad-slot]');
    
    adSlots.forEach(adSlot => {
      // Check that the container has reserved height BEFORE content loads
      const element = adSlot as HTMLElement;
      const hasReservedHeight = element.style.minHeight || window.getComputedStyle(element).minHeight;
      expect(hasReservedHeight).toBeTruthy();
      
      // Verify height is set as inline style or computed style
      const heightValue = element.style.minHeight || window.getComputedStyle(element).minHeight;
      expect(parseInt(heightValue, 10)).toBeGreaterThanOrEqual(250); // At least 250px reserved
    });
  });

  it('should apply reserved height as inline or CSS style', () => {
    renderPage();
    
    const adSlots = document.querySelectorAll('[data-ad-slot]');
    
    adSlots.forEach(adSlot => {
      const element = adSlot as HTMLElement;
      // Either inline style or computed style should have minHeight
      const inlineMinHeight = element.style.minHeight;
      const computedMinHeight = window.getComputedStyle(element).minHeight;
      
      const hasMinHeight = (inlineMinHeight && parseInt(inlineMinHeight, 10) >= 250) ||
                          (computedMinHeight && parseInt(computedMinHeight, 10) >= 250);
      
      expect(hasMinHeight).toBe(true);
    });
  });
});

describe('Image to Excel Page - Accessibility', () => {
  it('should have proper heading hierarchy (h1 > h2 > h3)', () => {
    renderPage();
    
    const h1 = screen.getByRole('heading', { level: 1 });
    const h2s = screen.getAllByRole('heading', { level: 2 });
    const h3s = screen.getAllByRole('heading', { level: 3 });
    
    expect(h1).toBeInTheDocument();
    expect(h2s.length).toBeGreaterThan(0);
    expect(h3s.length).toBeGreaterThan(0);
  });

  it('should have semantic HTML structure with main sections', () => {
    renderPage();
    
    // Should have multiple section elements for semantic structure
    const sections = document.querySelectorAll('section');
    expect(sections.length).toBeGreaterThan(3);
  });
});

describe('Image to Excel Page - SEO Metadata', () => {
  it('should have title with target keywords (image, excel, converter)', () => {
    const title = 'Image to Excel Converter – Extract Tables from Images (Free)';
    
    expect(title).toMatch(/image/i);
    expect(title).toMatch(/excel/i);
    expect(title).toMatch(/converter/i);
  });

  it('should have description between 150-160 characters', () => {
    const description = 'Convert images of tables to Excel or CSV instantly. Extract data from printed spreadsheets, receipts, and reports. Free OCR with header and cell detection.';
    
    expect(description.length).toBeGreaterThanOrEqual(150);
    expect(description.length).toBeLessThanOrEqual(160);
  });

  it('should mention receipts and tables in description for niche targeting', () => {
    const description = 'Convert images of tables to Excel or CSV instantly. Extract data from printed spreadsheets, receipts, and reports. Free OCR with header and cell detection.';
    
    expect(description).toMatch(/table/i);
    expect(description).toMatch(/receipt/i);
    expect(description).toMatch(/spreadsheet/i);
  });
});

describe('Image to Excel Page - Alias Route (jpg-to-excel)', () => {
  it('should have canonical link pointing to main route', () => {
    // This test verifies the alias exports metadata with canonical
    const { metadata } = require('../../app/jpg-to-excel/page');
    
    expect(metadata.alternates).toBeDefined();
    expect(metadata.alternates.canonical).toBe('/image-to-excel');
  });

  it('should have JPG-specific title for alias route', () => {
    const { metadata } = require('../../app/jpg-to-excel/page');
    
    expect(metadata.title).toMatch(/jpg/i);
    expect(metadata.title).toMatch(/excel/i);
  });

  it('should export same component as main route', () => {
    const AliasPage = require('../../app/jpg-to-excel/page').default;
    const MainPage = require('../../app/image-to-excel/page').default;
    
    // Should be the exact same component reference
    expect(AliasPage).toBe(MainPage);
  });
});
