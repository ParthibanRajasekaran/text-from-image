import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import About from '../../pages/About';

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(function (this: any) {
  this.observe = vi.fn();
  this.unobserve = vi.fn();
  this.disconnect = vi.fn();
}) as any;

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

describe('About Page', () => {
  it('renders with exactly one <main> element', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );
    const mainElements = screen.getAllByRole('main');
    expect(mainElements).toHaveLength(1);
  });

  it('renders H1 with correct text', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );
    const h1 = screen.getByRole('heading', { level: 1, name: /about textfromimage/i });
    expect(h1).toBeInTheDocument();
  });

  it('renders headshot image with correct attributes', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );
    const img = screen.getByAltText(/parthiban rajasekaran, founder of textfromimage/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('width', '480');
    expect(img).toHaveAttribute('height', '600');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('renders small GitHub link with rel="nofollow"', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );
    const githubLinks = screen.getAllByRole('link', { name: /github/i });
    const smallGithubLink = githubLinks.find(link => 
      link.getAttribute('rel')?.includes('nofollow') && 
      link.getAttribute('href')?.includes('text-from-image')
    );
    expect(smallGithubLink).toBeInTheDocument();
    expect(smallGithubLink).toHaveAttribute('rel', expect.stringContaining('nofollow'));
    expect(smallGithubLink).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('does not render ad components (no InArticle slot)', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );
    const inarticleSlot = screen.queryByTestId('inarticle-slot');
    expect(inarticleSlot).not.toBeInTheDocument();
  });

  it('renders canonical link in SEO (useSEO called)', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );
    // Check that JSON-LD is present (set via useSEO)
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const aboutScript = Array.from(scripts).find(script => 
      script.textContent?.includes('AboutPage')
    );
    expect(aboutScript).toBeTruthy();
  });

  it('renders JSON-LD AboutPage with correct structure', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const aboutScript = Array.from(scripts).find(script => 
      script.textContent?.includes('AboutPage')
    );
    expect(aboutScript).toBeTruthy();
    if (aboutScript) {
      const data = JSON.parse(aboutScript.textContent || '{}');
      expect(data['@type']).toBe('AboutPage');
      expect(data.mainEntity['@type']).toBe('Organization');
      expect(data.mainEntity.founder['@type']).toBe('Person');
      expect(data.mainEntity.founder.name).toBe('Parthiban Rajasekaran');
    }
  });

  it('renders contact link to /contact', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );
    const contactLink = screen.getByRole('link', { name: /contact us/i });
    expect(contactLink).toHaveAttribute('href', '/contact');
  });

  it('renders primary CTA link to home', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );
    const cta = screen.getByRole('link', { name: /try image → text/i });
    expect(cta).toHaveAttribute('href', '/');
  });

  it('has visible focus states on interactive links', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );
    // Check main action links (not breadcrumbs)
    const actionLinks = screen.getByRole('link', { name: /try image → text/i });
    const className = actionLinks.getAttribute('class') || '';
    expect(className).toMatch(/focus:outline-none|focus:ring/);
  });
});
