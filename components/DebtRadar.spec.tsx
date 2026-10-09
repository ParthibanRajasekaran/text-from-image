import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DebtRadar, radarPolygon, radarPoint } from './DebtRadar';
import { QUESTIONS } from '../src/core/debt/model';

const G = { size: 360, cx: 180, cy: 180, radius: 100 };

describe('radar geometry', () => {
  it('puts axis 0 straight up', () => {
    const [x, y] = radarPoint(G, 0, 9, 1);
    expect(x).toBeCloseTo(180);
    expect(y).toBeCloseTo(80);
  });
  it('collapses unanswered axes to the centre', () => {
    const pts = radarPolygon([], G).split(' ');
    expect(pts).toHaveLength(QUESTIONS.length);
    expect(new Set(pts)).toEqual(new Set(['180.0,180.0']));
  });
});

describe('<DebtRadar />', () => {
  it('describes progress to assistive tech', () => {
    render(<DebtRadar answers={[0, 1]} />);
    expect(screen.getByRole('img').getAttribute('aria-label')).toMatch(/2 of 9 answered/);
  });
  it('grows when more is answered', () => {
    const a = render(<DebtRadar answers={[]} />).getByTestId('debt-radar-shape').getAttribute('points');
    const b = render(<DebtRadar answers={[2, 3]} />).getAllByTestId('debt-radar-shape')[1].getAttribute('points');
    expect(a).not.toEqual(b);
  });
});
