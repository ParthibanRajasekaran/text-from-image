import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import fs from 'node:fs';
import path from 'node:path';
import { ArchitectureDiagram, ARCHITECTURE_NODES } from '../../components/security/ArchitectureDiagram';

describe('ArchitectureDiagram', () => {
  it('is an accessible image with a description', () => {
    render(<ArchitectureDiagram />);
    const svg = screen.getByRole('img', { name: /RenderCheck architecture/i });
    expect(svg).toBeTruthy();
    expect(svg.querySelector('desc')?.textContent).toMatch(/Content Security Policy/);
  });

  it('only names files that exist', () => {
    const root = path.resolve(__dirname, '../..');
    for (const n of ARCHITECTURE_NODES) expect(fs.existsSync(path.join(root, n.file)), n.file).toBe(true);
  });
});
