/**
 * @fileoverview Enterprise-grade tests for ClientCRM component
 * @module components/crm/ClientCRM.test
 *
 * Tests dashboard, client directory, pipeline, and portal management.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClientCRM from './ClientCRM';

// ============================================================================
// MOCKS
// ============================================================================

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  BarChart2: () => <svg data-testid="bar-chart-icon" />,
  Briefcase: () => <svg data-testid="briefcase-icon" />,
  Globe: () => <svg data-testid="globe-icon" />,
  MoreVertical: () => <svg data-testid="more-icon" />,
  Search: () => <svg data-testid="search-icon" />,
  UserPlus: () => <svg data-testid="user-plus-icon" />,
  Users: () => <svg data-testid="users-icon" />,
}));

// ============================================================================
// HEADER TESTS
// ============================================================================

describe('ClientCRM', () => {
  describe('Header', () => {
    it('renders the Client Relationships title', () => {
      render(<ClientCRM />);
      expect(screen.getByRole('heading', { name: /client relationships/i })).toBeInTheDocument();
    });

    it('renders the description', () => {
      render(<ClientCRM />);
      expect(screen.getByText(/crm, intake pipeline, and secure client portals/i)).toBeInTheDocument();
    });

    it('renders New Intake button', () => {
      render(<ClientCRM />);
      expect(screen.getByRole('button', { name: /new intake/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // TAB NAVIGATION TESTS
  // ============================================================================

  describe('Tab Navigation', () => {
    it('renders Dashboard tab', () => {
      render(<ClientCRM />);
      expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument();
    });

    it('renders Client Directory tab', () => {
      render(<ClientCRM />);
      expect(screen.getByRole('button', { name: /client directory/i })).toBeInTheDocument();
    });

    it('renders Pipeline tab', () => {
      render(<ClientCRM />);
      expect(screen.getByRole('button', { name: /pipeline/i })).toBeInTheDocument();
    });

    it('renders Client Portal tab', () => {
      render(<ClientCRM />);
      expect(screen.getByRole('button', { name: /client portal/i })).toBeInTheDocument();
    });

    it('defaults to Dashboard tab', () => {
      render(<ClientCRM />);
      const dashboardTab = screen.getByRole('button', { name: /dashboard/i });
      expect(dashboardTab).toHaveClass('border-blue-500', 'text-blue-600');
    });

    it('switches to Client Directory tab', async () => {
      const user = userEvent.setup();
      render(<ClientCRM />);

      await user.click(screen.getByRole('button', { name: /client directory/i }));

      const directoryTab = screen.getByRole('button', { name: /client directory/i });
      expect(directoryTab).toHaveClass('border-blue-500', 'text-blue-600');
    });
  });

  // ============================================================================
  // CRM DASHBOARD TESTS
  // ============================================================================

  describe('CRM Dashboard', () => {
    it('renders pipeline stages', () => {
      render(<ClientCRM />);

      expect(screen.getByText('Lead')).toBeInTheDocument();
      expect(screen.getByText('Intake')).toBeInTheDocument();
      expect(screen.getByText('Proposal')).toBeInTheDocument();
      expect(screen.getByText('Retained')).toBeInTheDocument();
    });

    it('renders pipeline counts', () => {
      render(<ClientCRM />);

      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('renders pipeline values', () => {
      render(<ClientCRM />);

      expect(screen.getByText('$150k')).toBeInTheDocument();
      expect(screen.getByText('$75k')).toBeInTheDocument();
      expect(screen.getByText('$120k')).toBeInTheDocument();
      expect(screen.getByText('$350k')).toBeInTheDocument();
    });

    it('renders Recent Activities section', () => {
      render(<ClientCRM />);
      expect(screen.getByText('Recent Activities')).toBeInTheDocument();
    });

    it('renders activity items', () => {
      render(<ClientCRM />);

      const activityTexts = screen.getAllByText(/new client intake started/i);
      expect(activityTexts.length).toBeGreaterThan(0);
    });

    it('renders Revenue Forecast section', () => {
      render(<ClientCRM />);
      expect(screen.getByText('Revenue Forecast')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // CLIENT DIRECTORY TESTS
  // ============================================================================

  describe('Client Directory', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<ClientCRM />);
      await user.click(screen.getByRole('button', { name: /client directory/i }));
    });

    it('renders search input', () => {
      expect(screen.getByPlaceholderText(/search clients/i)).toBeInTheDocument();
    });

    it('renders Filter button', () => {
      expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
    });

    it('renders Export button', () => {
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });

    it('renders table headers', () => {
      expect(screen.getByText(/client name/i)).toBeInTheDocument();
      expect(screen.getByText(/industry/i)).toBeInTheDocument();
      expect(screen.getByText(/status/i)).toBeInTheDocument();
      expect(screen.getByText(/active cases/i)).toBeInTheDocument();
      expect(screen.getByText(/balance/i)).toBeInTheDocument();
    });

    it('renders client data', () => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('Global Industries')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });

    it('renders client industries', () => {
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('Manufacturing')).toBeInTheDocument();
      expect(screen.getByText('Individual')).toBeInTheDocument();
    });

    it('renders client statuses', () => {
      const activeStatuses = screen.getAllByText('Active');
      expect(activeStatuses.length).toBe(2);
      expect(screen.getByText('Prospective')).toBeInTheDocument();
    });

    it('renders client balances', () => {
      expect(screen.getByText('$12,500')).toBeInTheDocument();
      expect(screen.getByText('$45,200')).toBeInTheDocument();
      expect(screen.getByText('$0')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // STATUS BADGE COLORS TESTS
  // ============================================================================

  describe('Status Badge Colors', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<ClientCRM />);
      await user.click(screen.getByRole('button', { name: /client directory/i }));
    });

    it('applies emerald styling for Active status', () => {
      const activeBadges = screen.getAllByText('Active');
      activeBadges.forEach(badge => {
        expect(badge).toHaveClass('bg-emerald-100', 'text-emerald-800');
      });
    });

    it('applies blue styling for Prospective status', () => {
      const prospectiveBadge = screen.getByText('Prospective');
      expect(prospectiveBadge).toHaveClass('bg-blue-100', 'text-blue-800');
    });
  });

  // ============================================================================
  // CLIENT PORTAL TAB TESTS
  // ============================================================================

  describe('Client Portal Tab', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<ClientCRM />);
      await user.click(screen.getByRole('button', { name: /client portal/i }));
    });

    it('renders Client Portal Management heading', () => {
      expect(screen.getByRole('heading', { name: /client portal management/i })).toBeInTheDocument();
    });

    it('renders description text', () => {
      expect(screen.getByText(/manage access, permissions, and shared documents/i)).toBeInTheDocument();
    });

    it('renders Configure Portals button', () => {
      expect(screen.getByRole('button', { name: /configure portals/i })).toBeInTheDocument();
    });

    it('renders Globe icon', () => {
      const globeIcons = screen.getAllByTestId('globe-icon');
      expect(globeIcons.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // PIPELINE TAB TESTS
  // ============================================================================

  describe('Pipeline Tab', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<ClientCRM />);
      await user.click(screen.getByRole('button', { name: /pipeline/i }));
    });

    it('renders pipeline stages', () => {
      expect(screen.getByText('Lead')).toBeInTheDocument();
      expect(screen.getByText('Retained')).toBeInTheDocument();
    });

    it('shows same content as dashboard (reused)', () => {
      expect(screen.getByText('Recent Activities')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // NEW INTAKE BUTTON TESTS
  // ============================================================================

  describe('New Intake Button', () => {
    it('renders with UserPlus icon', () => {
      render(<ClientCRM />);

      const newIntakeButton = screen.getByRole('button', { name: /new intake/i });
      expect(newIntakeButton).toBeInTheDocument();
      expect(screen.getByTestId('user-plus-icon')).toBeInTheDocument();
    });

    it('has correct styling', () => {
      render(<ClientCRM />);

      const newIntakeButton = screen.getByRole('button', { name: /new intake/i });
      expect(newIntakeButton).toHaveClass('bg-blue-600', 'text-white');
    });
  });

  // ============================================================================
  // TAB ICONS TESTS
  // ============================================================================

  describe('Tab Icons', () => {
    it('renders BarChart2 icon for Dashboard tab', () => {
      render(<ClientCRM />);
      expect(screen.getByTestId('bar-chart-icon')).toBeInTheDocument();
    });

    it('renders Users icon for Client Directory tab', () => {
      render(<ClientCRM />);
      const userIcons = screen.getAllByTestId('users-icon');
      expect(userIcons.length).toBeGreaterThan(0);
    });

    it('renders Briefcase icon for Pipeline tab', () => {
      render(<ClientCRM />);
      expect(screen.getByTestId('briefcase-icon')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // RESPONSIVE LAYOUT TESTS
  // ============================================================================

  describe('Responsive Layout', () => {
    it('uses responsive flex layout for header', () => {
      render(<ClientCRM />);

      const header = screen.getByRole('heading', { name: /client relationships/i }).closest('.flex');
      expect(header).toHaveClass('flex-col', 'sm:flex-row');
    });

    it('uses responsive grid for pipeline cards', () => {
      render(<ClientCRM />);

      const pipelineGrid = screen.getByText('Lead').closest('.grid');
      expect(pipelineGrid).toHaveClass('md:grid-cols-4');
    });
  });

  // ============================================================================
  // DARK MODE TESTS
  // ============================================================================

  describe('Dark Mode Support', () => {
    it('applies dark mode classes to title', () => {
      render(<ClientCRM />);

      const title = screen.getByRole('heading', { name: /client relationships/i });
      expect(title).toHaveClass('dark:text-white');
    });

    it('applies dark mode classes to pipeline cards', () => {
      render(<ClientCRM />);

      const card = screen.getByText('Lead').closest('.dark\\:bg-slate-800');
      expect(card).toBeInTheDocument();
    });

    it('applies dark mode classes to tab buttons', () => {
      render(<ClientCRM />);

      const dashboardTab = screen.getByRole('button', { name: /dashboard/i });
      expect(dashboardTab).toHaveClass('dark:text-blue-400');
    });
  });
});
