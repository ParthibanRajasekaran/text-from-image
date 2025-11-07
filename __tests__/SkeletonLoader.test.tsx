import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { SkeletonLoader, TextSkeleton, CardSkeleton } from '../components/SkeletonLoader';

expect.extend(toHaveNoViolations);

describe('SkeletonLoader', () => {
  it('renders default variant (backwards compatible)', () => {
    render(<SkeletonLoader />);
    const skeletons = screen.getAllByRole('status', { hidden: true });
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders text variant', () => {
    render(<SkeletonLoader variant="text" />);
    expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
  });

  it('renders circular variant', () => {
    render(<SkeletonLoader variant="circular" width={40} height={40} />);
    const skeleton = screen.getByLabelText('Loading...');
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('renders rectangular variant', () => {
    render(<SkeletonLoader variant="rectangular" />);
    const skeleton = screen.getByLabelText('Loading...');
    expect(skeleton).toHaveClass('rounded');
  });

  it('applies custom width and height', () => {
    render(<SkeletonLoader variant="rectangular" width={200} height={100} />);
    const skeleton = screen.getByLabelText('Loading...');
    expect(skeleton).toHaveStyle({ width: '200px', height: '100px' });
  });

  it('disables animation when animate is false', () => {
    render(<SkeletonLoader variant="text" animate={false} />);
    const skeleton = screen.getByLabelText('Loading...');
    expect(skeleton).not.toHaveClass('animate-pulse');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<SkeletonLoader variant="text" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('TextSkeleton', () => {
  it('renders specified number of lines', () => {
    render(<TextSkeleton lines={5} />);
    const skeletons = screen.getAllByLabelText('Loading...');
    expect(skeletons).toHaveLength(5);
  });

  it('applies last line width', () => {
    render(<TextSkeleton lines={2} lastLineWidth="60%" />);
    const skeletons = screen.getAllByLabelText('Loading...');
    expect(skeletons[1]).toHaveStyle({ width: '60%' });
  });
});

describe('CardSkeleton', () => {
  it('renders card structure with circular and text skeletons', () => {
    render(<CardSkeleton />);
    const skeletons = screen.getAllByLabelText('Loading...');
    expect(skeletons.length).toBeGreaterThan(3);
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<CardSkeleton />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
