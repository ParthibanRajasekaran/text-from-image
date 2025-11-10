import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import App from '../../App';

describe('a11y.spec - lightweight accessibility checks', () => {
  it('has exactly one <main> landmark', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    const mains = document.querySelectorAll('main');
    expect(mains).toHaveLength(1);
  });

  it('skip-link focuses main content', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    const skipLink = screen.getByText(/skip to main content/i);
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');

    const mainContent = document.getElementById('main-content');
    expect(mainContent).toBeInTheDocument();
    expect(mainContent?.tagName.toLowerCase()).toBe('main');
  });

  it('uploader input is accessible via label', () => {
    const { container } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // File input should be present and accessible
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();
    
    if (fileInput) {
      expect(fileInput.tagName.toLowerCase()).toBe('input');
      expect(fileInput.getAttribute('type')).toBe('file');
      
      // Verify the input is accessible via either:
      // 1. aria-label attribute on the input itself, or
      // 2. label element with matching "for" attribute
      const ariaLabel = fileInput.getAttribute('aria-label');
      const inputId = fileInput.id;
      const allLabels = container.querySelectorAll('label');
      const hasMatchingLabel = Array.from(allLabels).some(label => label.getAttribute('for') === inputId);
      
      const isAccessible = ariaLabel || hasMatchingLabel;
      expect(isAccessible).toBeTruthy();
    }
  });
});
