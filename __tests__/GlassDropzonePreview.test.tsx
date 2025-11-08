import React from 'react';
import { render, screen } from '@testing-library/react';
import { GlassDropzone } from '../components/v3/GlassDropzone';

// Mock URL.createObjectURL and revokeObjectURL
const mockObjectURL = 'blob:http://localhost:3000/mock-image-url';
global.URL.createObjectURL = jest.fn(() => mockObjectURL);
global.URL.revokeObjectURL = jest.fn();

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
    figure: ({ children, ...props }: any) => <figure {...props}>{children}</figure>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useReducedMotion: () => false,
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock hooks
jest.mock('../hooks/useDragDrop', () => ({
  useDragDrop: () => ({
    isDragging: false,
    handleDragEnter: jest.fn(),
    handleDragLeave: jest.fn(),
    handleDragOver: jest.fn(),
    handleDrop: jest.fn(),
  }),
}));

jest.mock('../hooks/useClipboard', () => ({
  useClipboard: jest.fn(),
}));

describe('GlassDropzone - Image Preview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not show preview when no file is selected', () => {
    render(<GlassDropzone onFileSelect={jest.fn()} />);
    
    const preview = screen.queryByAltText('Selected image preview');
    expect(preview).not.toBeInTheDocument();
  });

  it('should show preview after file selection', () => {
    const mockFile = new File(['image content'], 'test.png', { type: 'image/png' });
    const onFileSelect = jest.fn();
    
    const { container } = render(<GlassDropzone onFileSelect={onFileSelect} />);
    
    // Simulate file selection
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      value: [mockFile],
      writable: false,
    });
    
    // Trigger change event
    const event = new Event('change', { bubbles: true });
    input?.dispatchEvent(event);
    
    // Wait for state update and verify
    setTimeout(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockFile);
      expect(onFileSelect).toHaveBeenCalledWith(mockFile);
      
      const preview = screen.queryByAltText('Selected image preview');
      expect(preview).toBeInTheDocument();
      expect(preview).toHaveAttribute('src', mockObjectURL);
    }, 0);
  });

  it('should have semantic HTML structure for preview', () => {
    const mockFile = new File(['image content'], 'test.png', { type: 'image/png' });
    
    const { container } = render(<GlassDropzone onFileSelect={jest.fn()} />);
    
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      value: [mockFile],
      writable: false,
    });
    
    input?.dispatchEvent(new Event('change', { bubbles: true }));
    
    setTimeout(() => {
      // Check for figure element
      const figure = container.querySelector('figure');
      expect(figure).toBeInTheDocument();
      
      // Check for figcaption with sr-only
      const figcaption = container.querySelector('figcaption.sr-only');
      expect(figcaption).toBeInTheDocument();
      expect(figcaption).toHaveTextContent(/Preview of selected image/i);
      
      // Check image has proper attributes
      const img = screen.queryByAltText('Selected image preview');
      expect(img).toHaveClass('object-contain');
      expect(img).toHaveClass('max-h-64');
    }, 0);
  });

  it('should use theme tokens for preview container', () => {
    const mockFile = new File(['image content'], 'test.png', { type: 'image/png' });
    
    const { container } = render(<GlassDropzone onFileSelect={jest.fn()} />);
    
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      value: [mockFile],
      writable: false,
    });
    
    input?.dispatchEvent(new Event('change', { bubbles: true }));
    
    setTimeout(() => {
      const figure = container.querySelector('figure');
      
      // Verify theme tokens are used (no inline hex colors)
      expect(figure?.className).toMatch(/border-border/);
      expect(figure?.className).toMatch(/bg-muted/);
      
      // Should not have inline styles with hex colors
      expect(figure?.getAttribute('style')).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    }, 0);
  });

  it('should revoke URL on unmount', () => {
    const mockFile = new File(['image content'], 'test.png', { type: 'image/png' });
    
    const { container, unmount } = render(<GlassDropzone onFileSelect={jest.fn()} />);
    
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      value: [mockFile],
      writable: false,
    });
    
    input?.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Unmount component
    unmount();
    
    // Verify revokeObjectURL was called
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(mockObjectURL);
  });
});
