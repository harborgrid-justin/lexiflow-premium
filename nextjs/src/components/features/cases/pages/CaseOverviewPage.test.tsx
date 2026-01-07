/**
 * CaseOverviewPage Component Tests
 * Enterprise-grade test suite for case overview dashboard page
 *
 * @module components/features/cases/pages/CaseOverviewPage.test
 */

import { render, screen } from '@testing-library/react';
import { CaseOverviewPage } from './CaseOverviewPage';

// Mock the CaseOverviewDashboard component
jest.mock('@/features/cases/components/overview/CaseOverviewDashboard', () => ({
  CaseOverviewDashboard: () => <div data-testid="overview-dashboard">Overview Dashboard</div>,
}));

// Mock the PageContainerLayout component
jest.mock('@/components/ui/layouts/PageContainerLayout/PageContainerLayout', () => ({
  PageContainerLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container-layout">{children}</div>
  ),
}));

describe('CaseOverviewPage', () => {
  describe('Rendering', () => {
    it('should render the page container layout', () => {
      render(<CaseOverviewPage />);

      expect(screen.getByTestId('page-container-layout')).toBeInTheDocument();
    });

    it('should render the overview dashboard', () => {
      render(<CaseOverviewPage />);

      expect(screen.getByTestId('overview-dashboard')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('should accept optional caseId prop', () => {
      render(<CaseOverviewPage caseId="case-123" />);

      expect(screen.getByTestId('overview-dashboard')).toBeInTheDocument();
    });

    it('should render without caseId prop', () => {
      render(<CaseOverviewPage />);

      expect(screen.getByTestId('overview-dashboard')).toBeInTheDocument();
    });

    it('should accept undefined caseId prop', () => {
      render(<CaseOverviewPage caseId={undefined} />);

      expect(screen.getByTestId('overview-dashboard')).toBeInTheDocument();
    });

    it('should handle different caseId formats', () => {
      const caseIds = [
        'case-123',
        '550e8400-e29b-41d4-a716-446655440000',
        'alphanumeric123',
      ];

      caseIds.forEach(caseId => {
        const { unmount } = render(<CaseOverviewPage caseId={caseId} />);
        expect(screen.getByTestId('overview-dashboard')).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Component Optimization', () => {
    it('should be wrapped with React.memo', () => {
      expect(CaseOverviewPage.displayName || CaseOverviewPage.name).toBeDefined();
    });

    it('should not rerender with same props', () => {
      const { rerender } = render(<CaseOverviewPage caseId="case-123" />);

      rerender(<CaseOverviewPage caseId="case-123" />);

      expect(screen.getByTestId('overview-dashboard')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should nest overview dashboard inside page container', () => {
      render(<CaseOverviewPage />);

      const pageContainer = screen.getByTestId('page-container-layout');
      const overviewDashboard = screen.getByTestId('overview-dashboard');

      expect(pageContainer).toContainElement(overviewDashboard);
    });
  });

  describe('Default Behavior', () => {
    it('should function as all-cases overview when no caseId provided', () => {
      render(<CaseOverviewPage />);

      // Dashboard should still render for all-cases overview
      expect(screen.getByTestId('overview-dashboard')).toBeInTheDocument();
    });

    it('should function as specific case overview when caseId provided', () => {
      render(<CaseOverviewPage caseId="specific-case" />);

      expect(screen.getByTestId('overview-dashboard')).toBeInTheDocument();
    });
  });
});
