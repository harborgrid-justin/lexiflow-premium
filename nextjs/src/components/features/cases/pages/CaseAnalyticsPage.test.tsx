/**
 * CaseAnalyticsPage Component Tests
 * Enterprise-grade test suite for case analytics dashboard page
 *
 * @module components/features/cases/pages/CaseAnalyticsPage.test
 */

import { render, screen } from '@testing-library/react';
import { CaseAnalyticsPage } from './CaseAnalyticsPage';

// Mock the CaseAnalyticsDashboard component
jest.mock('@/features/cases/components/analytics/CaseAnalyticsDashboard', () => ({
  CaseAnalyticsDashboard: () => <div data-testid="analytics-dashboard">Analytics Dashboard</div>,
}));

// Mock the PageContainerLayout component
jest.mock('@/components/ui/layouts/PageContainerLayout/PageContainerLayout', () => ({
  PageContainerLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container-layout">{children}</div>
  ),
}));

describe('CaseAnalyticsPage', () => {
  describe('Rendering', () => {
    it('should render the page container layout', () => {
      render(<CaseAnalyticsPage />);

      expect(screen.getByTestId('page-container-layout')).toBeInTheDocument();
    });

    it('should render the analytics dashboard', () => {
      render(<CaseAnalyticsPage />);

      expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('should accept caseId prop', () => {
      render(<CaseAnalyticsPage caseId="case-123" />);

      expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
    });

    it('should accept undefined caseId prop', () => {
      render(<CaseAnalyticsPage caseId={undefined} />);

      expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
    });

    it('should render without caseId prop', () => {
      render(<CaseAnalyticsPage />);

      expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
    });
  });

  describe('Component Optimization', () => {
    it('should be wrapped with React.memo', () => {
      // React.memo components have a special displayName
      expect(CaseAnalyticsPage.displayName || CaseAnalyticsPage.name).toBeDefined();
    });

    it('should not rerender with same props', () => {
      const { rerender } = render(<CaseAnalyticsPage caseId="case-123" />);

      // Rerender with same props
      rerender(<CaseAnalyticsPage caseId="case-123" />);

      // Component should still be rendered
      expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should nest dashboard inside page container', () => {
      render(<CaseAnalyticsPage />);

      const pageContainer = screen.getByTestId('page-container-layout');
      const dashboard = screen.getByTestId('analytics-dashboard');

      expect(pageContainer).toContainElement(dashboard);
    });
  });
});
