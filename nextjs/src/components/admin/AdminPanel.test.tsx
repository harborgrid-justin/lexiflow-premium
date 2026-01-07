/**
 * @fileoverview Enterprise-grade tests for AdminPanel component
 * @module components/admin/AdminPanel.test
 *
 * Tests tab navigation, content rendering, and admin dashboard functionality.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPanel from './AdminPanel';

// ============================================================================
// MOCKS
// ============================================================================

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Activity: () => <svg data-testid="activity-icon" />,
  Database: () => <svg data-testid="database-icon" />,
  FileText: () => <svg data-testid="filetext-icon" />,
  Link: () => <svg data-testid="link-icon" />,
  Lock: () => <svg data-testid="lock-icon" />,
  Server: () => <svg data-testid="server-icon" />,
  Shield: () => <svg data-testid="shield-icon" />,
  Users: () => <svg data-testid="users-icon" />,
}));

// ============================================================================
// HEADER TESTS
// ============================================================================

describe('AdminPanel', () => {
  describe('Header', () => {
    it('renders admin console title', () => {
      render(<AdminPanel />);
      expect(screen.getByRole('heading', { name: /admin console/i })).toBeInTheDocument();
    });

    it('renders description text', () => {
      render(<AdminPanel />);
      expect(screen.getByText(/system settings, security audits/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // TAB NAVIGATION TESTS
  // ============================================================================

  describe('Tab Navigation', () => {
    it('renders all tab buttons', () => {
      render(<AdminPanel />);

      expect(screen.getByRole('button', { name: /hierarchy/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /security/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /database/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /logs/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /integrations/i })).toBeInTheDocument();
    });

    it('shows Hierarchy tab as active by default', () => {
      render(<AdminPanel />);
      const hierarchyTab = screen.getByRole('button', { name: /hierarchy/i });
      expect(hierarchyTab).toHaveClass('border-blue-500', 'text-blue-600');
    });

    it('switches to Security tab when clicked', async () => {
      const user = userEvent.setup();
      render(<AdminPanel />);

      await user.click(screen.getByRole('button', { name: /security/i }));

      const securityTab = screen.getByRole('button', { name: /security/i });
      expect(securityTab).toHaveClass('border-blue-500');
    });

    it('switches to Database tab when clicked', async () => {
      const user = userEvent.setup();
      render(<AdminPanel />);

      await user.click(screen.getByRole('button', { name: /database/i }));

      expect(screen.getByText(/database management/i)).toBeInTheDocument();
    });

    it('switches to Logs tab when clicked', async () => {
      const user = userEvent.setup();
      render(<AdminPanel />);

      await user.click(screen.getByRole('button', { name: /logs/i }));

      expect(screen.getByText(/system logs/i)).toBeInTheDocument();
    });

    it('switches to Integrations tab when clicked', async () => {
      const user = userEvent.setup();
      render(<AdminPanel />);

      await user.click(screen.getByRole('button', { name: /integrations/i }));

      expect(screen.getByText(/google drive/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // HIERARCHY TAB CONTENT TESTS
  // ============================================================================

  describe('Hierarchy Tab Content', () => {
    it('renders organization hierarchy section', () => {
      render(<AdminPanel />);
      expect(screen.getByText(/organization hierarchy/i)).toBeInTheDocument();
    });

    it('displays headquarters structure', () => {
      render(<AdminPanel />);
      expect(screen.getByText(/headquarters/i)).toBeInTheDocument();
    });

    it('displays department names', () => {
      render(<AdminPanel />);
      expect(screen.getByText(/legal department/i)).toBeInTheDocument();
      expect(screen.getByText(/hr department/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // SECURITY TAB CONTENT TESTS
  // ============================================================================

  describe('Security Tab Content', () => {
    it('renders security metrics cards', async () => {
      const user = userEvent.setup();
      render(<AdminPanel />);

      await user.click(screen.getByRole('button', { name: /security/i }));

      expect(screen.getByText(/security score/i)).toBeInTheDocument();
      expect(screen.getByText(/active sessions/i)).toBeInTheDocument();
      expect(screen.getByText(/failed logins/i)).toBeInTheDocument();
    });

    it('displays security score value', async () => {
      const user = userEvent.setup();
      render(<AdminPanel />);

      await user.click(screen.getByRole('button', { name: /security/i }));

      expect(screen.getByText('98/100')).toBeInTheDocument();
    });

    it('displays active sessions count', async () => {
      const user = userEvent.setup();
      render(<AdminPanel />);

      await user.click(screen.getByRole('button', { name: /security/i }));

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('displays failed logins count', async () => {
      const user = userEvent.setup();
      render(<AdminPanel />);

      await user.click(screen.getByRole('button', { name: /security/i }));

      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // DATABASE TAB CONTENT TESTS
  // ============================================================================

  describe('Database Tab Content', () => {
    it('renders database management section', async () => {
      const user = userEvent.setup();
      render(<AdminPanel />);

      await user.click(screen.getByRole('button', { name: /database/i }));

      expect(screen.getByText(/database management/i)).toBeInTheDocument();
    });

    it('displays primary database info', async () => {
      const user = userEvent.setup();
      render(<AdminPanel />);

      await user.click(screen.getByRole('button', { name: /database/i }));

      expect(screen.getByText(/primary database/i)).toBeInTheDocument();
      expect(screen.getByText(/postgresql 15\.4/i)).toBeInTheDocument();
    });

    it('displays database status as healthy', async () => {
      const user = userEvent.setup();
      render(<AdminPanel />);

      await user.click(screen.getByRole('button', { name: /database/i }));

      expect(screen.getByText(/healthy/i)).toBeInTheDocument();
    });

    it('displays database size', async () => {
      const user = userEvent.setup();
      render(<AdminPanel />);

      await user.click(screen.getByRole('button', { name: /database/i }));

      expect(screen.getByText(/4\.2 gb/i)).toBeInTheDocument();
    });

    it('displays connection count', async () => {
      const user = userEvent.setup();
      render(<AdminPanel />);

      await user.click(screen.getByRole('button', { name: /database/i }));

      expect(screen.getByText('128')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // LOGS TAB CONTENT TESTS
  // ============================================================================

  describe('Logs Tab Content', () => {
    it('renders system logs table', async () => {
      const user = userEvent.setup();
      render(<AdminPanel />);

      await user.click(screen.getByRole('button', { name: /logs/i }));

      expect(screen.getByText(/system logs/i)).toBeInTheDocument();
    });

    it('displays log table headers', async () => {
      const user = userEvent.setup();
      render(<AdminPanel />);

      await user.click(screen.getByRole('button', { name: /logs/i }));

      expect(screen.getByText(/timestamp/i)).toBeInTheDocument();
      expect(screen.getByText(/level/i)).toBeInTheDocument();
      expect(screen.getByText(/message/i)).toBeInTheDocument();
      expect(screen.getByText(/user/i)).toBeInTheDocument();
    });

    it('displays log entries', async () => {
      const user = userEvent.setup();
      render(<AdminPanel />);

      await user.click(screen.getByRole('button', { name: /logs/i }));

      const infoLabels = screen.getAllByText(/info/i);
      expect(infoLabels.length).toBeGreaterThan(0);
    });

    it('displays admin email in logs', async () => {
      const user = userEvent.setup();
      render(<AdminPanel />);

      await user.click(screen.getByRole('button', { name: /logs/i }));

      const adminEmails = screen.getAllByText(/admin@lexiflow\.com/i);
      expect(adminEmails.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // INTEGRATIONS TAB CONTENT TESTS
  // ============================================================================

  describe('Integrations Tab Content', () => {
    it('renders integrations section', async () => {
      const user = userEvent.setup();
      render(<AdminPanel />);

      await user.click(screen.getByRole('button', { name: /integrations/i }));

      expect(screen.getByRole('heading', { name: /integrations/i })).toBeInTheDocument();
    });

    it('displays all integration options', async () => {
      const user = userEvent.setup();
      render(<AdminPanel />);

      await user.click(screen.getByRole('button', { name: /integrations/i }));

      expect(screen.getByText(/google drive/i)).toBeInTheDocument();
      expect(screen.getByText(/microsoft 365/i)).toBeInTheDocument();
      expect(screen.getByText(/slack/i)).toBeInTheDocument();
      expect(screen.getByText(/zoom/i)).toBeInTheDocument();
      expect(screen.getByText(/quickbooks/i)).toBeInTheDocument();
    });

    it('renders toggle switches for each integration', async () => {
      const user = userEvent.setup();
      render(<AdminPanel />);

      await user.click(screen.getByRole('button', { name: /integrations/i }));

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBe(5);
    });
  });

  // ============================================================================
  // PROPS TESTS
  // ============================================================================

  describe('Props Handling', () => {
    it('accepts initialHealth prop', () => {
      const mockHealth = { status: 'healthy', uptime: '99.9%' };
      render(<AdminPanel initialHealth={mockHealth} />);
      expect(screen.getByRole('heading', { name: /admin console/i })).toBeInTheDocument();
    });

    it('accepts initialUsersCount prop', () => {
      render(<AdminPanel initialUsersCount={100} />);
      expect(screen.getByRole('heading', { name: /admin console/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // RESPONSIVE DESIGN TESTS
  // ============================================================================

  describe('Responsive Design', () => {
    it('applies responsive grid classes to security metrics', async () => {
      const user = userEvent.setup();
      render(<AdminPanel />);

      await user.click(screen.getByRole('button', { name: /security/i }));

      const gridContainer = screen.getByText(/security score/i).closest('.grid');
      expect(gridContainer).toHaveClass('md:grid-cols-3');
    });

    it('applies overflow handling to tab navigation', () => {
      render(<AdminPanel />);

      const nav = screen.getByRole('button', { name: /hierarchy/i }).closest('nav');
      expect(nav).toHaveClass('overflow-x-auto');
    });
  });

  // ============================================================================
  // DARK MODE TESTS
  // ============================================================================

  describe('Dark Mode Support', () => {
    it('applies dark mode classes to hierarchy content', () => {
      render(<AdminPanel />);

      const hierarchyHeading = screen.getByText(/organization hierarchy/i);
      expect(hierarchyHeading).toHaveClass('dark:text-white');
    });
  });
});
