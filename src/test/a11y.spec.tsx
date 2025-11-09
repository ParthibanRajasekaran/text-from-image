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

  it('uploader has accessible name matching visible label', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // Find file input by its aria-label
    const fileInput = document.querySelector('input[type="file"][aria-label="File upload input"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput?.tagName.toLowerCase()).toBe('input');
    
    // Verify accessible name exists
    const ariaLabel = fileInput?.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toBe('File upload input');
    
    // Verify the visible button text exists
    const uploadButton = screen.getByRole('button', { name: /upload image/i });
    expect(uploadButton).toBeInTheDocument();
  });
});
