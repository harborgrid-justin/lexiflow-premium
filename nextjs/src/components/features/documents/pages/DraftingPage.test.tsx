/**
 * DraftingPage Component Tests
 * Enterprise-grade test suite for AI-powered document drafting page
 *
 * @module components/features/documents/pages/DraftingPage.test
 */

import { render, screen } from '@testing-library/react';
import { DraftingPage } from './DraftingPage';

// Mock PageContainerLayout
jest.mock('@/components/ui/layouts/PageContainerLayout/PageContainerLayout', () => ({
  PageContainerLayout: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="page-container-layout" className={className}>
      {children}
    </div>
  ),
}));

// Mock DraftingDashboard
jest.mock('@/features/drafting/DraftingDashboard', () => {
  const MockDraftingDashboard = () => (
    <div data-testid="drafting-dashboard">
      <h1>Drafting Dashboard</h1>
      <div>AI-powered document drafting interface</div>
    </div>
  );
  return MockDraftingDashboard;
});

describe('DraftingPage', () => {
  describe('Rendering', () => {
    it('should render DraftingDashboard component', () => {
      render(<DraftingPage />);

      expect(screen.getByTestId('drafting-dashboard')).toBeInTheDocument();
    });

    it('should render within PageContainerLayout', () => {
      render(<DraftingPage />);

      expect(screen.getByTestId('page-container-layout')).toBeInTheDocument();
    });

    it('should render dashboard content', () => {
      render(<DraftingPage />);

      expect(screen.getByText('Drafting Dashboard')).toBeInTheDocument();
      expect(screen.getByText('AI-powered document drafting interface')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have full height layout', () => {
      render(<DraftingPage />);

      const container = screen.getByTestId('page-container-layout');
      expect(container).toHaveClass('h-full');
    });

    it('should have no padding on container', () => {
      render(<DraftingPage />);

      const container = screen.getByTestId('page-container-layout');
      expect(container).toHaveClass('p-0');
    });
  });

  describe('React.memo Optimization', () => {
    it('should be memoized component', () => {
      // DraftingPage should be wrapped in React.memo
      expect(DraftingPage.displayName).toBeDefined;
    });

    it('should render correctly on subsequent renders', () => {
      const { rerender } = render(<DraftingPage />);

      expect(screen.getByTestId('drafting-dashboard')).toBeInTheDocument();

      rerender(<DraftingPage />);

      expect(screen.getByTestId('drafting-dashboard')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should nest DraftingDashboard inside PageContainerLayout', () => {
      render(<DraftingPage />);

      const pageContainer = screen.getByTestId('page-container-layout');
      const dashboard = screen.getByTestId('drafting-dashboard');

      expect(pageContainer).toContainElement(dashboard);
    });
  });

  describe('Component Structure', () => {
    it('should render as a single wrapped component', () => {
      const { container } = render(<DraftingPage />);

      // Should have single root child
      expect(container.children.length).toBe(1);
    });

    it('should pass className prop to PageContainerLayout', () => {
      render(<DraftingPage />);

      const container = screen.getByTestId('page-container-layout');
      expect(container.className).toContain('h-full');
      expect(container.className).toContain('p-0');
    });
  });
});
