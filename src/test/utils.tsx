import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

// If you use Providers (Theme, Router, etc.), wrap here
export function customRender(ui: React.ReactElement, options?: RenderOptions) {
  return render(ui, { ...options });
}

export function createMockFile(type: string = 'image/jpeg', name: string = 'photo.jpg') {
  return new File([new Uint8Array([1,2,3])], name, { type });
}
