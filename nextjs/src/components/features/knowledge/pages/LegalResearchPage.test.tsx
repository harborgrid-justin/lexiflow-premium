/**
 * @jest-environment jsdom
 * @module LegalResearchPage.test
 * @description Enterprise-grade tests for LegalResearchPage component
 *
 * Test coverage:
 * - Page rendering
 * - ResearchTool integration
 * - PageContainerLayout with custom className
 * - React.memo optimization
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { LegalResearchPage } from './LegalResearchPage';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/features/knowledge/research/ResearchTool', () => ({
  ResearchTool: () => (
    <div data-testid="research-tool">
      <h1>Legal Research</h1>
      <div data-testid="search-section">
        <input type="text" placeholder="Search case law..." data-testid="research-search" />
      </div>
      <div data-testid="results-section">
        <p>AI-Powered Research Results</p>
      </div>
    </div>
  ),
}));

jest.mock('@/components/ui/layouts/PageContainerLayout/PageContainerLayout', () => ({
  PageContainerLayout: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="page-container-layout" className={className}>
      {children}
    </div>
  ),
}));

// ============================================================================
// TEST SUITES
// ============================================================================

describe('LegalResearchPage', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<LegalResearchPage />);

      expect(screen.getByTestId('page-container-layout')).toBeInTheDocument();
    });

    it('renders ResearchTool component', () => {
      render(<LegalResearchPage />);

      expect(screen.getByTestId('research-tool')).toBeInTheDocument();
    });

    it('wraps content in PageContainerLayout', () => {
      render(<LegalResearchPage />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout).toContainElement(screen.getByTestId('research-tool'));
    });

    it('displays legal research heading', () => {
      render(<LegalResearchPage />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Legal Research');
    });

    it('applies custom className to layout', () => {
      render(<LegalResearchPage />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout).toHaveClass('h-full');
      expect(layout).toHaveClass('p-0');
    });
  });

  describe('ResearchTool Integration', () => {
    it('renders search section', () => {
      render(<LegalResearchPage />);

      expect(screen.getByTestId('search-section')).toBeInTheDocument();
    });

    it('renders search input', () => {
      render(<LegalResearchPage />);

      expect(screen.getByTestId('research-search')).toBeInTheDocument();
    });

    it('renders results section', () => {
      render(<LegalResearchPage />);

      expect(screen.getByTestId('results-section')).toBeInTheDocument();
    });

    it('displays AI-powered research description', () => {
      render(<LegalResearchPage />);

      expect(screen.getByText('AI-Powered Research Results')).toBeInTheDocument();
    });
  });

  describe('React.memo Optimization', () => {
    it('is memoized for performance', () => {
      expect(LegalResearchPage).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });

    it('re-renders correctly on multiple renders', () => {
      const { rerender } = render(<LegalResearchPage />);

      rerender(<LegalResearchPage />);

      expect(screen.getByTestId('research-tool')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('maintains correct component hierarchy', () => {
      const { container } = render(<LegalResearchPage />);

      expect(container.firstChild).toHaveAttribute('data-testid', 'page-container-layout');
    });

    it('renders single child in layout', () => {
      render(<LegalResearchPage />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout.children).toHaveLength(1);
    });

    it('layout has full height class', () => {
      render(<LegalResearchPage />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout.className).toContain('h-full');
    });

    it('layout has no padding class', () => {
      render(<LegalResearchPage />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout.className).toContain('p-0');
    });
  });

  describe('Accessibility', () => {
    it('renders heading element', () => {
      render(<LegalResearchPage />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('renders text input for search', () => {
      render(<LegalResearchPage />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('search input has placeholder', () => {
      render(<LegalResearchPage />);

      expect(screen.getByPlaceholderText('Search case law...')).toBeInTheDocument();
    });
  });
});
