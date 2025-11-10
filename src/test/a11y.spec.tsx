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
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // Use Testing Library's accessible name mechanism
    // The Dropzone input has aria-label="File upload input"
    const fileInput = screen.getByLabelText('File upload input');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput.tagName.toLowerCase()).toBe('input');
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveAccessibleName('File upload input');
  });
});
