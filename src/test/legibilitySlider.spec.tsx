import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LegibilitySlider, contrastRatio } from '../../components/home/LegibilitySlider';

describe('LegibilitySlider', () => {
  it('computes WCAG contrast: black on the surface is high, equal colours are 1:1', () => {
    expect(contrastRatio(0)).toBeGreaterThan(15);
    expect(contrastRatio(248)).toBeCloseTo(1, 1);
  });

  it('flips from PASS to FAIL as the text colour approaches the background', () => {
    render(<LegibilitySlider />);
    expect(screen.getByRole('status').textContent).toMatch(/^PASS/);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '90' } });
    expect(screen.getByRole('status').textContent).toMatch(/^FAIL/);
  });
});
