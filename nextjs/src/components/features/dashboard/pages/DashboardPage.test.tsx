/**
 * @jest-environment jsdom
 * @module DashboardPage.test
 * @description Enterprise-grade tests for DashboardPage component
 *
 * Test coverage:
 * - Page rendering
 * - Dashboard integration
 * - Props propagation (onSelectCase, currentUser, initialTab)
 * - PageContainerLayout wrapper
 * - React.memo optimization
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardPage } from './DashboardPage';
import type { User } from '@/types/system';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/features/dashboard/components/Dashboard', () => ({
  Dashboard: ({
    onSelectCase,
    currentUser,
    initialTab,
  }: {
    onSelectCase: (id: string) => void;
    currentUser: User;
    initialTab?: string;
  }) => (
    <div data-testid="dashboard">
      <h1>Dashboard</h1>
      <p data-testid="user-name">{currentUser?.name || 'Unknown'}</p>
      <p data-testid="user-role">{currentUser?.role || 'Unknown'}</p>
      {initialTab && <p data-testid="initial-tab">{initialTab}</p>}
      <button onClick={() => onSelectCase('case-456')} data-testid="select-case-btn">
        Select Case
      </button>
    </div>
  ),
}));

jest.mock('@/components/ui/layouts/PageContainerLayout/PageContainerLayout', () => ({
  PageContainerLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container-layout">{children}</div>
  ),
}));

// ============================================================================
// TEST DATA
// ============================================================================

const mockUser: User = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Senior Partner',
  organizationId: 'org-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const defaultProps = {
  onSelectCase: jest.fn(),
  currentUser: mockUser,
};

// ============================================================================
// TEST UTILITIES
// ============================================================================

const renderDashboardPage = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<DashboardPage {...mergedProps} />);
};

// ============================================================================
// TEST SUITES
// ============================================================================

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderDashboardPage();

      expect(screen.getByTestId('page-container-layout')).toBeInTheDocument();
    });

    it('renders Dashboard component', () => {
      renderDashboardPage();

      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });

    it('wraps content in PageContainerLayout', () => {
      renderDashboardPage();

      const layout = screen.getByTestId('page-container-layout');
      expect(layout).toContainElement(screen.getByTestId('dashboard'));
    });

    it('displays dashboard heading', () => {
      renderDashboardPage();

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dashboard');
    });
  });

  describe('Props Propagation', () => {
    it('passes currentUser to Dashboard', () => {
      renderDashboardPage();

      expect(screen.getByTestId('user-name')).toHaveTextContent('John Doe');
      expect(screen.getByTestId('user-role')).toHaveTextContent('Senior Partner');
    });

    it('passes onSelectCase to Dashboard', async () => {
      const user = userEvent.setup();
      const onSelectCase = jest.fn();
      renderDashboardPage({ onSelectCase });

      await user.click(screen.getByTestId('select-case-btn'));

      expect(onSelectCase).toHaveBeenCalledWith('case-456');
    });

    it('passes initialTab to Dashboard when provided', () => {
      renderDashboardPage({ initialTab: 'analytics' });

      expect(screen.getByTestId('initial-tab')).toHaveTextContent('analytics');
    });

    it('does not render initialTab when not provided', () => {
      renderDashboardPage();

      expect(screen.queryByTestId('initial-tab')).not.toBeInTheDocument();
    });
  });

  describe('User Data Display', () => {
    it('displays user name', () => {
      renderDashboardPage();

      expect(screen.getByTestId('user-name')).toHaveTextContent('John Doe');
    });

    it('displays user role', () => {
      renderDashboardPage();

      expect(screen.getByTestId('user-role')).toHaveTextContent('Senior Partner');
    });

    it('handles user with different role', () => {
      const paralegaUser = { ...mockUser, role: 'Paralegal' };
      renderDashboardPage({ currentUser: paralegaUser });

      expect(screen.getByTestId('user-role')).toHaveTextContent('Paralegal');
    });
  });

  describe('React.memo Optimization', () => {
    it('is memoized for performance', () => {
      expect(DashboardPage).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });

    it('re-renders correctly when currentUser changes', () => {
      const { rerender } = renderDashboardPage();

      const newUser = { ...mockUser, name: 'Jane Smith' };
      rerender(
        <DashboardPage
          onSelectCase={defaultProps.onSelectCase}
          currentUser={newUser}
        />
      );

      expect(screen.getByTestId('user-name')).toHaveTextContent('Jane Smith');
    });

    it('re-renders correctly when initialTab changes', () => {
      const { rerender } = renderDashboardPage({ initialTab: 'overview' });

      expect(screen.getByTestId('initial-tab')).toHaveTextContent('overview');

      rerender(
        <DashboardPage
          onSelectCase={defaultProps.onSelectCase}
          currentUser={mockUser}
          initialTab="tasks"
        />
      );

      expect(screen.getByTestId('initial-tab')).toHaveTextContent('tasks');
    });
  });

  describe('Layout Structure', () => {
    it('maintains correct component hierarchy', () => {
      const { container } = renderDashboardPage();

      expect(container.firstChild).toHaveAttribute('data-testid', 'page-container-layout');
    });

    it('renders single child in layout', () => {
      renderDashboardPage();

      const layout = screen.getByTestId('page-container-layout');
      expect(layout.children).toHaveLength(1);
    });
  });

  describe('onSelectCase Callback', () => {
    it('calls onSelectCase with correct case ID', async () => {
      const user = userEvent.setup();
      const onSelectCase = jest.fn();
      renderDashboardPage({ onSelectCase });

      await user.click(screen.getByTestId('select-case-btn'));

      expect(onSelectCase).toHaveBeenCalledTimes(1);
      expect(onSelectCase).toHaveBeenCalledWith('case-456');
    });

    it('does not call onSelectCase on render', () => {
      const onSelectCase = jest.fn();
      renderDashboardPage({ onSelectCase });

      expect(onSelectCase).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('renders heading element', () => {
      renderDashboardPage();

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('contains interactive button', () => {
      renderDashboardPage();

      expect(screen.getByRole('button', { name: 'Select Case' })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty user name', () => {
      const emptyNameUser = { ...mockUser, name: '' };
      renderDashboardPage({ currentUser: emptyNameUser });

      expect(screen.getByTestId('user-name')).toHaveTextContent('');
    });

    it('handles undefined initial tab', () => {
      renderDashboardPage({ initialTab: undefined });

      expect(screen.queryByTestId('initial-tab')).not.toBeInTheDocument();
    });

    it('handles empty string initialTab', () => {
      renderDashboardPage({ initialTab: '' });

      // Empty string is falsy, so it should not render
      expect(screen.queryByTestId('initial-tab')).not.toBeInTheDocument();
    });
  });
});
