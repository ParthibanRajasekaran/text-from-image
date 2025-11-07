import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Dropzone } from '../components/Dropzone';

expect.extend(toHaveNoViolations);

describe('Dropzone', () => {
  const mockOnFiles = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Dropzone onFiles={mockOnFiles} />);
    expect(screen.getByRole('button', { name: /upload image/i })).toBeInTheDocument();
  });

  it('handles file input change', async () => {
    render(<Dropzone onFiles={mockOnFiles} maxFiles={2} />);
    
    const file1 = new File(['test1'], 'test1.png', { type: 'image/png' });
    const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });
    
    
    
    // Find the hidden file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(fileInput, 'files', {
      value: [file1, file2],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(mockOnFiles).toHaveBeenCalledWith([file1, file2]);
    });
  });

  it('handles clipboard paste', async () => {
    render(<Dropzone onFiles={mockOnFiles} />);
    
    const file = new File(['test'], 'pasted.png', { type: 'image/png' });
    
    // Create clipboard event with image
    const clipboardData = {
      items: [
        {
          type: 'image/png',
          getAsFile: () => file,
        },
      ],
    };

    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: clipboardData as any,
      bubbles: true,
    });

    fireEvent(window, pasteEvent);

    await waitFor(() => {
      expect(mockOnFiles).toHaveBeenCalledWith([file]);
    });
  });

  it('ignores non-image paste content', () => {
    render(<Dropzone onFiles={mockOnFiles} />);
    
    const clipboardData = {
      items: [
        {
          type: 'text/plain',
          getAsFile: () => null,
        },
      ],
    };

    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: clipboardData as any,
      bubbles: true,
    });

    fireEvent(window, pasteEvent);

    expect(mockOnFiles).not.toHaveBeenCalled();
  });

  it('respects maxFiles limit', async () => {
    render(<Dropzone onFiles={mockOnFiles} maxFiles={2} />);
    
    const files = [
      new File(['1'], '1.png', { type: 'image/png' }),
      new File(['2'], '2.png', { type: 'image/png' }),
      new File(['3'], '3.png', { type: 'image/png' }),
    ];

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(fileInput, 'files', {
      value: files,
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(mockOnFiles).toHaveBeenCalledWith([files[0], files[1]]);
      expect(mockOnFiles).toHaveBeenCalledTimes(1);
    });
  });

  it('displays file badges when files are selected', async () => {
    render(<Dropzone onFiles={mockOnFiles} maxFiles={2} />);
    
    const file = new File(['test'], 'test-image.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('test-image.png')).toBeInTheDocument();
    });
  });

  it('removes file badge when remove button is clicked', async () => {
    render(<Dropzone onFiles={mockOnFiles} maxFiles={2} />);
    
    const file = new File(['test'], 'test-image.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('test-image.png')).toBeInTheDocument();
    });

    const removeButton = screen.getByLabelText(/remove test-image.png/i);
    await userEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('test-image.png')).not.toBeInTheDocument();
      expect(mockOnFiles).toHaveBeenCalledWith([]);
    });
  });

  it('does not trigger when disabled', () => {
    render(<Dropzone onFiles={mockOnFiles} disabled />);
    
    const uploadButton = screen.getByRole('button', { name: /upload image/i });
    expect(uploadButton).toBeDisabled();
    
    // Should not be clickable
    fireEvent.click(uploadButton);
    expect(mockOnFiles).not.toHaveBeenCalled();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<Dropzone onFiles={mockOnFiles} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('shows upload button', () => {
    render(<Dropzone onFiles={mockOnFiles} />);
    const uploadButton = screen.getByRole('button', { name: /upload image/i });
    expect(uploadButton).toBeInTheDocument();
  });
});
