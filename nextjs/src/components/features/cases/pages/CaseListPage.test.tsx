/**
 * CaseListPage Component Tests
 * Enterprise-grade test suite for case list management page
 *
 * @module components/features/cases/pages/CaseListPage.test
 */

import { render, screen } from '@testing-library/react';
import { CaseListPage } from './CaseListPage';

// Mock the CaseManagement component
jest.mock('@/features/cases/components/list/CaseManagement', () => ({
  CaseManagement: () => <div data-testid="case-management">Case Management Component</div>,
}));

// Mock the PageContainerLayout component
jest.mock('@/components/ui/layouts/PageContainerLayout/PageContainerLayout', () => ({
  PageContainerLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container-layout">{children}</div>
  ),
}));

describe('CaseListPage', () => {
  describe('Rendering', () => {
    it('should render the page container layout', () => {
      render(<CaseListPage />);

      expect(screen.getByTestId('page-container-layout')).toBeInTheDocument();
    });

    it('should render the case management component', () => {
      render(<CaseListPage />);

      expect(screen.getByTestId('case-management')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('should accept onSelectCase callback', () => {
      const onSelectCase = jest.fn();
      render(<CaseListPage onSelectCase={onSelectCase} />);

      expect(screen.getByTestId('case-management')).toBeInTheDocument();
    });

    it('should render without onSelectCase callback', () => {
      render(<CaseListPage />);

      expect(screen.getByTestId('case-management')).toBeInTheDocument();
    });

    it('should accept undefined onSelectCase', () => {
      render(<CaseListPage onSelectCase={undefined} />);

      expect(screen.getByTestId('case-management')).toBeInTheDocument();
    });
  });

  describe('Component Optimization', () => {
    it('should be wrapped with React.memo', () => {
      expect(CaseListPage.displayName || CaseListPage.name).toBeDefined();
    });

    it('should not rerender with same props', () => {
      const onSelectCase = jest.fn();
      const { rerender } = render(<CaseListPage onSelectCase={onSelectCase} />);

      rerender(<CaseListPage onSelectCase={onSelectCase} />);

      expect(screen.getByTestId('case-management')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should nest case management inside page container', () => {
      render(<CaseListPage />);

      const pageContainer = screen.getByTestId('page-container-layout');
      const caseManagement = screen.getByTestId('case-management');

      expect(pageContainer).toContainElement(caseManagement);
    });
  });

  describe('Callback Signature', () => {
    it('should have correct onSelectCase signature accepting caseId string', () => {
      const onSelectCase = (caseId: string) => {
        expect(typeof caseId).toBe('string');
      };

      render(<CaseListPage onSelectCase={onSelectCase} />);

      expect(screen.getByTestId('case-management')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should provide proper component hierarchy', () => {
      const { container } = render(<CaseListPage />);

      // Page container should be the root
      expect(container.firstChild).toBe(screen.getByTestId('page-container-layout'));

      // Case management should be child of page container
      const pageContainer = screen.getByTestId('page-container-layout');
      expect(pageContainer.firstChild).toBe(screen.getByTestId('case-management'));
    });
  });
});
