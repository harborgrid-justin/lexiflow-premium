/**
 * @jest-environment jsdom
 * @module CompliancePage.test
 * @description Enterprise-grade tests for CompliancePage component
 *
 * Test coverage:
 * - Page rendering
 * - ComplianceDashboard integration
 * - initialTab prop handling
 * - PageContainerLayout wrapper
 * - React.memo optimization
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompliancePage } from './CompliancePage';

// ============================================================================
// MOCKS
// ============================================================================

type ComplianceView = 'overview' | 'conflicts' | 'walls' | 'policies';

jest.mock('@/features/operations/compliance/ComplianceDashboard', () => ({
  ComplianceDashboard: ({ initialTab }: { initialTab?: ComplianceView }) => (
    <div data-testid="compliance-dashboard">
      <h1>Compliance Monitoring</h1>
      {initialTab && <p data-testid="initial-tab">Tab: {initialTab}</p>}
      <nav data-testid="compliance-nav">
        <button data-testid="tab-overview">Overview</button>
        <button data-testid="tab-conflicts">Conflict Checks</button>
        <button data-testid="tab-walls">Ethical Walls</button>
        <button data-testid="tab-policies">Policies</button>
      </nav>
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

describe('CompliancePage', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<CompliancePage />);

      expect(screen.getByTestId('page-container-layout')).toBeInTheDocument();
    });

    it('renders ComplianceDashboard component', () => {
      render(<CompliancePage />);

      expect(screen.getByTestId('compliance-dashboard')).toBeInTheDocument();
    });

    it('wraps content in PageContainerLayout', () => {
      render(<CompliancePage />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout).toContainElement(screen.getByTestId('compliance-dashboard'));
    });

    it('displays compliance monitoring heading', () => {
      render(<CompliancePage />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Compliance Monitoring');
    });

    it('renders compliance navigation', () => {
      render(<CompliancePage />);

      expect(screen.getByTestId('compliance-nav')).toBeInTheDocument();
    });
  });

  describe('initialTab Prop', () => {
    it('passes initialTab to ComplianceDashboard', () => {
      render(<CompliancePage initialTab="conflicts" />);

      expect(screen.getByTestId('initial-tab')).toHaveTextContent('Tab: conflicts');
    });

    it('does not display tab when initialTab not provided', () => {
      render(<CompliancePage />);

      expect(screen.queryByTestId('initial-tab')).not.toBeInTheDocument();
    });

    it('handles all valid tab values', () => {
      const tabs: ComplianceView[] = ['overview', 'conflicts', 'walls', 'policies'];

      tabs.forEach(tab => {
        const { unmount } = render(<CompliancePage initialTab={tab} />);
        expect(screen.getByTestId('initial-tab')).toHaveTextContent(`Tab: ${tab}`);
        unmount();
      });
    });
  });

  describe('ComplianceDashboard Integration', () => {
    it('renders all compliance tabs', () => {
      render(<CompliancePage />);

      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Conflict Checks')).toBeInTheDocument();
      expect(screen.getByText('Ethical Walls')).toBeInTheDocument();
      expect(screen.getByText('Policies')).toBeInTheDocument();
    });

    it('renders correct number of tab buttons', () => {
      render(<CompliancePage />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4);
    });
  });

  describe('React.memo Optimization', () => {
    it('is memoized for performance', () => {
      expect(CompliancePage).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });

    it('re-renders correctly when initialTab changes', () => {
      const { rerender } = render(<CompliancePage initialTab="overview" />);

      expect(screen.getByTestId('initial-tab')).toHaveTextContent('Tab: overview');

      rerender(<CompliancePage initialTab="conflicts" />);

      expect(screen.getByTestId('initial-tab')).toHaveTextContent('Tab: conflicts');
    });
  });

  describe('Layout Structure', () => {
    it('maintains correct component hierarchy', () => {
      const { container } = render(<CompliancePage />);

      expect(container.firstChild).toHaveAttribute('data-testid', 'page-container-layout');
    });

    it('renders single child in layout', () => {
      render(<CompliancePage />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout.children).toHaveLength(1);
    });
  });

  describe('Accessibility', () => {
    it('renders heading element', () => {
      render(<CompliancePage />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('renders navigation element', () => {
      render(<CompliancePage />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('all tab buttons are accessible', () => {
      render(<CompliancePage />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4);
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined initialTab', () => {
      render(<CompliancePage initialTab={undefined} />);

      expect(screen.getByTestId('compliance-dashboard')).toBeInTheDocument();
      expect(screen.queryByTestId('initial-tab')).not.toBeInTheDocument();
    });
  });
});
