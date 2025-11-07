import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { AdSlotLazy } from '../../components/AdSlotLazy';

// Mock IntersectionObserver
class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  elements: Element[] = [];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe(element: Element) {
    this.elements.push(element);
  }

  disconnect() {
    this.elements = [];
  }

  trigger(isIntersecting: boolean) {
    this.callback(
      this.elements.map((element) => ({
        isIntersecting,
        target: element,
        boundingClientRect: element.getBoundingClientRect(),
        intersectionRatio: isIntersecting ? 1 : 0,
        intersectionRect: element.getBoundingClientRect(),
        rootBounds: null,
        time: Date.now(),
      })),
      this as any
    );
  }
}

describe('AdSlotLazy', () => {
  let mockObserver: MockIntersectionObserver;

  beforeEach(() => {
    mockObserver = new MockIntersectionObserver(() => {});
    global.IntersectionObserver = jest.fn((callback) => {
      mockObserver = new MockIntersectionObserver(callback);
      return mockObserver as any;
    });
  });

  it('should reserve minimum height to prevent CLS', () => {
    const { container } = render(<AdSlotLazy slot="top" />);
    const adSlot = container.querySelector('.ad-slot');
    
    expect(adSlot).toHaveStyle({ minHeight: '300px' });
  });

  it('should have ARIA label for accessibility', () => {
    const { container } = render(<AdSlotLazy slot="mid" />);
    const adSlot = container.querySelector('[aria-label="advertisement"]');
    
    expect(adSlot).toBeInTheDocument();
  });

  it('should lazy-load ad content when visible', async () => {
    const { container } = render(<AdSlotLazy slot="bottom" dataAdTest={true} />);
    
    // Initially, ad content should not be visible
    expect(container.querySelector('.ad-content')).not.toBeInTheDocument();
    
    // Trigger intersection
    mockObserver.trigger(true);
    
    // After intersection, ad content should be visible
    await waitFor(() => {
      expect(container.querySelector('.ad-content')).toBeInTheDocument();
    });
  });

  it('should display test content in test mode', async () => {
    const { container, getByText } = render(<AdSlotLazy slot="sidebar" dataAdTest={true} />);
    
    // Trigger intersection
    mockObserver.trigger(true);
    
    await waitFor(() => {
      expect(getByText(/Ad Slot: SIDEBAR/i)).toBeInTheDocument();
    });
  });
});
