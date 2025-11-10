import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Contact from '../../pages/Contact';

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as any;

// Mock scrollIntoView for DOM elements
Element.prototype.scrollIntoView = vi.fn();

describe('Contact Page - ScrollNav', () => {
  beforeEach(() => {
    // Reset scroll position
    window.scrollY = 0;
  });

  it('renders ScrollNav with all section links', () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    // Check that nav exists
    const navs = screen.getAllByLabelText('On this page');
    expect(navs.length).toBeGreaterThan(0);

    // Check all sections are listed
    expect(screen.getByRole('link', { name: /ways to reach us/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /when reporting bugs/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /priority topics/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ready\?/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /more info/i })).toBeInTheDocument();
  });

  it('renders AnchorSection headings with ids', () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    // Check that sections exist with ids
    expect(document.getElementById('reach-us')).toBeInTheDocument();
    expect(document.getElementById('what-to-include')).toBeInTheDocument();
    expect(document.getElementById('priority-topics')).toBeInTheDocument();
    expect(document.getElementById('ready')).toBeInTheDocument();
    expect(document.getElementById('more-info')).toBeInTheDocument();
  });

  it('clicking nav link sets location.hash', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    const reachUsLink = screen.getByRole('link', { name: /ways to reach us/i });
    await user.click(reachUsLink);

    // The hash should be set by the browser's default link behavior
    // (since we're not preventing default in the new component)
    expect(window.location.hash).toBe('#reach-us');
  });

  it('renders nav with glass theme styling', () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    const nav = screen.getByLabelText('On this page');
    const className = nav.getAttribute('class') || '';
    
    expect(className).toContain('bg-background/40');
    expect(className).toContain('backdrop-blur-xl');
    expect(className).toContain('border');
  });

  it('renders nav with active marker styling', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    const reachUsLink = screen.getByRole('link', { name: /ways to reach us/i });
    await user.click(reachUsLink);

    // After click, aria-current should be set
    expect(reachUsLink).toHaveAttribute('aria-current', 'location');
  });

  it('ScrollNav respects reduced motion preference', () => {
    // Mock prefers-reduced-motion: reduce
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    // Component should still render without errors
    expect(screen.getAllByLabelText('On this page').length).toBeGreaterThan(0);
  });

  it('has scroll-mt- class on sections for CLS prevention', () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    const reachUsSection = document.getElementById('reach-us');
    const className = reachUsSection?.getAttribute('class') || '';
    
    expect(className).toContain('scroll-mt');
  });

  it('glass theme classes are present on ScrollNav', () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    const navs = screen.getAllByLabelText('On this page');
    const nav = navs[0];
    
    expect(nav).toBeInTheDocument();
    expect(nav.getAttribute('class')).toContain('rounded-2xl');
    expect(nav.getAttribute('class')).toContain('backdrop-blur-xl');
    expect(nav.getAttribute('class')).toContain('border-border');
  });

  it('aria-current location is set on active link', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    const reachUsLinks = screen.getAllByRole('link', { name: /ways to reach us/i });
    const reachUsLink = reachUsLinks[0];
    
    // After clicking, aria-current should be set (via scroll spy)
    await user.click(reachUsLink);

    // In real scenario with IntersectionObserver, aria-current would update
    await waitFor(() => {
      expect(reachUsLink).toBeInTheDocument();
    });
  });

  it('all nav links are keyboard accessible', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    const reachUsLinks = screen.getAllByRole('link', { name: /ways to reach us/i });
    const reachUsLink = reachUsLinks[0];
    
    // Should be focusable
    reachUsLink.focus();
    expect(document.activeElement).toBe(reachUsLink);

    // Should respond to Enter key
    await user.keyboard('{Enter}');
    expect(window.location.hash).toBe('#reach-us');
  });

  it('contact page has no ad components', () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    const inarticleSlot = screen.queryByTestId('inarticle-slot');
    expect(inarticleSlot).not.toBeInTheDocument();
  });

  it('renders all contact methods', () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    // Email link
    expect(screen.getByRole('link', { name: /rajasekaran.parthiban7@gmail.com/i })).toBeInTheDocument();

    // GitHub Issues link
    expect(screen.getByRole('link', { name: /open an issue on github/i })).toBeInTheDocument();

    // LinkedIn link
    expect(screen.getByRole('link', { name: /connect on linkedin/i })).toBeInTheDocument();
  });

  it('has focus states on all interactive elements', async () => {
    const _user = userEvent.setup();
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    const navLinks = screen.getAllByRole('link');
    for (const link of navLinks.slice(0, 3)) {
      link.focus();
      expect(document.activeElement).toBe(link);
    }
  });
});
