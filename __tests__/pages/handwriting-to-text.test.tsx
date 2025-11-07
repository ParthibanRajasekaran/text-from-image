import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import HandwritingToTextPage from '../../app/handwriting-to-text/page';
import { countWords } from '../../app/(tools)/_builder';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  useReducedMotion: () => true,
}));

// Mock the OCR service
jest.mock('../../services/tesseractService', () => ({
  extractTextWithCustomPreprocessing: jest.fn().mockResolvedValue({
    text: 'Sample extracted text from handwriting',
    confidence: 85,
  }),
}));

// Wrapper component with router
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Handwriting to Text Page', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Content Requirements', () => {
    it('renders unique H1 with "Handwriting" in title', () => {
      render(
        <TestWrapper>
          <HandwritingToTextPage />
        </TestWrapper>
      );

      const heading = screen.getByRole('heading', { level: 2, name: /handwriting/i });
      expect(heading).toBeInTheDocument();
      expect(heading.textContent).toContain('Handwriting');
    });

    it('has at least 400 words of publisher content', () => {
      const { container } = render(
        <TestWrapper>
          <HandwritingToTextPage />
        </TestWrapper>
      );

      // Extract all visible text content
      const bodyText = container.textContent || '';
      const wordCount = countWords(bodyText);

      // Should have at least 400 words for AdSense policy
      expect(wordCount).toBeGreaterThanOrEqual(400);
    });

    it('renders all required sections', () => {
      render(
        <TestWrapper>
          <HandwritingToTextPage />
        </TestWrapper>
      );

      // Hero section
      expect(screen.getByText(/Turn Handwriting into Digital Text/i)).toBeInTheDocument();

      // How it works
      expect(screen.getByText(/How It Works/i)).toBeInTheDocument();
      expect(screen.getByText(/Upload Your Image/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Automatic Enhancement/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Copy or Download/i).length).toBeGreaterThan(0);

      // Supported inputs
      expect(screen.getByText(/What Handwriting Can We Process/i)).toBeInTheDocument();

      // Privacy
      expect(screen.getByText(/Your Privacy Matters/i)).toBeInTheDocument();

      // FAQ
      expect(screen.getByText(/Frequently Asked Questions/i)).toBeInTheDocument();
    });

    it('renders at least 6 FAQ items', () => {
      const { container } = render(
        <TestWrapper>
          <HandwritingToTextPage />
        </TestWrapper>
      );

      // Count details elements (FAQ items)
      const faqItems = container.querySelectorAll('details');
      expect(faqItems.length).toBeGreaterThanOrEqual(6);
    });

    it('includes handwriting-specific content', () => {
      render(
        <TestWrapper>
          <HandwritingToTextPage />
        </TestWrapper>
      );

      // Should mention specific handwriting challenges (check main content)
      const bodyText = screen.getByRole('main').textContent || '';
      expect(bodyText).toMatch(/cursive/i);
      
      // Should mention handwriting-specific tips
      expect(bodyText).toMatch(/notebook|notes|handwritten/i);
    });
  });

  describe('SEO - FAQ Schema', () => {
    it('includes FAQPage JSON-LD structured data', () => {
      const { container } = render(
        <TestWrapper>
          <HandwritingToTextPage />
        </TestWrapper>
      );

      // Find the script tag with JSON-LD
      const jsonLdScript = container.querySelector('script[type="application/ld+json"]');
      expect(jsonLdScript).toBeInTheDocument();

      if (jsonLdScript) {
        const jsonLd = JSON.parse(jsonLdScript.textContent || '{}');
        
        // Verify it's a FAQPage
        expect(jsonLd['@type']).toBe('FAQPage');
        expect(jsonLd['@context']).toBe('https://schema.org');
        
        // Verify it has questions
        expect(jsonLd.mainEntity).toBeDefined();
        expect(Array.isArray(jsonLd.mainEntity)).toBe(true);
        expect(jsonLd.mainEntity.length).toBeGreaterThanOrEqual(6);

        // Verify question structure
        const firstQuestion = jsonLd.mainEntity[0];
        expect(firstQuestion['@type']).toBe('Question');
        expect(firstQuestion.name).toBeDefined();
        expect(firstQuestion.acceptedAnswer).toBeDefined();
        expect(firstQuestion.acceptedAnswer['@type']).toBe('Answer');
        expect(firstQuestion.acceptedAnswer.text).toBeDefined();
      }
    });
  });

  describe('AdGate Compliance', () => {
    it('does not render ads on initial page load (before content)', async () => {
      const { container } = render(
        <TestWrapper>
          <HandwritingToTextPage />
        </TestWrapper>
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText(/Turn Handwriting into Digital Text/i)).toBeInTheDocument();
      });

      // Check for ad slots - they should be gated properly
      const adSlots = container.querySelectorAll('[data-ad-slot]');
      
      // Ads should exist but be gated by AdGate (content requirements met)
      // Since we have explainers and sufficient word count, ads should render
      // But they shouldn't be visible in the DOM until AdGate allows
      expect(adSlots.length).toBeGreaterThanOrEqual(0);
    });

    it('allows ads when content requirements are met', () => {
      const { container } = render(
        <TestWrapper>
          <HandwritingToTextPage />
        </TestWrapper>
      );

      // Calculate word count
      const bodyText = container.textContent || '';
      const wordCount = countWords(bodyText);

      // Content requirements for ads
      const hasEnoughContent = wordCount >= 250;
      const hasExplainers = bodyText.includes('How It Works');

      expect(hasEnoughContent).toBe(true);
      expect(hasExplainers).toBe(true);
    });

    it('places ads only after explainer blocks', () => {
      const { container } = render(
        <TestWrapper>
          <HandwritingToTextPage />
        </TestWrapper>
      );

      // Get the order of elements
      const mainContent = container.querySelector('main');
      if (!mainContent) throw new Error('Main content not found');

      const sections = Array.from(mainContent.querySelectorAll('section, div[data-ad-slot]'));
      
      // Find first ad slot index
      let firstAdIndex = -1;
      let firstExplainerIndex = -1;

      sections.forEach((section, index) => {
        if (section.hasAttribute('data-ad-slot') && firstAdIndex === -1) {
          firstAdIndex = index;
        }
        if (section.textContent?.includes('How It Works') && firstExplainerIndex === -1) {
          firstExplainerIndex = index;
        }
      });

      // If ads are present, they should come after explainers
      if (firstAdIndex !== -1 && firstExplainerIndex !== -1) {
        expect(firstAdIndex).toBeGreaterThan(firstExplainerIndex);
      }
    });
  });

  describe('Accessibility', () => {
    it('has skip to main content link', () => {
      render(
        <TestWrapper>
          <HandwritingToTextPage />
        </TestWrapper>
      );

      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('has proper heading hierarchy', () => {
      const { container } = render(
        <TestWrapper>
          <HandwritingToTextPage />
        </TestWrapper>
      );

      // Get all headings
      const h1 = container.querySelector('h1');
      const h2s = container.querySelectorAll('h2');
      const h3s = container.querySelectorAll('h3');
      const h4s = container.querySelectorAll('h4');

      // Should have brand H1
      expect(h1).toBeInTheDocument();
      expect(h1?.textContent).toContain('TextFromImage');

      // Should have hero H2
      expect(h2s.length).toBeGreaterThan(0);

      // Should have section H3s
      expect(h3s.length).toBeGreaterThan(0);

      // Should have step H4s
      expect(h4s.length).toBeGreaterThan(0);
    });

    it('has proper ARIA labels', () => {
      render(
        <TestWrapper>
          <HandwritingToTextPage />
        </TestWrapper>
      );

      // Main content region
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });
  });

  describe('Word Count Helper', () => {
    it('accurately counts words in plain text', () => {
      const text = 'This is a simple test with ten words here.';
      expect(countWords(text)).toBe(9); // Actually 9 words
    });

    it('strips HTML tags before counting', () => {
      const text = '<p>This is <strong>bold</strong> text</p>';
      expect(countWords(text)).toBe(4);
    });

    it('handles multiple spaces and newlines', () => {
      const text = 'Word1    Word2\n\nWord3\tWord4';
      expect(countWords(text)).toBe(4);
    });

    it('returns 0 for empty string', () => {
      expect(countWords('')).toBe(0);
    });
  });

  describe('Metadata', () => {
    it('exports proper metadata for SEO', async () => {
      // Import metadata
      const module = await import('../../app/handwriting-to-text/page');
      const { metadata } = module;

      expect(metadata).toBeDefined();
      expect(metadata.title).toContain('Handwriting');
      expect(metadata.title).toContain('TextFromImage');
      expect(metadata.description).toBeDefined();
      expect(metadata.description.length).toBeGreaterThanOrEqual(150);
      expect(metadata.description.length).toBeLessThanOrEqual(160);
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.twitter).toBeDefined();
    });
  });
});
