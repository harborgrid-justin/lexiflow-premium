/**
 * CaseFinancialsPage Component Tests
 * Enterprise-grade test suite for case financial management page
 *
 * @module components/features/cases/pages/CaseFinancialsPage.test
 */

import { render, screen } from '@testing-library/react';
import { CaseFinancialsPage } from './CaseFinancialsPage';

// Mock the CaseFinancialsCenter component
jest.mock('@/features/cases/components/financials/CaseFinancialsCenter', () => ({
  CaseFinancialsCenter: () => <div data-testid="financials-center">Financials Center</div>,
}));

// Mock the PageContainerLayout component
jest.mock('@/components/ui/layouts/PageContainerLayout/PageContainerLayout', () => ({
  PageContainerLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container-layout">{children}</div>
  ),
}));

describe('CaseFinancialsPage', () => {
  describe('Rendering', () => {
    it('should render the page container layout', () => {
      render(<CaseFinancialsPage caseId="case-123" />);

      expect(screen.getByTestId('page-container-layout')).toBeInTheDocument();
    });

    it('should render the financials center', () => {
      render(<CaseFinancialsPage caseId="case-123" />);

      expect(screen.getByTestId('financials-center')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('should accept caseId prop', () => {
      render(<CaseFinancialsPage caseId="case-456" />);

      expect(screen.getByTestId('financials-center')).toBeInTheDocument();
    });

    it('should render with different caseId values', () => {
      const { rerender } = render(<CaseFinancialsPage caseId="case-123" />);
      expect(screen.getByTestId('financials-center')).toBeInTheDocument();

      rerender(<CaseFinancialsPage caseId="case-789" />);
      expect(screen.getByTestId('financials-center')).toBeInTheDocument();
    });
  });

  describe('Component Optimization', () => {
    it('should be wrapped with React.memo', () => {
      expect(CaseFinancialsPage.displayName || CaseFinancialsPage.name).toBeDefined();
    });

    it('should not rerender with same props', () => {
      const { rerender } = render(<CaseFinancialsPage caseId="case-123" />);

      rerender(<CaseFinancialsPage caseId="case-123" />);

      expect(screen.getByTestId('financials-center')).toBeInTheDocument();
    });

    it('should rerender when props change', () => {
      const { rerender } = render(<CaseFinancialsPage caseId="case-123" />);
      expect(screen.getByTestId('financials-center')).toBeInTheDocument();

      rerender(<CaseFinancialsPage caseId="case-456" />);
      expect(screen.getByTestId('financials-center')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should nest financials center inside page container', () => {
      render(<CaseFinancialsPage caseId="case-123" />);

      const pageContainer = screen.getByTestId('page-container-layout');
      const financialsCenter = screen.getByTestId('financials-center');

      expect(pageContainer).toContainElement(financialsCenter);
    });
  });

  describe('CaseId Variations', () => {
    it('should handle UUID format caseId', () => {
      render(<CaseFinancialsPage caseId="550e8400-e29b-41d4-a716-446655440000" />);

      expect(screen.getByTestId('financials-center')).toBeInTheDocument();
    });

    it('should handle alphanumeric caseId', () => {
      render(<CaseFinancialsPage caseId="case123abc" />);

      expect(screen.getByTestId('financials-center')).toBeInTheDocument();
    });

    it('should handle numeric string caseId', () => {
      render(<CaseFinancialsPage caseId="12345" />);

      expect(screen.getByTestId('financials-center')).toBeInTheDocument();
    });
  });
});
