import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import About from '../../pages/About';

// Mock IntersectionObserver for scroll spy
global.IntersectionObserver = vi.fn(function (this: any) {
  this.observe = vi.fn();
  this.unobserve = vi.fn();
  this.disconnect = vi.fn();
}) as any;

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
    expect(heading).toHaveTextContent(/About RenderCheck/);
  });

  it('renders all section headings with correct hierarchy', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const h2Texts = h2s.map(h => h.textContent);

    expect(h2Texts).toContain('Why RenderCheck');
    expect(h2Texts).toContain('How It Works');
    expect(h2Texts).toContain('Roadmap and sustainability');
    expect(h2Texts).toContain('The author');
    expect(h2Texts).toContain('Track record');
    expect(h2Texts).toContain('Quality & Trust');
    expect(h2Texts).toContain('Have Questions?');
  });

  it('renders value pillar cards with correct content', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    expect(screen.getByText('Reads what is rendered')).toBeInTheDocument();
    expect(screen.getByText('Local only')).toBeInTheDocument();
    expect(screen.getByText('Fails with evidence')).toBeInTheDocument();
  });

  it('renders founder card with headshot image', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const headshot = screen.getByAltText(/Parthiban Rajasekaran, author of RenderCheck/);
    expect(headshot).toBeInTheDocument();
    expect(headshot).toHaveAttribute('src', '/images/parthiban-480.jpg');
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
    expect(screen.getByText(/Author of RenderCheck · Principal Dev Engineer/)).toBeInTheDocument();
  });

  it('renders CTA links to the docs and the main tool', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    expect(screen.getByRole('link', { name: /Read the docs/ })).toHaveAttribute('href', '/developers');
    expect(screen.getByRole('link', { name: /Try Image → Text/ })).toHaveAttribute('href', '/');
  });

  it('renders How It Works section with ordered list', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    expect(screen.getByText(/Your test takes a screenshot/)).toBeInTheDocument();
    expect(screen.getByText(/Tesseract \(WebAssembly\) reads it on your machine/)).toBeInTheDocument();
    expect(screen.getByText(/The assertion passes, or fails with a diff/)).toBeInTheDocument();
  });

  it('labels the roadmap as plans and keeps the core free', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    expect(screen.getByText(/These are plans, not products/)).toBeInTheDocument();
    expect(screen.getByText('Stays free and open')).toBeInTheDocument();
    expect(screen.getByText('Under consideration for teams')).toBeInTheDocument();
  });

  it('renders Quality & Trust section with checkable commitments', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    expect(screen.getByText(/Network proof:/)).toBeInTheDocument();
    expect(screen.getByText(/axe-core runs in CI/)).toBeInTheDocument();
    expect(screen.getByText(/Supply chain:/)).toBeInTheDocument();
  });

  it('attributes the work to its author with external, checkable links and an independence statement', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('https://leaddev.com/community/parthiban-rajasekaran');
    expect(hrefs).toContain('https://2026.platformcon.com/speakers/parthiban-rajasekaran');
    expect(screen.getByText(/independent project/i)).toBeInTheDocument();
    expect(screen.getByText(/ISBN 979-8242088597/)).toBeInTheDocument();
  });

  it('makes no claims about partners, customers or a company', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const text = document.body.textContent ?? '';
    expect(text).not.toMatch(/design partner|our customers|our team|trusted by|waitlist/i);
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
    expect(jsonLd).toContain('About RenderCheck');
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
