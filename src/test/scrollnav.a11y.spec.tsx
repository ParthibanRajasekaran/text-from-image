import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScrollNav } from '../../components/ui/ScrollNav';

// Mock IntersectionObserver for jsdom
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as any;

describe('ScrollNav - A11y & UX', () => {
  beforeEach(() => {
    // Reset scroll position
    window.scrollY = 0;
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

    // Get all links (desktop + mobile)
    const allLinks = screen.getAllByRole('link', { name: /Second/ });
    expect(allLinks.length).toBeGreaterThan(0);

    // Click on second link
    await user.click(allLinks[0]);

    // Verify second link has aria-current="location"
    expect(allLinks[0]).toHaveAttribute('aria-current', 'location');

    // Verify first link does NOT have aria-current
    const firstLinks = screen.getAllByRole('link', { name: /First/ });
    expect(firstLinks[0]).not.toHaveAttribute('aria-current');
  });

  it('shows focus ring on non-active items without active fill', async () => {
    const user = userEvent.setup();
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
    const thirdLinks = screen.getAllByRole('link', { name: /Third/ });
    const thirdLink = thirdLinks[0];

    // Tab to focus it
    await user.tab();
    // Continue tabbing until we focus the third link
    while (document.activeElement !== thirdLink) {
      await user.tab();
      if (document.activeElement === thirdLink) break;
    }

    // Focus the link explicitly to test focus styles
    thirdLink.focus();
    expect(document.activeElement).toBe(thirdLink);

    // Verify it has focus-visible classes (ring-2, ring-accent)
    const className = thirdLink.className;
    expect(className).toContain('focus-visible:ring-2');
    expect(className).toContain('ring-accent');

    // Verify it does NOT have aria-current (not active yet)
    expect(thirdLink).not.toHaveAttribute('aria-current', 'location');

    // Verify it does NOT have the active fill (bg-accent/20)
    expect(className).not.toContain('bg-accent/20');
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
    const firstLinks = screen.getAllByRole('link', { name: /First/ });
    await user.click(firstLinks[0]);

    // Verify first has aria-current
    expect(firstLinks[0]).toHaveAttribute('aria-current', 'location');

    // Click second link
    const secondLinks = screen.getAllByRole('link', { name: /Second/ });
    await user.click(secondLinks[0]);

    // Verify second now has aria-current
    expect(secondLinks[0]).toHaveAttribute('aria-current', 'location');

    // Verify first no longer has aria-current
    expect(firstLinks[0]).not.toHaveAttribute('aria-current');
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

  it('renders mobile details with summary', () => {
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

    // Mobile nav should have details element
    const detailsEl = document.querySelector('details');
    expect(detailsEl).toBeInTheDocument();

    // Summary should contain "Jump to"
    const summaryEl = detailsEl?.querySelector('summary');
    expect(summaryEl?.textContent).toContain('Jump to');
  });

  it('closes mobile nav after clicking a link', async () => {
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

    const detailsEl = document.querySelector('details') as HTMLDetailsElement;

    // Open the details
    const summaryEl = detailsEl?.querySelector('summary') as HTMLElement;
    await user.click(summaryEl);
    expect(detailsEl.open).toBe(true);

    // Click a link
    const links = screen.getAllByRole('link', { name: /Second/ });
    await user.click(links[0]);

    // Details should close
    expect(detailsEl.open).toBe(false);
  });

  it('respects prefers-reduced-motion on scroll', async () => {
    const user = userEvent.setup();

    // Mock prefers-reduced-motion: reduce
    const mockMatchMedia = vi.fn(() => ({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    window.matchMedia = mockMatchMedia as any;

    const sections = [
      { id: 'section-1', label: 'First' },
      { id: 'section-2', label: 'Second' },
    ];

    // Mock scrollIntoView to track if it's called
    Element.prototype.scrollIntoView = vi.fn();

    render(
      <>
        <div>
          <section id="section-1">Section 1 content</section>
          <section id="section-2">Section 2 content</section>
        </div>
        <ScrollNav sections={sections} />
      </>
    );

    const links = screen.getAllByRole('link', { name: /First/ });
    await user.click(links[0]);

    // scrollIntoView should have been called
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();

    // Verify it was called with behavior: 'auto' (not 'smooth')
    const calls = (Element.prototype.scrollIntoView as any).mock.calls;
    expect(calls[calls.length - 1][0].behavior).toBe('auto');
  });
});
