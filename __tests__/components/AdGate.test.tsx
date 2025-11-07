import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdGate } from '../../components/AdGate';

describe('AdGate', () => {
  it('should render children on content route with sufficient content', () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <AdGate content={{ wordCount: 300, hasResult: false, hasExplainers: false }}>
                <div>Ad Content</div>
              </AdGate>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText('Ad Content')).toBeInTheDocument();
  });

  it('should not render children on utility route', () => {
    const { queryByText } = render(
      <MemoryRouter initialEntries={['/404']}>
        <Routes>
          <Route
            path="/404"
            element={
              <AdGate content={{ wordCount: 500, hasResult: true, hasExplainers: true }}>
                <div>Ad Content</div>
              </AdGate>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(queryByText('Ad Content')).not.toBeInTheDocument();
  });

  it('should not render children without sufficient content', () => {
    const { queryByText } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <AdGate content={{ wordCount: 50, hasResult: false, hasExplainers: false }}>
                <div>Ad Content</div>
              </AdGate>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(queryByText('Ad Content')).not.toBeInTheDocument();
  });

  it('should use pathname override when provided', () => {
    const { queryByText } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <AdGate
                pathname="/404"
                content={{ wordCount: 500, hasResult: true, hasExplainers: true }}
              >
                <div>Ad Content</div>
              </AdGate>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    // Should not render because pathname override is /404 (utility route)
    expect(queryByText('Ad Content')).not.toBeInTheDocument();
  });
});
