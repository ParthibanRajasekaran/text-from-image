import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ChallengePlayer } from './ChallengePlayer';
import { CHALLENGES } from '../src/core/challenge/challenges';

const swiss = CHALLENGES.find((c) => c.id === 'swiss-receipt-de')!;
const rtl = CHALLENGES.find((c) => c.id === 'rtl-truncation')!;

beforeEach(() => window.localStorage.clear());

const pick = (k: string) => fireEvent.click(screen.getByTestId(`challenge-pick-${k}`));
const answer = (t: string) => fireEvent.change(screen.getByTestId('challenge-answer'), { target: { value: t } });
const check = () => fireEvent.click(screen.getByTestId('challenge-check'));

describe('ChallengePlayer', () => {
  it('describes the image without giving the bugs away', () => {
    render(<ChallengePlayer challenge={swiss} />);
    expect(screen.getByRole('img').getAttribute('alt')).toContain('06/15/2026');
    expect(screen.queryByText(/wrong order/i, { selector: 'p' })).toBeNull();
  });

  it('grades a full answer at 100 and keeps the best score', () => {
    const { unmount } = render(<ChallengePlayer challenge={swiss} />);
    pick('date-order');
    pick('currency-mix');
    pick('math');
    answer('Datum: 15.06.2026 19:45\nMwSt 7.7% CHF 6.31');
    check();
    expect(screen.getByTestId('challenge-score').textContent).toBe('100');
    expect(screen.getByTestId('challenge-result-math').textContent).toContain('RenderCheck catches it with');
    unmount();
    // Back another day: the best score is remembered.
    render(<ChallengePlayer challenge={swiss} />);
    expect(JSON.parse(window.localStorage.getItem('rendercheck-challenge-best-v1')!)[swiss.id]).toBe(100);
  });

  it('names a missed bug and shows what the text should read', () => {
    render(<ChallengePlayer challenge={swiss} />);
    pick('date-order');
    answer('15.06.2026');
    check();
    const missed = screen.getByTestId('challenge-result-currency-mix');
    expect(missed.textContent).toContain('Missed');
    expect(missed.textContent).toContain('CHF 6.81');
    expect(screen.getByTestId('challenge-score').textContent).toBe('33');
  });

  it('flags a wrong guess and a rewrite that keeps the bug', () => {
    render(<ChallengePlayer challenge={CHALLENGES[0]} />);
    pick('currency-symbol');
    pick('contrast');
    answer('Total €1,234.56');
    check();
    expect(screen.getByText(/Not a bug here/).textContent).toContain('hard to read');
    expect(screen.getByTestId('challenge-diff')).toBeTruthy();
  });

  it('a challenge with nothing to rewrite has no text box', () => {
    render(<ChallengePlayer challenge={rtl} />);
    expect(screen.queryByTestId('challenge-answer')).toBeNull();
    pick('truncation');
    check();
    expect(screen.getByTestId('challenge-score').textContent).toBe('100');
  });

  it('Try again starts over', () => {
    render(<ChallengePlayer challenge={swiss} />);
    check();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByTestId('challenge-check')).toBeTruthy();
    expect((screen.getByTestId('challenge-pick-math') as HTMLInputElement).checked).toBe(false);
  });
});
