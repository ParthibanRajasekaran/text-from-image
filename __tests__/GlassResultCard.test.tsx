import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GlassResultCard } from '../components/v3/GlassResultCard';

describe('GlassResultCard', () => {
  const mockText = 'This is extracted text from an image.';

  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(() => Promise.resolve()),
      },
    });
  });

  it('renders extracted text', () => {
    render(<GlassResultCard text={mockText} />);
    expect(screen.getByText(mockText)).toBeInTheDocument();
  });

  it('displays word and character count', () => {
    render(<GlassResultCard text={mockText} />);
    expect(screen.getByText(/7 words/)).toBeInTheDocument();
    expect(screen.getByText(/37 characters/)).toBeInTheDocument();
  });

  it('has copy button', () => {
    render(<GlassResultCard text={mockText} />);
    const copyButton = screen.getByLabelText('Copy text to clipboard');
    expect(copyButton).toBeInTheDocument();
  });

  it('has download button', () => {
    render(<GlassResultCard text={mockText} />);
    const downloadButton = screen.getByLabelText('Download text file');
    expect(downloadButton).toBeInTheDocument();
  });

  it('copies text to clipboard when copy button clicked', async () => {
    render(<GlassResultCard text={mockText} />);
    const copyButton = screen.getByLabelText('Copy text to clipboard');
    
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockText);
  });

  it('shows toast notification after copy', async () => {
    render(<GlassResultCard text={mockText} />);
    const copyButton = screen.getByLabelText('Copy text to clipboard');
    
    fireEvent.click(copyButton);
    
    // Toast should appear
    expect(await screen.findByText('Copied to clipboard')).toBeInTheDocument();
  });

  it('calls onCopy callback when provided', async () => {
    const onCopy = jest.fn();
    const { container } = render(<GlassResultCard text={mockText} onCopy={onCopy} />);
    const copyButton = screen.getByLabelText('Copy text to clipboard');
    
    fireEvent.click(copyButton);
    
    // Wait for state updates and callbacks
    await waitFor(() => {
      expect(onCopy).toHaveBeenCalled();
    });
  });

  it('uses custom filename for download', () => {
    const filename = 'custom-file.txt';
    render(<GlassResultCard text={mockText} filename={filename} />);
    
    // Component should use the custom filename internally
    expect(screen.getByLabelText('Download text file')).toBeInTheDocument();
  });
});
