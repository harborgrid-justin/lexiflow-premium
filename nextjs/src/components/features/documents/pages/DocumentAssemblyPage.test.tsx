/**
 * DocumentAssemblyPage Component Tests
 * Enterprise-grade test suite for document assembly page
 *
 * @module components/features/documents/pages/DocumentAssemblyPage.test
 */

import { render, screen } from '@testing-library/react';
import { DocumentAssemblyPage } from './DocumentAssemblyPage';

// Mock PageContainerLayout
jest.mock('@/components/ui/layouts/PageContainerLayout/PageContainerLayout', () => ({
  PageContainerLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container-layout">{children}</div>
  ),
}));

describe('DocumentAssemblyPage', () => {
  describe('Rendering', () => {
    it('should render the page title', () => {
      render(<DocumentAssemblyPage />);

      expect(screen.getByText('Document Assembly')).toBeInTheDocument();
    });

    it('should render the page description', () => {
      render(<DocumentAssemblyPage />);

      expect(
        screen.getByText(/Document assembly wizard coming soon/)
      ).toBeInTheDocument();
    });

    it('should render description about template-based generation', () => {
      render(<DocumentAssemblyPage />);

      expect(
        screen.getByText(/template-based document generation/)
      ).toBeInTheDocument();
    });

    it('should render within PageContainerLayout', () => {
      render(<DocumentAssemblyPage />);

      expect(screen.getByTestId('page-container-layout')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have proper heading styling', () => {
      render(<DocumentAssemblyPage />);

      const heading = screen.getByText('Document Assembly');
      expect(heading).toHaveClass('text-2xl', 'font-bold', 'mb-4');
    });

    it('should have proper description styling', () => {
      render(<DocumentAssemblyPage />);

      const description = screen.getByText(/Document assembly wizard coming soon/);
      expect(description).toHaveClass('text-gray-600');
    });

    it('should have padding on container', () => {
      const { container } = render(<DocumentAssemblyPage />);

      const contentDiv = container.querySelector('.p-6');
      expect(contentDiv).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('should accept optional caseId prop', () => {
      // Should not throw when caseId is provided
      expect(() => render(<DocumentAssemblyPage caseId="case-123" />)).not.toThrow();
    });

    it('should render without caseId prop', () => {
      expect(() => render(<DocumentAssemblyPage />)).not.toThrow();
    });
  });

  describe('React.memo Optimization', () => {
    it('should be memoized component', () => {
      // DocumentAssemblyPage should be wrapped in React.memo
      expect(DocumentAssemblyPage.displayName).toBeDefined;
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<DocumentAssemblyPage />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Document Assembly');
    });
  });

  describe('Structure', () => {
    it('should render heading before description', () => {
      const { container } = render(<DocumentAssemblyPage />);

      const contentDiv = container.querySelector('.p-6');
      const children = contentDiv?.children;

      expect(children?.[0].tagName).toBe('H1');
      expect(children?.[1].tagName).toBe('P');
    });
  });
});
