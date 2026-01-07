/**
 * @fileoverview Enterprise-grade tests for DiscoveryPlatform component
 * @module components/discovery/DiscoveryPlatform.test
 *
 * Tests discovery request management, tab navigation, and legal holds.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DiscoveryPlatform from './DiscoveryPlatform';

// ============================================================================
// MOCKS
// ============================================================================

// Mock the providers
jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: 'bg-white', highlight: 'bg-gray-50' },
      text: { primary: 'text-gray-900', secondary: 'text-gray-600', tertiary: 'text-gray-400' },
      border: { default: 'border-gray-200' },
    },
  }),
}));

// Mock Button component
jest.mock('@/components/ui/atoms/Button/Button', () => ({
  Button: ({ children, onClick, variant, icon: Icon, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {Icon && <Icon data-testid="button-icon" />}
      {children}
    </button>
  ),
}));

// Mock LazyLoader
jest.mock('@/components/ui/molecules/LazyLoader/LazyLoader', () => ({
  LazyLoader: ({ message }: { message: string }) => <div data-testid="lazy-loader">{message}</div>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Archive: () => <svg data-testid="archive-icon" />,
  Briefcase: () => <svg data-testid="briefcase-icon" />,
  Clock: () => <svg data-testid="clock-icon" />,
  Database: () => <svg data-testid="database-icon" />,
  FileText: () => <svg data-testid="file-text-icon" />,
  History: () => <svg data-testid="history-icon" />,
  LayoutDashboard: () => <svg data-testid="layout-dashboard-icon" />,
  MessageSquare: () => <svg data-testid="message-square-icon" />,
  Plus: () => <svg data-testid="plus-icon" />,
  Shield: () => <svg data-testid="shield-icon" />,
}));

// ============================================================================
// HEADER TESTS
// ============================================================================

describe('DiscoveryPlatform', () => {
  describe('Header', () => {
    it('renders the Discovery Center title', () => {
      render(<DiscoveryPlatform />);
      expect(screen.getByRole('heading', { name: /discovery center/i })).toBeInTheDocument();
    });

    it('renders the description', () => {
      render(<DiscoveryPlatform />);
      expect(screen.getByText(/manage requests, legal holds, and frcp compliance/i)).toBeInTheDocument();
    });

    it('renders Sync Deadlines button', () => {
      render(<DiscoveryPlatform />);
      expect(screen.getByRole('button', { name: /sync deadlines/i })).toBeInTheDocument();
    });

    it('renders Create Request button', () => {
      render(<DiscoveryPlatform />);
      expect(screen.getByRole('button', { name: /create request/i })).toBeInTheDocument();
    });

    it('hides header when caseId is provided', () => {
      render(<DiscoveryPlatform caseId="123" />);
      expect(screen.queryByRole('heading', { name: /discovery center/i })).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // TAB NAVIGATION TESTS
  // ============================================================================

  describe('Tab Navigation', () => {
    it('renders Dashboard tab', () => {
      render(<DiscoveryPlatform />);
      expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument();
    });

    it('renders Requests tab', () => {
      render(<DiscoveryPlatform />);
      expect(screen.getByRole('button', { name: /requests/i })).toBeInTheDocument();
    });

    it('renders Privilege Log tab', () => {
      render(<DiscoveryPlatform />);
      expect(screen.getByRole('button', { name: /privilege log/i })).toBeInTheDocument();
    });

    it('renders Legal Holds tab', () => {
      render(<DiscoveryPlatform />);
      expect(screen.getByRole('button', { name: /legal holds/i })).toBeInTheDocument();
    });

    it('renders ESI tab', () => {
      render(<DiscoveryPlatform />);
      expect(screen.getByRole('button', { name: /esi/i })).toBeInTheDocument();
    });

    it('renders Productions tab', () => {
      render(<DiscoveryPlatform />);
      expect(screen.getByRole('button', { name: /productions/i })).toBeInTheDocument();
    });

    it('renders Depositions tab', () => {
      render(<DiscoveryPlatform />);
      expect(screen.getByRole('button', { name: /depositions/i })).toBeInTheDocument();
    });

    it('renders Timeline tab', () => {
      render(<DiscoveryPlatform />);
      expect(screen.getByRole('button', { name: /timeline/i })).toBeInTheDocument();
    });

    it('defaults to Dashboard tab', () => {
      render(<DiscoveryPlatform />);
      const dashboardTab = screen.getByRole('button', { name: /dashboard/i });
      expect(dashboardTab).toHaveClass('text-blue-600', 'border-b-2', 'border-blue-600');
    });
  });

  // ============================================================================
  // DASHBOARD CONTENT TESTS
  // ============================================================================

  describe('Dashboard Content', () => {
    it('renders Discovery Dashboard heading', () => {
      render(<DiscoveryPlatform />);
      expect(screen.getByRole('heading', { name: /discovery dashboard/i })).toBeInTheDocument();
    });

    it('renders Pending Requests metric', () => {
      render(<DiscoveryPlatform />);
      expect(screen.getByText(/pending requests/i)).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('renders Upcoming Deadlines metric', () => {
      render(<DiscoveryPlatform />);
      expect(screen.getByText(/upcoming deadlines/i)).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renders Active Holds metric', () => {
      render(<DiscoveryPlatform />);
      expect(screen.getByText(/active holds/i)).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders View All Requests button', () => {
      render(<DiscoveryPlatform />);
      expect(screen.getByRole('button', { name: /view all requests/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // TAB SWITCHING TESTS
  // ============================================================================

  describe('Tab Switching', () => {
    it('switches to Requests tab', async () => {
      const user = userEvent.setup();
      render(<DiscoveryPlatform />);

      await user.click(screen.getByRole('button', { name: /requests/i }));

      expect(screen.getByText(/discovery requests/i)).toBeInTheDocument();
    });

    it('switches to Privilege Log tab', async () => {
      const user = userEvent.setup();
      render(<DiscoveryPlatform />);

      await user.click(screen.getByRole('button', { name: /privilege log/i }));

      expect(screen.getByText(/privilege log/i)).toBeInTheDocument();
    });

    it('switches to Legal Holds tab', async () => {
      const user = userEvent.setup();
      render(<DiscoveryPlatform />);

      await user.click(screen.getByRole('button', { name: /legal holds/i }));

      expect(screen.getByText(/legal holds/i)).toBeInTheDocument();
    });

    it('switches to ESI tab', async () => {
      const user = userEvent.setup();
      render(<DiscoveryPlatform />);

      await user.click(screen.getByRole('button', { name: /esi/i }));

      expect(screen.getByText(/esi sources/i)).toBeInTheDocument();
    });

    it('switches to Timeline tab', async () => {
      const user = userEvent.setup();
      render(<DiscoveryPlatform />);

      await user.click(screen.getByRole('button', { name: /timeline/i }));

      // Timeline placeholder
      expect(screen.getByText('Timeline')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // PLACEHOLDER CONTENT TESTS
  // ============================================================================

  describe('Placeholder Content', () => {
    it('shows under construction message for Requests tab', async () => {
      const user = userEvent.setup();
      render(<DiscoveryPlatform />);

      await user.click(screen.getByRole('button', { name: /requests/i }));

      expect(screen.getByText(/component under construction/i)).toBeInTheDocument();
    });

    it('shows under construction message for Productions tab', async () => {
      const user = userEvent.setup();
      render(<DiscoveryPlatform />);

      await user.click(screen.getByRole('button', { name: /productions/i }));

      expect(screen.getByText(/component under construction/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // INITIAL TAB PROP TESTS
  // ============================================================================

  describe('Initial Tab Prop', () => {
    it('starts on specified tab', () => {
      render(<DiscoveryPlatform initialTab="requests" />);
      expect(screen.getByText(/discovery requests/i)).toBeInTheDocument();
    });

    it('starts on holds tab when specified', () => {
      render(<DiscoveryPlatform initialTab="holds" />);
      expect(screen.getByText(/legal holds/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // NAVIGATION FROM DASHBOARD TESTS
  // ============================================================================

  describe('Navigation from Dashboard', () => {
    it('navigates to requests when View All Requests clicked', async () => {
      const user = userEvent.setup();
      render(<DiscoveryPlatform />);

      await user.click(screen.getByRole('button', { name: /view all requests/i }));

      expect(screen.getByText(/discovery requests/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // WIZARD VIEW TESTS
  // ============================================================================

  describe('Wizard Views', () => {
    it('shows back button in wizard views', () => {
      render(<DiscoveryPlatform initialTab="doc_viewer" />);
      expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument();
    });

    it('returns to dashboard when back button clicked', async () => {
      const user = userEvent.setup();
      render(<DiscoveryPlatform initialTab="doc_viewer" />);

      await user.click(screen.getByRole('button', { name: /back to dashboard/i }));

      expect(screen.getByRole('heading', { name: /discovery dashboard/i })).toBeInTheDocument();
    });

    it('hides tab navigation in wizard views', () => {
      render(<DiscoveryPlatform initialTab="production_wizard" />);

      // Tab buttons should not be present
      expect(screen.queryByRole('button', { name: /requests/i })).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // METRIC STYLING TESTS
  // ============================================================================

  describe('Metric Styling', () => {
    it('applies blue color to Pending Requests count', () => {
      render(<DiscoveryPlatform />);

      const pendingCount = screen.getByText('12');
      expect(pendingCount).toHaveClass('text-blue-600');
    });

    it('applies amber color to Upcoming Deadlines count', () => {
      render(<DiscoveryPlatform />);

      const deadlinesCount = screen.getByText('3');
      expect(deadlinesCount).toHaveClass('text-amber-600');
    });

    it('applies emerald color to Active Holds count', () => {
      render(<DiscoveryPlatform />);

      const holdsCount = screen.getByText('5');
      expect(holdsCount).toHaveClass('text-emerald-600');
    });
  });

  // ============================================================================
  // RESPONSIVE LAYOUT TESTS
  // ============================================================================

  describe('Responsive Layout', () => {
    it('uses responsive grid for dashboard metrics', () => {
      render(<DiscoveryPlatform />);

      const metricsGrid = screen.getByText(/pending requests/i).closest('.grid');
      expect(metricsGrid).toHaveClass('md:grid-cols-3');
    });
  });

  // ============================================================================
  // DARK MODE TESTS
  // ============================================================================

  describe('Dark Mode Support', () => {
    it('applies dark mode classes to dashboard cards', () => {
      render(<DiscoveryPlatform />);

      const card = screen.getByText(/pending requests/i).closest('.dark\\:bg-gray-800');
      expect(card).toBeInTheDocument();
    });

    it('applies dark mode classes to container', () => {
      render(<DiscoveryPlatform />);

      const container = screen.getByRole('heading', { name: /discovery dashboard/i }).closest('.dark\\:bg-gray-900');
      expect(container).toBeInTheDocument();
    });
  });
});
