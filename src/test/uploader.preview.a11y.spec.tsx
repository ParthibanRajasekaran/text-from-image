import React from 'react';
import { customRender, createMockFile } from './utils';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { GlassDropzone } from '../../components/v3/GlassDropzone';

describe('Uploader accessibility and preview', () => {
  it('has correct accessible name', () => {
    customRender(<GlassDropzone onFileSelect={vi.fn()} />);
    const label = screen.getByLabelText('Drop image or click to upload');
    expect(label).toBeInTheDocument();
  });

  it('shows preview on file select and revokes URL', async () => {
    const onFileSelect = vi.fn();
    customRender(<GlassDropzone onFileSelect={onFileSelect} />);
    const input = screen.getByLabelText('Drop image or click to upload') as HTMLInputElement;
    const file = createMockFile();
    Object.defineProperty(input, 'files', { value: [file], writable: false });
    fireEvent.change(input);
    expect(onFileSelect).toHaveBeenCalledWith(file);
    const preview = screen.getByAltText('Selected image preview');
    expect(preview).toBeInTheDocument();
    expect(window.URL.createObjectURL).toHaveBeenCalledWith(file);
    // Simulate selecting a second file
    const file2 = createMockFile('image/png', 'photo2.png');
    Object.defineProperty(input, 'files', { value: [file2], writable: false });
    fireEvent.change(input);
    expect(window.URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('axe: no major violations', async () => {
    const { container } = customRender(<GlassDropzone onFileSelect={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
