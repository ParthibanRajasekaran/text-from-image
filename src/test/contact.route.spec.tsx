import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Contact from '../../pages/Contact';

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as any;

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

describe('Contact Page', () => {
  it('renders with exactly one <main> element', () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );
    const mainElements = screen.getAllByRole('main');
    expect(mainElements).toHaveLength(1);
  });

  it('renders H1 with correct text', () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );
    const h1 = screen.getByRole('heading', { level: 1, name: /contact us/i });
    expect(h1).toBeInTheDocument();
  });

  it('renders email contact link', () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );
    const emailLink = screen.getByRole('link', { name: /hello@freetextfromimage.com/i });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:hello@freetextfromimage.com');
  });

  it('renders GitHub Issues link with rel="nofollow"', () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );
    const issuesLink = screen.getByRole('link', { name: /open an issue on github/i });
    expect(issuesLink).toBeInTheDocument();
    expect(issuesLink).toHaveAttribute('href', expect.stringContaining('github.com'));
    expect(issuesLink).toHaveAttribute('rel', expect.stringContaining('nofollow'));
  });

  it('renders LinkedIn link', () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );
    const linkedinLink = screen.getByRole('link', { name: /connect on linkedin/i });
    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink).toHaveAttribute('href', expect.stringContaining('linkedin.com'));
  });

  it('does not render ad components (no InArticle slot)', () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );
    const inarticleSlot = screen.queryByTestId('inarticle-slot');
    expect(inarticleSlot).not.toBeInTheDocument();
  });

  it('renders JSON-LD ContactPage with correct structure', () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const contactScript = Array.from(scripts).find(script => 
      script.textContent?.includes('ContactPage')
    );
    expect(contactScript).toBeTruthy();
    if (contactScript) {
      const data = JSON.parse(contactScript.textContent || '{}');
      expect(data['@type']).toBe('ContactPage');
      expect(data.mainEntity['@type']).toBe('Organization');
      expect(data.mainEntity.contactPoint).toBeDefined();
      expect(data.mainEntity.contactPoint.email).toBe('hello@freetextfromimage.com');
    }
  });

  it('renders link back to About page', () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );
    const aboutLink = screen.getByRole('link', { name: /visit our about page/i });
    expect(aboutLink).toHaveAttribute('href', '/about');
  });

  it('renders back to home link', () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );
    const backLinks = screen.getAllByRole('link', { name: /back to ocr tool/i });
    expect(backLinks.length).toBeGreaterThan(0);
  });

  it('renders what to include in bug reports section', () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );
    const bugReportHeading = screen.getByRole('heading', { name: /when reporting bugs/i });
    expect(bugReportHeading).toBeInTheDocument();
  });

  it('renders priority topics: Security Issues and Privacy/DMCA', () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );
    expect(screen.getByText(/security issues/i)).toBeInTheDocument();
    expect(screen.getByText(/privacy & dmca/i)).toBeInTheDocument();
  });

  it('has visible focus states on interactive links', () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );
    // Check main action link (email CTA)
    const emailLink = screen.getByRole('link', { name: /send us an email/i });
    const className = emailLink.getAttribute('class') || '';
    expect(className).toMatch(/focus:outline-none|focus:ring/);
  });

  it('includes privacy notice', () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );
    expect(screen.getByText(/privacy note:/i)).toBeInTheDocument();
  });
});
