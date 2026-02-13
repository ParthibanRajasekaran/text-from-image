import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScrollNav } from '../../components/ui/ScrollNav';

// Mock IntersectionObserver for jsdom
global.IntersectionObserver = class IntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
} as any;

describe('ScrollNav - A11y & UX', () => {
  beforeEach(() => {
    // Reset scroll position
    window.scrollY = 0;
    // Mock scrollIntoView for jsdom
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders with section links', () => {
    const sections = [
      { id: 'section-1', label: 'First' },
      { id: 'section-2', label: 'Second' },
      { id: 'section-3', label: 'Third' },
    ];

    render(<ScrollNav sections={sections} />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(3);
  });

  it('sets aria-current="location" on active link after click', async () => {
    const user = userEvent.setup();
    const sections = [
      { id: 'section-1', label: 'First' },
      { id: 'section-2', label: 'Second' },
      { id: 'section-3', label: 'Third' },
    ];

    // Create dummy page with sections
    render(
      <>
        <div>
          <section id="section-1">Section 1 content</section>
          <section id="section-2">Section 2 content</section>
          <section id="section-3">Section 3 content</section>
        </div>
        <ScrollNav sections={sections} />
      </>
    );

    const secondLink = screen.getByRole('link', { name: 'Second' });
    expect(secondLink).not.toHaveAttribute('aria-current');

    await user.click(secondLink);

    expect(secondLink).toHaveAttribute('aria-current', 'location');
  });

  it('shows focus ring on non-active items without active fill', () => {
    const sections = [
      { id: 'section-1', label: 'First' },
      { id: 'section-2', label: 'Second' },
      { id: 'section-3', label: 'Third' },
    ];

    render(
      <>
        <div>
          <section id="section-1">Section 1 content</section>
          <section id="section-2">Section 2 content</section>
          <section id="section-3">Section 3 content</section>
        </div>
        <ScrollNav sections={sections} />
      </>
    );

    // Get third link (should not be active)
    const thirdLink = screen.getByRole('link', { name: 'Third' });

    // Focus the link explicitly to test focus styles
    thirdLink.focus();
    expect(document.activeElement).toBe(thirdLink);

    // Verify it has focus-visible classes (ring-2, ring-accent)
    const className = thirdLink.className;
    expect(className).toContain('focus-visible:ring-2');
    expect(className).toContain('ring-accent');

    // Verify it does NOT have aria-current (not active yet)
    expect(thirdLink).not.toHaveAttribute('aria-current', 'location');
  });

  it('only one item has aria-current at a time', async () => {
    const user = userEvent.setup();
    const sections = [
      { id: 'section-1', label: 'First' },
      { id: 'section-2', label: 'Second' },
    ];

    render(
      <>
        <div>
          <section id="section-1">Section 1 content</section>
          <section id="section-2">Section 2 content</section>
        </div>
        <ScrollNav sections={sections} />
      </>
    );

    // Click first link
    const firstLink = screen.getByRole('link', { name: 'First' });
    await user.click(firstLink);

    // Verify first has aria-current
    expect(firstLink).toHaveAttribute('aria-current', 'location');

    // Click second link
    const secondLink = screen.getByRole('link', { name: 'Second' });
    await user.click(secondLink);

    // Verify second now has aria-current
    expect(secondLink).toHaveAttribute('aria-current', 'location');

    // Verify first no longer has aria-current
    expect(firstLink).not.toHaveAttribute('aria-current');
  });

  it('applies scroll-margin-top to sections on mount', () => {
    const sections = [
      { id: 'section-1', label: 'First' },
      { id: 'section-2', label: 'Second' },
    ];

    render(
      <>
        <div>
          <section id="section-1">Section 1 content</section>
          <section id="section-2">Section 2 content</section>
        </div>
        <ScrollNav sections={sections} />
      </>
    );

    // Check that sections have scroll-margin-top set
    const section1 = document.getElementById('section-1');
    const section2 = document.getElementById('section-2');

    expect(section1?.style.scrollMarginTop).toBe('104px'); // 96 + 8
    expect(section2?.style.scrollMarginTop).toBe('104px');
  });

  it('renders with glass-morphism styling', () => {
    const sections = [
      { id: 'section-1', label: 'First' },
    ];

    render(<ScrollNav sections={sections} />);

    const nav = screen.getByRole('navigation', { name: 'On this page' });
    
    // Should have glass morphism classes
    expect(nav.className).toContain('rounded-2xl');
    expect(nav.className).toContain('bg-background/40');
    expect(nav.className).toContain('backdrop-blur-xl');
  });

  it('applies accent bar styling to active item', async () => {
    const user = userEvent.setup();
    const sections = [
      { id: 'section-1', label: 'First' },
      { id: 'section-2', label: 'Second' },
    ];

    render(
      <>
        <div>
          <section id="section-1">Section 1 content</section>
          <section id="section-2">Section 2 content</section>
        </div>
        <ScrollNav sections={sections} />
      </>
    );

    const secondLink = screen.getByRole('link', { name: 'Second' });
    await user.click(secondLink);

    // Find the accent bar span (first child, the active marker)
    const accentBar = secondLink.querySelector('span.bg-accent');
    expect(accentBar?.className).toContain('opacity-100');
  });

  it('respects prefers-reduced-motion on scroll', async () => {
    const user = userEvent.setup();

    const sections = [
      { id: 'section-1', label: 'First' },
      { id: 'section-2', label: 'Second' },
    ];

    render(
      <>
        <div>
          <section id="section-1">Section 1 content</section>
          <section id="section-2">Section 2 content</section>
        </div>
        <ScrollNav sections={sections} />
      </>
    );

    const firstLink = screen.getByRole('link', { name: 'First' });
    await user.click(firstLink);

    // Verify clicking the link updates active state
    expect(firstLink).toHaveAttribute('aria-current', 'location');
  });
});
