/**
 * @jest-environment jsdom
 * @module JurisdictionPage.test
 * @description Enterprise-grade tests for JurisdictionPage component
 *
 * Test coverage:
 * - Page rendering
 * - JurisdictionManager integration
 * - PageContainerLayout wrapper
 * - React.memo optimization
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { JurisdictionPage } from './JurisdictionPage';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/features/knowledge/jurisdiction/JurisdictionManager', () => ({
  JurisdictionManager: () => (
    <div data-testid="jurisdiction-manager">
      <h1>Jurisdiction Manager</h1>
      <div data-testid="jurisdiction-content">
        <p>Court Rules and Local Procedures</p>
        <ul data-testid="jurisdiction-list">
          <li>Federal Courts</li>
          <li>State Courts</li>
          <li>Local Rules</li>
        </ul>
      </div>
    </div>
  ),
}));

jest.mock('@/components/ui/layouts/PageContainerLayout/PageContainerLayout', () => ({
  PageContainerLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container-layout">{children}</div>
  ),
}));

// ============================================================================
// TEST SUITES
// ============================================================================

describe('JurisdictionPage', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<JurisdictionPage />);

      expect(screen.getByTestId('page-container-layout')).toBeInTheDocument();
    });

    it('renders JurisdictionManager component', () => {
      render(<JurisdictionPage />);

      expect(screen.getByTestId('jurisdiction-manager')).toBeInTheDocument();
    });

    it('wraps content in PageContainerLayout', () => {
      render(<JurisdictionPage />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout).toContainElement(screen.getByTestId('jurisdiction-manager'));
    });

    it('displays jurisdiction heading', () => {
      render(<JurisdictionPage />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Jurisdiction Manager');
    });

    it('renders jurisdiction content', () => {
      render(<JurisdictionPage />);

      expect(screen.getByTestId('jurisdiction-content')).toBeInTheDocument();
    });

    it('displays court types', () => {
      render(<JurisdictionPage />);

      expect(screen.getByText('Federal Courts')).toBeInTheDocument();
      expect(screen.getByText('State Courts')).toBeInTheDocument();
      expect(screen.getByText('Local Rules')).toBeInTheDocument();
    });
  });

  describe('JurisdictionManager Integration', () => {
    it('renders jurisdiction list', () => {
      render(<JurisdictionPage />);

      expect(screen.getByTestId('jurisdiction-list')).toBeInTheDocument();
    });

    it('displays correct number of jurisdiction items', () => {
      render(<JurisdictionPage />);

      const list = screen.getByTestId('jurisdiction-list');
      expect(list.children).toHaveLength(3);
    });
  });

  describe('React.memo Optimization', () => {
    it('is memoized for performance', () => {
      expect(JurisdictionPage).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });

    it('re-renders correctly on multiple renders', () => {
      const { rerender } = render(<JurisdictionPage />);

      rerender(<JurisdictionPage />);

      expect(screen.getByTestId('jurisdiction-manager')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('maintains correct component hierarchy', () => {
      const { container } = render(<JurisdictionPage />);

      expect(container.firstChild).toHaveAttribute('data-testid', 'page-container-layout');
    });

    it('renders single child in layout', () => {
      render(<JurisdictionPage />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout.children).toHaveLength(1);
    });
  });

  describe('Accessibility', () => {
    it('renders heading element', () => {
      render(<JurisdictionPage />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('renders list element', () => {
      render(<JurisdictionPage />);

      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('renders list items', () => {
      render(<JurisdictionPage />);

      expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });
  });
});
