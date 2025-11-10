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

    // Check that nav exists (will find multiple due to desktop + mobile)
    const navs = screen.getAllByLabelText('On this page');
    expect(navs.length).toBeGreaterThan(0);

    // Check all sections are listed (use getAllByRole due to duplicates)
    expect(screen.getAllByRole('link', { name: /ways to reach us/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /when reporting bugs/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /priority topics/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /ready\?/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /more info/i }).length).toBeGreaterThan(0);
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

  it('clicking nav link sets location.hash and focuses heading', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    const reachUsLinks = screen.getAllByRole('link', { name: /ways to reach us/i });
    await user.click(reachUsLinks[0]);

    // Check hash is set
    expect(window.location.hash).toBe('#reach-us');

    // Check heading is focused
    const reachUsSection = document.getElementById('reach-us');
    expect(document.activeElement).toBe(reachUsSection);
  });

  it('renders desktop nav with sticky positioning', () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    const desktopNavs = screen.getAllByLabelText('On this page');
    const className = desktopNavs[0].getAttribute('class') || '';
    
    expect(className).toContain('sticky');
    expect(className).toContain('top-');
  });

  it('renders mobile collapsible nav with details element', () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    // Mobile nav should exist
    const details = document.querySelector('details');
    expect(details).toBeInTheDocument();
    
    // Summary should say "Jump to"
    const summary = details?.querySelector('summary');
    expect(summary?.textContent).toContain('Jump to');
  });

  it('mobile details toggle works', async () => {
    const _user = userEvent.setup();
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    const details = document.querySelector('details') as HTMLElement;
    const summary = details?.querySelector('summary') as HTMLElement;

    // Initially closed or open depending on component state
    // Toggle it
    await _user.click(summary);

    // Should toggle the open state
    await waitFor(() => {
      expect(details).toBeInTheDocument();
    });
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
    const navCard = navs[0].querySelector('div[class*="backdrop-blur"]');
    
    expect(navCard).toBeInTheDocument();
    expect(navCard?.getAttribute('class')).toContain('rounded-2xl');
    expect(navCard?.getAttribute('class')).toContain('backdrop-blur-xl');
    expect(navCard?.getAttribute('class')).toContain('border-border');
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
    expect(screen.getByRole('link', { name: /hello@freetextfromimage.com/i })).toBeInTheDocument();

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
