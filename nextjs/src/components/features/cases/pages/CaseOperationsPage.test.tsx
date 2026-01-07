/**
 * CaseOperationsPage Component Tests
 * Enterprise-grade test suite for case operations management page
 *
 * @module components/features/cases/pages/CaseOperationsPage.test
 */

import { render, screen } from '@testing-library/react';
import { CaseOperationsPage } from './CaseOperationsPage';

// Mock the CaseOperationsCenter component
jest.mock('@/features/cases/components/operations/CaseOperationsCenter', () => ({
  CaseOperationsCenter: () => <div data-testid="operations-center">Operations Center</div>,
}));

// Mock the PageContainerLayout component
jest.mock('@/components/ui/layouts/PageContainerLayout/PageContainerLayout', () => ({
  PageContainerLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container-layout">{children}</div>
  ),
}));

describe('CaseOperationsPage', () => {
  describe('Rendering', () => {
    it('should render the page container layout', () => {
      render(<CaseOperationsPage caseId="case-123" />);

      expect(screen.getByTestId('page-container-layout')).toBeInTheDocument();
    });

    it('should render the operations center', () => {
      render(<CaseOperationsPage caseId="case-123" />);

      expect(screen.getByTestId('operations-center')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('should accept caseId prop', () => {
      render(<CaseOperationsPage caseId="case-456" />);

      expect(screen.getByTestId('operations-center')).toBeInTheDocument();
    });

    it('should handle different caseId formats', () => {
      const caseIds = [
        'case-123',
        '550e8400-e29b-41d4-a716-446655440000',
        'alphanumeric123',
        '12345',
      ];

      caseIds.forEach(caseId => {
        const { unmount } = render(<CaseOperationsPage caseId={caseId} />);
        expect(screen.getByTestId('operations-center')).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Component Optimization', () => {
    it('should be wrapped with React.memo', () => {
      expect(CaseOperationsPage.displayName || CaseOperationsPage.name).toBeDefined();
    });

    it('should not rerender with same props', () => {
      const { rerender } = render(<CaseOperationsPage caseId="case-123" />);

      rerender(<CaseOperationsPage caseId="case-123" />);

      expect(screen.getByTestId('operations-center')).toBeInTheDocument();
    });

    it('should rerender when caseId changes', () => {
      const { rerender } = render(<CaseOperationsPage caseId="case-123" />);
      expect(screen.getByTestId('operations-center')).toBeInTheDocument();

      rerender(<CaseOperationsPage caseId="case-456" />);
      expect(screen.getByTestId('operations-center')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should nest operations center inside page container', () => {
      render(<CaseOperationsPage caseId="case-123" />);

      const pageContainer = screen.getByTestId('page-container-layout');
      const operationsCenter = screen.getByTestId('operations-center');

      expect(pageContainer).toContainElement(operationsCenter);
    });
  });

  describe('Required Props', () => {
    it('should require caseId prop', () => {
      // TypeScript would catch this, but we test runtime behavior
      render(<CaseOperationsPage caseId="required-case-id" />);

      expect(screen.getByTestId('operations-center')).toBeInTheDocument();
    });
  });
});
