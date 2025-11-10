import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import About from '../../pages/About';

// Mock IntersectionObserver for scroll spy
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as any;

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

describe('About Page', () => {
  beforeEach(() => {
    window.scrollY = 0;
  });

  it('renders with a single <main> element', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const mains = screen.getAllByRole('main');
    expect(mains).toHaveLength(1);
  });

  it('renders the page title as h1', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/About TextFromImage/);
  });

  it('renders all section headings with correct hierarchy', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const h2Texts = h2s.map(h => h.textContent);

    expect(h2Texts).toContain('Why TextFromImage');
    expect(h2Texts).toContain('How It Works');
    expect(h2Texts).toContain("What's Next");
    expect(h2Texts).toContain('Quality & Trust');
    expect(h2Texts).toContain('Have Questions?');
  });

  it('renders value pillar cards with correct content', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    expect(screen.getByText('Private')).toBeInTheDocument();
    expect(screen.getByText('Fast')).toBeInTheDocument();
    expect(screen.getByText('Accessible')).toBeInTheDocument();

    expect(screen.getByText(/Your images never leave your device/)).toBeInTheDocument();
    expect(screen.getByText(/Instant results/)).toBeInTheDocument();
    expect(screen.getByText(/Built for everyone/)).toBeInTheDocument();
  });

  it('renders founder card with headshot image', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const headshot = screen.getByAltText(/Parthiban Rajasekaran, founder of TextFromImage/);
    expect(headshot).toBeInTheDocument();
    expect(headshot).toHaveAttribute('src', 'images/headshot.jpg');
    expect(headshot).toHaveAttribute('width', '480');
    expect(headshot).toHaveAttribute('height', '600');
    expect(headshot).toHaveAttribute('loading', 'lazy');
  });

  it('renders founder name and title in sidebar', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    expect(screen.getByText('Parthiban Rajasekaran')).toBeInTheDocument();
    expect(screen.getByText('Founder & Engineer')).toBeInTheDocument();
  });

  it('renders CTA links to main tool and guides', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const tryLink = screen.getByRole('link', { name: /Try Image → Text/ });
    expect(tryLink).toHaveAttribute('href', '/');

    const guidesLink = screen.getByRole('link', { name: /See Guides/ });
    expect(guidesLink).toHaveAttribute('href', '/image-to-text');
  });

  it('renders How It Works section with ordered list', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    expect(screen.getByText(/Upload an image—it stays in your browser/)).toBeInTheDocument();
    expect(screen.getByText(/OCR runs locally in Web Workers/)).toBeInTheDocument();
    expect(screen.getByText(/Results appear instantly/)).toBeInTheDocument();
  });

  it('renders roadmap section with feature items', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    expect(screen.getByText(/Tables → Excel/)).toBeInTheDocument();
    expect(screen.getByText(/More Languages & Handwriting/)).toBeInTheDocument();
    expect(screen.getByText(/PWA & Offline/)).toBeInTheDocument();
    expect(screen.getByText(/Redaction Tools/)).toBeInTheDocument();
  });

  it('renders Quality & Trust section with key commitments', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    expect(screen.getByText(/Core Web Vitals/)).toBeInTheDocument();
    expect(screen.getByText(/WCAG 2.1 AA compliant/)).toBeInTheDocument();
    expect(screen.getByText(/Consent Mode v2/)).toBeInTheDocument();
    expect(screen.getByText(/No Ads on Tools/)).toBeInTheDocument();
  });

  it('renders contact section with link and email', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const contactLink = screen.getByRole('link', { name: /Contact us/ });
    expect(contactLink).toHaveAttribute('href', '/contact');

    const emailLink = screen.getByRole('link', { name: /rajasekaran.parthiban7@gmail.com/ });
    expect(emailLink).toHaveAttribute('href', 'mailto:rajasekaran.parthiban7@gmail.com');
  });

  it('renders footer links (Privacy, Terms, GitHub)', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    expect(screen.getByRole('link', { name: /Privacy/ })).toHaveAttribute('href', '/privacy-policy');
    expect(screen.getByRole('link', { name: /Terms/ })).toHaveAttribute('href', '/terms');

    const githubFooterLinks = screen.getAllByRole('link', {
      name: /GitHub/,
    });
    const repoLink = githubFooterLinks.find(link => 
      link.getAttribute('href')?.includes('text-from-image')
    );
    expect(repoLink).toHaveAttribute(
      'href',
      expect.stringContaining('github.com/ParthibanRajasekaran/text-from-image')
    );
  });

  it('renders ScrollNav for in-page navigation', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const navs = screen.getAllByLabelText('On this page');
    expect(navs.length).toBeGreaterThan(0);
  });

  it('renders breadcrumb navigation', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const homeLink = screen.getByRole('link', { name: /Home/ });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('includes JSON-LD structured data (AboutPage)', () => {
    const { container } = render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const scriptTags = container.querySelectorAll('script[type="application/ld+json"]');
    expect(scriptTags.length).toBeGreaterThan(0);

    const jsonLd = scriptTags[0].textContent;
    expect(jsonLd).toContain('"@type":"AboutPage"');
    expect(jsonLd).toContain('About TextFromImage');
  });

  it('renders with proper accessibility attributes', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
  });

  it('does not render ad slots on the About page', () => {
    const { container } = render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const adSlots = container.querySelectorAll('[class*="ad-slot"], [class*="google-ads"]');
    expect(adSlots).toHaveLength(0);
  });
});
