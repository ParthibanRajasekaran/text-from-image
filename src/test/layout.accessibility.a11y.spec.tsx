import React from 'react';
import { customRender } from './utils';
import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import App from '../../App';

describe('Layout accessibility', () => {
  it('has exactly one main landmark', async () => {
    const { container } = customRender(<App />);
    expect(screen.getAllByRole('main')).toHaveLength(1);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('skip link moves focus to main', async () => {
    const { container } = customRender(<App />);
    const skipLink = screen.getByText(/skip to main content/i);
    skipLink.focus();
    skipLink.click();
    const main = screen.getByRole('main');
    expect(document.activeElement).toBe(main);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
