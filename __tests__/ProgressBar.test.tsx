import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ProgressBar } from '../components/ProgressBar';

expect.extend(toHaveNoViolations);

describe('ProgressBar', () => {
  it('renders without crashing', () => {
    render(<ProgressBar />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('renders simple mode when no props provided (backwards compatible)', () => {
    render(<ProgressBar />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-label', 'Loading');
  });

  it('renders staged mode with upload stage', () => {
    render(<ProgressBar stage="upload" percent={25} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '25');
    expect(screen.getByText('Upload')).toBeInTheDocument();
  });

  it('renders staged mode with OCR stage', () => {
    render(<ProgressBar stage="ocr" percent={50} />);
    expect(screen.getByText('OCR')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders complete stage with 100%', () => {
    render(<ProgressBar stage="complete" percent={100} />);
    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders error stage', () => {
    render(<ProgressBar stage="error" percent={0} message="Something went wrong" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should have no accessibility violations in simple mode', async () => {
    const { container } = render(<ProgressBar />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in staged mode', async () => {
    const { container } = render(<ProgressBar stage="ocr" percent={50} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('updates aria-valuenow when percent changes', () => {
    const { rerender } = render(<ProgressBar stage="upload" percent={10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '10');

    rerender(<ProgressBar stage="upload" percent={50} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
  });
});
