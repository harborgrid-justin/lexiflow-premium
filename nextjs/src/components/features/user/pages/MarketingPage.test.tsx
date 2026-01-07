/**
 * @jest-environment jsdom
 * MarketingPage Component Tests
 * Enterprise-grade tests for marketing dashboard page
 */

import { render, screen } from '@testing-library/react';
import { MarketingPage } from './MarketingPage';

// Mock dependencies
jest.mock('@/features/knowledge/practice/MarketingDashboard', () => ({
  MarketingDashboard: () => <div data-testid="marketing-dashboard">Marketing Dashboard Content</div>,
}));

jest.mock('@/components/ui/layouts/PageContainerLayout/PageContainerLayout', () => ({
  PageContainerLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container">{children}</div>
  ),
}));

describe('MarketingPage', () => {
  describe('Rendering', () => {
    it('renders PageContainerLayout', () => {
      render(<MarketingPage />);

      expect(screen.getByTestId('page-container')).toBeInTheDocument();
    });

    it('renders MarketingDashboard inside container', () => {
      render(<MarketingPage />);

      expect(screen.getByTestId('marketing-dashboard')).toBeInTheDocument();
    });

    it('renders dashboard content', () => {
      render(<MarketingPage />);

      expect(screen.getByText('Marketing Dashboard Content')).toBeInTheDocument();
    });
  });

  describe('React.memo', () => {
    it('is wrapped in React.memo for performance', () => {
      // MarketingPage should be memoized
      expect(MarketingPage.$$typeof).toBeDefined();
    });
  });

  describe('Component Structure', () => {
    it('renders MarketingDashboard as child of PageContainerLayout', () => {
      render(<MarketingPage />);

      const container = screen.getByTestId('page-container');
      const dashboard = screen.getByTestId('marketing-dashboard');

      expect(container).toContainElement(dashboard);
    });
  });
});
