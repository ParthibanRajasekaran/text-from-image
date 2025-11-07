import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ResultToolbar } from '../components/ResultToolbar';

expect.extend(toHaveNoViolations);

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

describe('ResultToolbar', () => {
  const mockText = 'Sample extracted text';
  const mockOnCopy = jest.fn();
  const mockOnDownload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ResultToolbar text={mockText} />);
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });

  it('displays character count', () => {
    render(<ResultToolbar text={mockText} />);
    expect(screen.getByText(/22 characters/)).toBeInTheDocument();
  });

  it('copies text to clipboard when copy button is clicked', async () => {
    render(<ResultToolbar text={mockText} onCopy={mockOnCopy} />);
    
    const copyButton = screen.getByRole('button', { name: /copy/i });
    await userEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockText);
      expect(mockOnCopy).toHaveBeenCalled();
    });
  });

  it('shows toast notification after copying', async () => {
    render(<ResultToolbar text={mockText} />);
    
    const copyButton = screen.getByRole('button', { name: /copy/i });
    await userEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('downloads text when download button is clicked', async () => {
    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();

    render(<ResultToolbar text={mockText} onDownload={mockOnDownload} />);
    
    const downloadButton = screen.getByRole('button', { name: /download/i });
    await userEvent.click(downloadButton);

    await waitFor(() => {
      expect(mockOnDownload).toHaveBeenCalled();
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  it('shows keyboard shortcuts in buttons', () => {
    render(<ResultToolbar text={mockText} />);
    
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<ResultToolbar text={mockText} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('shows tooltips on hover', async () => {
    render(<ResultToolbar text={mockText} />);
    
    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.mouseEnter(copyButton);

    await waitFor(() => {
      expect(screen.getByText(/Copy to clipboard/)).toBeInTheDocument();
    });
  });
});
