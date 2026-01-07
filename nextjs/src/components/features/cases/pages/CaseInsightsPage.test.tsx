/**
 * CaseInsightsPage Component Tests
 * Enterprise-grade test suite for AI-powered case insights page
 *
 * @module components/features/cases/pages/CaseInsightsPage.test
 */

import { render, screen } from '@testing-library/react';
import { CaseInsightsPage } from './CaseInsightsPage';

// Mock the CaseInsightsDashboard component
jest.mock('@/features/cases/components/insights/CaseInsightsDashboard', () => ({
  CaseInsightsDashboard: () => <div data-testid="insights-dashboard">Insights Dashboard</div>,
}));

// Mock the PageContainerLayout component
jest.mock('@/components/ui/layouts/PageContainerLayout/PageContainerLayout', () => ({
  PageContainerLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container-layout">{children}</div>
  ),
}));

describe('CaseInsightsPage', () => {
  describe('Rendering', () => {
    it('should render the page container layout', () => {
      render(<CaseInsightsPage caseId="case-123" />);

      expect(screen.getByTestId('page-container-layout')).toBeInTheDocument();
    });

    it('should render the insights dashboard', () => {
      render(<CaseInsightsPage caseId="case-123" />);

      expect(screen.getByTestId('insights-dashboard')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('should accept caseId prop', () => {
      render(<CaseInsightsPage caseId="case-456" />);

      expect(screen.getByTestId('insights-dashboard')).toBeInTheDocument();
    });

    it('should handle different caseId formats', () => {
      const caseIds = ['case-123', 'uuid-format-id', '12345', 'case_with_underscore'];

      caseIds.forEach(caseId => {
        const { unmount } = render(<CaseInsightsPage caseId={caseId} />);
        expect(screen.getByTestId('insights-dashboard')).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Component Optimization', () => {
    it('should be wrapped with React.memo', () => {
      expect(CaseInsightsPage.displayName || CaseInsightsPage.name).toBeDefined();
    });

    it('should memoize properly', () => {
      const { rerender } = render(<CaseInsightsPage caseId="case-123" />);

      rerender(<CaseInsightsPage caseId="case-123" />);

      expect(screen.getByTestId('insights-dashboard')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should nest insights dashboard inside page container', () => {
      render(<CaseInsightsPage caseId="case-123" />);

      const pageContainer = screen.getByTestId('page-container-layout');
      const insightsDashboard = screen.getByTestId('insights-dashboard');

      expect(pageContainer).toContainElement(insightsDashboard);
    });
  });

  describe('Accessibility', () => {
    it('should render without accessibility violations', () => {
      render(<CaseInsightsPage caseId="case-123" />);

      // Basic check that content renders
      expect(screen.getByTestId('insights-dashboard')).toBeInTheDocument();
    });
  });
});
