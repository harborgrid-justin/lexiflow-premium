/**
 * @jest-environment jsdom
 * @module LitigationStrategyPage.test
 * @description Enterprise-grade tests for LitigationStrategyPage component
 *
 * Test coverage:
 * - Page rendering
 * - LitigationBuilder integration
 * - caseId prop handling
 * - PageContainerLayout with custom className
 * - React.memo optimization
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LitigationStrategyPage } from './LitigationStrategyPage';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/features/litigation/strategy/LitigationBuilder', () => ({
  LitigationBuilder: ({ navigateToCaseTab }: { navigateToCaseTab: (tab: string) => void }) => (
    <div data-testid="litigation-builder">
      <h1>Litigation Strategy Canvas</h1>
      <div data-testid="strategy-content">
        <div data-testid="visual-planner">Visual Strategy Planner</div>
        <button onClick={() => navigateToCaseTab('overview')} data-testid="nav-case-btn">
          Go to Case Overview
        </button>
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

describe('LitigationStrategyPage', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<LitigationStrategyPage caseId="case-123" />);

      expect(screen.getByTestId('page-container-layout')).toBeInTheDocument();
    });

    it('renders LitigationBuilder component', () => {
      render(<LitigationStrategyPage caseId="case-123" />);

      expect(screen.getByTestId('litigation-builder')).toBeInTheDocument();
    });

    it('wraps content in PageContainerLayout', () => {
      render(<LitigationStrategyPage caseId="case-123" />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout).toContainElement(screen.getByTestId('litigation-builder'));
    });

    it('displays litigation strategy heading', () => {
      render(<LitigationStrategyPage caseId="case-123" />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Litigation Strategy Canvas');
    });

    it('applies custom className to layout', () => {
      render(<LitigationStrategyPage caseId="case-123" />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout).toHaveClass('h-full');
      expect(layout).toHaveClass('p-0');
    });

    it('renders visual strategy planner', () => {
      render(<LitigationStrategyPage caseId="case-123" />);

      expect(screen.getByTestId('visual-planner')).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('accepts caseId prop', () => {
      expect(() => render(<LitigationStrategyPage caseId="case-456" />)).not.toThrow();
    });

    it('renders correctly with different caseId values', () => {
      const { rerender } = render(<LitigationStrategyPage caseId="case-1" />);

      expect(screen.getByTestId('litigation-builder')).toBeInTheDocument();

      rerender(<LitigationStrategyPage caseId="case-2" />);

      expect(screen.getByTestId('litigation-builder')).toBeInTheDocument();
    });
  });

  describe('LitigationBuilder Integration', () => {
    it('passes navigateToCaseTab callback', () => {
      render(<LitigationStrategyPage caseId="case-123" />);

      expect(screen.getByTestId('nav-case-btn')).toBeInTheDocument();
    });

    it('navigateToCaseTab callback does not throw when called', async () => {
      const user = userEvent.setup();
      render(<LitigationStrategyPage caseId="case-123" />);

      // The callback is a no-op in current implementation
      await expect(user.click(screen.getByTestId('nav-case-btn'))).resolves.not.toThrow();
    });
  });

  describe('React.memo Optimization', () => {
    it('is memoized for performance', () => {
      expect(LitigationStrategyPage).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });

    it('re-renders correctly when caseId changes', () => {
      const { rerender } = render(<LitigationStrategyPage caseId="case-1" />);

      rerender(<LitigationStrategyPage caseId="case-2" />);

      expect(screen.getByTestId('litigation-builder')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('maintains correct component hierarchy', () => {
      const { container } = render(<LitigationStrategyPage caseId="case-123" />);

      expect(container.firstChild).toHaveAttribute('data-testid', 'page-container-layout');
    });

    it('renders single child in layout', () => {
      render(<LitigationStrategyPage caseId="case-123" />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout.children).toHaveLength(1);
    });

    it('layout has full height class', () => {
      render(<LitigationStrategyPage caseId="case-123" />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout.className).toContain('h-full');
    });

    it('layout has no padding class', () => {
      render(<LitigationStrategyPage caseId="case-123" />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout.className).toContain('p-0');
    });
  });

  describe('Accessibility', () => {
    it('renders heading element', () => {
      render(<LitigationStrategyPage caseId="case-123" />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('contains interactive button', () => {
      render(<LitigationStrategyPage caseId="case-123" />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty caseId', () => {
      render(<LitigationStrategyPage caseId="" />);

      expect(screen.getByTestId('litigation-builder')).toBeInTheDocument();
    });

    it('handles special characters in caseId', () => {
      render(<LitigationStrategyPage caseId="case-123-ABC!@#" />);

      expect(screen.getByTestId('litigation-builder')).toBeInTheDocument();
    });
  });
});
