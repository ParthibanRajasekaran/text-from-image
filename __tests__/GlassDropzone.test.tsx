import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GlassDropzone } from '../components/v3/GlassDropzone';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useReducedMotion: () => false,
}));

describe('GlassDropzone', () => {
  it('should call onError when non-image file is provided', () => {
    const mockOnFileSelect = jest.fn();
    const mockOnError = jest.fn();

    render(
      <GlassDropzone
        onFileSelect={mockOnFileSelect}
        onError={mockOnError}
      />
    );

    // Create a non-image file (text file)
    const nonImageFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

    // Get the hidden file input
    const fileInput = screen.getByLabelText('File upload input') as HTMLInputElement;

    // Simulate file selection
    Object.defineProperty(fileInput, 'files', {
      value: [nonImageFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    // Verify onError was called and onFileSelect was not
    expect(mockOnError).toHaveBeenCalledWith(
      'Invalid file type: text/plain. Please select an image file (PNG, JPG, WEBP).'
    );
    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it('should call onFileSelect when valid image file is provided', () => {
    const mockOnFileSelect = jest.fn();
    const mockOnError = jest.fn();

    render(
      <GlassDropzone
        onFileSelect={mockOnFileSelect}
        onError={mockOnError}
      />
    );

    // Create an image file
    const imageFile = new File(['image content'], 'test.png', { type: 'image/png' });

    // Get the hidden file input
    const fileInput = screen.getByLabelText('File upload input') as HTMLInputElement;

    // Simulate file selection
    Object.defineProperty(fileInput, 'files', {
      value: [imageFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    // Verify onFileSelect was called and onError was not
    expect(mockOnFileSelect).toHaveBeenCalledWith(imageFile);
    expect(mockOnError).not.toHaveBeenCalled();
  });

  it('should work without onError callback (optional)', () => {
    const mockOnFileSelect = jest.fn();

    render(
      <GlassDropzone
        onFileSelect={mockOnFileSelect}
      />
    );

    // Create a non-image file
    const nonImageFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

    // Get the hidden file input
    const fileInput = screen.getByLabelText('File upload input') as HTMLInputElement;

    // Simulate file selection
    Object.defineProperty(fileInput, 'files', {
      value: [nonImageFile],
      writable: false,
    });

    // Should not throw when onError is not provided
    expect(() => fireEvent.change(fileInput)).not.toThrow();
    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it('should handle file with unknown type', () => {
    const mockOnFileSelect = jest.fn();
    const mockOnError = jest.fn();

    render(
      <GlassDropzone
        onFileSelect={mockOnFileSelect}
        onError={mockOnError}
      />
    );

    // Create a file with no type
    const unknownFile = new File(['content'], 'test.xyz', { type: '' });

    // Get the hidden file input
    const fileInput = screen.getByLabelText('File upload input') as HTMLInputElement;

    // Simulate file selection
    Object.defineProperty(fileInput, 'files', {
      value: [unknownFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    // Verify onError was called with 'unknown' type
    expect(mockOnError).toHaveBeenCalledWith(
      'Invalid file type: unknown. Please select an image file (PNG, JPG, WEBP).'
    );
    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });
});
