/**
 * @jest-environment jsdom
 * @module BillingPage.test
 * @description Enterprise-grade tests for BillingPage component
 *
 * Test coverage:
 * - Page rendering
 * - BillingDashboard integration
 * - navigateTo callback
 * - initialTab prop handling
 * - PageContainerLayout wrapper
 * - React.memo optimization
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BillingPage } from './BillingPage';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/features/operations/billing/BillingDashboard', () => {
  const MockBillingDashboard = ({
    navigateTo,
    initialTab,
  }: {
    navigateTo?: (view: string) => void;
    initialTab?: string;
  }) => (
    <div data-testid="billing-dashboard">
      <h1>Billing Dashboard</h1>
      {initialTab && <p data-testid="initial-tab">Tab: {initialTab}</p>}
      <div data-testid="billing-content">
        <button onClick={() => navigateTo?.('invoices')} data-testid="nav-invoices">
          Invoices
        </button>
        <button onClick={() => navigateTo?.('payments')} data-testid="nav-payments">
          Payments
        </button>
        <button onClick={() => navigateTo?.('reports')} data-testid="nav-reports">
          Reports
        </button>
      </div>
    </div>
  );
  MockBillingDashboard.displayName = 'BillingDashboard';
  return MockBillingDashboard;
});

jest.mock('@/components/ui/layouts/PageContainerLayout/PageContainerLayout', () => ({
  PageContainerLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container-layout">{children}</div>
  ),
}));

// ============================================================================
// TEST SUITES
// ============================================================================

describe('BillingPage', () => {
  const mockNavigateTo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<BillingPage />);

      expect(screen.getByTestId('page-container-layout')).toBeInTheDocument();
    });

    it('renders BillingDashboard component', () => {
      render(<BillingPage />);

      expect(screen.getByTestId('billing-dashboard')).toBeInTheDocument();
    });

    it('wraps content in PageContainerLayout', () => {
      render(<BillingPage />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout).toContainElement(screen.getByTestId('billing-dashboard'));
    });

    it('displays billing dashboard heading', () => {
      render(<BillingPage />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Billing Dashboard');
    });

    it('renders billing content', () => {
      render(<BillingPage />);

      expect(screen.getByTestId('billing-content')).toBeInTheDocument();
    });
  });

  describe('Props Propagation', () => {
    it('passes navigateTo to BillingDashboard', () => {
      render(<BillingPage navigateTo={mockNavigateTo} />);

      expect(screen.getByTestId('nav-invoices')).toBeInTheDocument();
    });

    it('passes initialTab to BillingDashboard', () => {
      render(<BillingPage initialTab="invoices" />);

      expect(screen.getByTestId('initial-tab')).toHaveTextContent('Tab: invoices');
    });

    it('does not display initialTab when not provided', () => {
      render(<BillingPage />);

      expect(screen.queryByTestId('initial-tab')).not.toBeInTheDocument();
    });
  });

  describe('navigateTo Callback', () => {
    it('calls navigateTo with "invoices" view', async () => {
      const user = userEvent.setup();
      render(<BillingPage navigateTo={mockNavigateTo} />);

      await user.click(screen.getByTestId('nav-invoices'));

      expect(mockNavigateTo).toHaveBeenCalledWith('invoices');
    });

    it('calls navigateTo with "payments" view', async () => {
      const user = userEvent.setup();
      render(<BillingPage navigateTo={mockNavigateTo} />);

      await user.click(screen.getByTestId('nav-payments'));

      expect(mockNavigateTo).toHaveBeenCalledWith('payments');
    });

    it('calls navigateTo with "reports" view', async () => {
      const user = userEvent.setup();
      render(<BillingPage navigateTo={mockNavigateTo} />);

      await user.click(screen.getByTestId('nav-reports'));

      expect(mockNavigateTo).toHaveBeenCalledWith('reports');
    });

    it('does not throw when navigateTo is undefined', async () => {
      const user = userEvent.setup();
      render(<BillingPage />);

      await expect(user.click(screen.getByTestId('nav-invoices'))).resolves.not.toThrow();
    });
  });

  describe('React.memo Optimization', () => {
    it('is memoized for performance', () => {
      expect(BillingPage).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });

    it('re-renders correctly when navigateTo changes', () => {
      const { rerender } = render(<BillingPage navigateTo={mockNavigateTo} />);

      const newNavigateTo = jest.fn();
      rerender(<BillingPage navigateTo={newNavigateTo} />);

      expect(screen.getByTestId('billing-dashboard')).toBeInTheDocument();
    });

    it('re-renders correctly when initialTab changes', () => {
      const { rerender } = render(<BillingPage initialTab="overview" />);

      expect(screen.getByTestId('initial-tab')).toHaveTextContent('Tab: overview');

      rerender(<BillingPage initialTab="invoices" />);

      expect(screen.getByTestId('initial-tab')).toHaveTextContent('Tab: invoices');
    });
  });

  describe('Layout Structure', () => {
    it('maintains correct component hierarchy', () => {
      const { container } = render(<BillingPage />);

      expect(container.firstChild).toHaveAttribute('data-testid', 'page-container-layout');
    });

    it('renders single child in layout', () => {
      render(<BillingPage />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout.children).toHaveLength(1);
    });
  });

  describe('Navigation Buttons', () => {
    it('renders all navigation buttons', () => {
      render(<BillingPage />);

      expect(screen.getByText('Invoices')).toBeInTheDocument();
      expect(screen.getByText('Payments')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });

    it('all buttons are clickable', async () => {
      const user = userEvent.setup();
      render(<BillingPage navigateTo={mockNavigateTo} />);

      await user.click(screen.getByText('Invoices'));
      await user.click(screen.getByText('Payments'));
      await user.click(screen.getByText('Reports'));

      expect(mockNavigateTo).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('renders heading element', () => {
      render(<BillingPage />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('all navigation buttons are accessible', () => {
      render(<BillingPage />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined navigateTo', () => {
      render(<BillingPage navigateTo={undefined} />);

      expect(screen.getByTestId('billing-dashboard')).toBeInTheDocument();
    });

    it('handles empty initialTab', () => {
      render(<BillingPage initialTab="" />);

      expect(screen.queryByTestId('initial-tab')).not.toBeInTheDocument();
    });
  });
});
