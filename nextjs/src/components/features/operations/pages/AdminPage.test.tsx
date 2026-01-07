/**
 * @jest-environment jsdom
 * @module AdminPage.test
 * @description Enterprise-grade tests for AdminPage component
 *
 * Test coverage:
 * - Page rendering
 * - AdminPanel integration
 * - initialTab prop handling
 * - PageContainerLayout wrapper
 * - React.memo optimization
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminPage } from './AdminPage';

// ============================================================================
// MOCKS
// ============================================================================

type AdminView = 'hierarchy' | 'security' | 'db' | 'data' | 'logs' | 'integrations';

jest.mock('@/features/admin/AdminPanel', () => ({
  AdminPanel: ({ initialTab }: { initialTab?: AdminView }) => (
    <div data-testid="admin-panel">
      <h1>System Administration</h1>
      {initialTab && <p data-testid="initial-tab">Tab: {initialTab}</p>}
      <nav data-testid="admin-nav">
        <button data-testid="tab-hierarchy">Hierarchy</button>
        <button data-testid="tab-security">Security</button>
        <button data-testid="tab-db">Database</button>
        <button data-testid="tab-data">Data</button>
        <button data-testid="tab-logs">Logs</button>
        <button data-testid="tab-integrations">Integrations</button>
      </nav>
    </div>
  ),
}));

jest.mock('@/components/ui/layouts/PageContainerLayout/PageContainerLayout', () => ({
  PageContainerLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container-layout">{children}</div>
  ),
}));

// ============================================================================
// TEST SUITES
// ============================================================================

describe('AdminPage', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<AdminPage />);

      expect(screen.getByTestId('page-container-layout')).toBeInTheDocument();
    });

    it('renders AdminPanel component', () => {
      render(<AdminPage />);

      expect(screen.getByTestId('admin-panel')).toBeInTheDocument();
    });

    it('wraps content in PageContainerLayout', () => {
      render(<AdminPage />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout).toContainElement(screen.getByTestId('admin-panel'));
    });

    it('displays system administration heading', () => {
      render(<AdminPage />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('System Administration');
    });

    it('renders admin navigation', () => {
      render(<AdminPage />);

      expect(screen.getByTestId('admin-nav')).toBeInTheDocument();
    });
  });

  describe('initialTab Prop', () => {
    it('passes initialTab to AdminPanel', () => {
      render(<AdminPage initialTab="security" />);

      expect(screen.getByTestId('initial-tab')).toHaveTextContent('Tab: security');
    });

    it('does not display tab when initialTab not provided', () => {
      render(<AdminPage />);

      expect(screen.queryByTestId('initial-tab')).not.toBeInTheDocument();
    });

    it('handles all valid tab values', () => {
      const tabs: AdminView[] = ['hierarchy', 'security', 'db', 'data', 'logs', 'integrations'];

      tabs.forEach(tab => {
        const { unmount } = render(<AdminPage initialTab={tab} />);
        expect(screen.getByTestId('initial-tab')).toHaveTextContent(`Tab: ${tab}`);
        unmount();
      });
    });
  });

  describe('AdminPanel Integration', () => {
    it('renders all admin tabs', () => {
      render(<AdminPage />);

      expect(screen.getByText('Hierarchy')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();
      expect(screen.getByText('Database')).toBeInTheDocument();
      expect(screen.getByText('Data')).toBeInTheDocument();
      expect(screen.getByText('Logs')).toBeInTheDocument();
      expect(screen.getByText('Integrations')).toBeInTheDocument();
    });

    it('renders correct number of tab buttons', () => {
      render(<AdminPage />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(6);
    });
  });

  describe('React.memo Optimization', () => {
    it('is memoized for performance', () => {
      expect(AdminPage).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });

    it('re-renders correctly when initialTab changes', () => {
      const { rerender } = render(<AdminPage initialTab="hierarchy" />);

      expect(screen.getByTestId('initial-tab')).toHaveTextContent('Tab: hierarchy');

      rerender(<AdminPage initialTab="security" />);

      expect(screen.getByTestId('initial-tab')).toHaveTextContent('Tab: security');
    });
  });

  describe('Layout Structure', () => {
    it('maintains correct component hierarchy', () => {
      const { container } = render(<AdminPage />);

      expect(container.firstChild).toHaveAttribute('data-testid', 'page-container-layout');
    });

    it('renders single child in layout', () => {
      render(<AdminPage />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout.children).toHaveLength(1);
    });
  });

  describe('Accessibility', () => {
    it('renders heading element', () => {
      render(<AdminPage />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('renders navigation element', () => {
      render(<AdminPage />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('all tab buttons are accessible', () => {
      render(<AdminPage />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(6);
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined initialTab', () => {
      render(<AdminPage initialTab={undefined} />);

      expect(screen.getByTestId('admin-panel')).toBeInTheDocument();
      expect(screen.queryByTestId('initial-tab')).not.toBeInTheDocument();
    });
  });
});
