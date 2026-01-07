/**
 * @fileoverview Enterprise-grade tests for Sidebar component
 * @module components/layout/Sidebar.test
 *
 * Tests navigation rendering, collapsible sections, active states, and user profile.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from './Sidebar';

// ============================================================================
// MOCKS
// ============================================================================

// Mock next/navigation
const mockPathname = jest.fn(() => '/dashboard');
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  BarChart3: () => <svg data-testid="bar-chart-icon" />,
  Calendar: () => <svg data-testid="calendar-icon" />,
  ChevronDown: () => <svg data-testid="chevron-down-icon" />,
  DollarSign: () => <svg data-testid="dollar-sign-icon" />,
  FileSearch: () => <svg data-testid="file-search-icon" />,
  Folder: () => <svg data-testid="folder-icon" />,
  Lock: () => <svg data-testid="lock-icon" />,
  LogOut: () => <svg data-testid="logout-icon" />,
  Scale: () => <svg data-testid="scale-icon" />,
  Settings: () => <svg data-testid="settings-icon" />,
  Users: () => <svg data-testid="users-icon" />,
  Zap: () => <svg data-testid="zap-icon" />,
}));

// ============================================================================
// BASIC RENDERING TESTS
// ============================================================================

describe('Sidebar', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/dashboard');
  });

  describe('Basic Rendering', () => {
    it('renders aside element', () => {
      render(<Sidebar />);
      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('renders LexiFlow logo text', () => {
      render(<Sidebar />);
      expect(screen.getByText('LexiFlow')).toBeInTheDocument();
    });

    it('renders AI Legal Suite tagline', () => {
      render(<Sidebar />);
      expect(screen.getByText('AI Legal Suite')).toBeInTheDocument();
    });

    it('renders logo initials', () => {
      render(<Sidebar />);
      expect(screen.getByText('LF')).toBeInTheDocument();
    });

    it('renders navigation element', () => {
      render(<Sidebar />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // NAVIGATION ITEMS TESTS
  // ============================================================================

  describe('Navigation Items', () => {
    it('renders Dashboard link', () => {
      render(<Sidebar />);
      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    });

    it('Dashboard link has correct href', () => {
      render(<Sidebar />);
      expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
    });

    it('renders Case Management section', () => {
      render(<Sidebar />);
      expect(screen.getByRole('button', { name: /case management/i })).toBeInTheDocument();
    });

    it('renders Documents & Discovery section', () => {
      render(<Sidebar />);
      expect(screen.getByRole('button', { name: /documents & discovery/i })).toBeInTheDocument();
    });

    it('renders Legal Operations section', () => {
      render(<Sidebar />);
      expect(screen.getByRole('button', { name: /legal operations/i })).toBeInTheDocument();
    });

    it('renders Firm Operations section', () => {
      render(<Sidebar />);
      expect(screen.getByRole('button', { name: /firm operations/i })).toBeInTheDocument();
    });

    it('renders Settings link', () => {
      render(<Sidebar />);
      expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
    });

    it('Settings link has correct href', () => {
      render(<Sidebar />);
      expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('href', '/settings');
    });
  });

  // ============================================================================
  // COLLAPSIBLE SECTIONS TESTS
  // ============================================================================

  describe('Collapsible Sections', () => {
    it('expands Case Management section when clicked', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);

      await user.click(screen.getByRole('button', { name: /case management/i }));

      expect(screen.getByRole('link', { name: /^cases$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /matters/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /parties/i })).toBeInTheDocument();
    });

    it('expands Documents & Discovery section when clicked', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);

      await user.click(screen.getByRole('button', { name: /documents & discovery/i }));

      expect(screen.getByRole('link', { name: /documents/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /docket/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /discovery/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /evidence/i })).toBeInTheDocument();
    });

    it('expands Legal Operations section when clicked', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);

      await user.click(screen.getByRole('button', { name: /legal operations/i }));

      expect(screen.getByRole('link', { name: /research/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /calendar/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /compliance/i })).toBeInTheDocument();
    });

    it('expands Firm Operations section when clicked', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);

      await user.click(screen.getByRole('button', { name: /firm operations/i }));

      expect(screen.getByRole('link', { name: /billing/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /contacts/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /analytics/i })).toBeInTheDocument();
    });

    it('collapses expanded section when clicked again', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);

      await user.click(screen.getByRole('button', { name: /case management/i }));
      expect(screen.getByRole('link', { name: /^cases$/i })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /case management/i }));
      expect(screen.queryByRole('link', { name: /^cases$/i })).not.toBeInTheDocument();
    });

    it('can have multiple sections expanded', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);

      await user.click(screen.getByRole('button', { name: /case management/i }));
      await user.click(screen.getByRole('button', { name: /firm operations/i }));

      expect(screen.getByRole('link', { name: /^cases$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /billing/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // CHILD NAVIGATION LINKS TESTS
  // ============================================================================

  describe('Child Navigation Links', () => {
    it('Cases link has correct href', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);

      await user.click(screen.getByRole('button', { name: /case management/i }));

      expect(screen.getByRole('link', { name: /^cases$/i })).toHaveAttribute('href', '/cases');
    });

    it('Matters link has correct href', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);

      await user.click(screen.getByRole('button', { name: /case management/i }));

      expect(screen.getByRole('link', { name: /matters/i })).toHaveAttribute('href', '/matters');
    });

    it('Documents link has correct href', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);

      await user.click(screen.getByRole('button', { name: /documents & discovery/i }));

      expect(screen.getByRole('link', { name: /documents/i })).toHaveAttribute('href', '/documents');
    });
  });

  // ============================================================================
  // USER PROFILE TESTS
  // ============================================================================

  describe('User Profile', () => {
    it('renders user initials', () => {
      render(<Sidebar />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('renders user name', () => {
      render(<Sidebar />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders user role', () => {
      render(<Sidebar />);
      expect(screen.getByText('Senior Attorney')).toBeInTheDocument();
    });

    it('renders connection status', () => {
      render(<Sidebar />);
      expect(screen.getByText(/connected.*active/i)).toBeInTheDocument();
    });

    it('renders Logout button', () => {
      render(<Sidebar />);
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });

    it('renders logout icon', () => {
      render(<Sidebar />);
      expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ACTIVE STATE TESTS
  // ============================================================================

  describe('Active State', () => {
    it('highlights Dashboard when on /dashboard', () => {
      mockPathname.mockReturnValue('/dashboard');
      render(<Sidebar />);

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).toHaveClass('bg-blue-50', 'text-blue-600');
    });

    it('highlights Settings when on /settings', () => {
      mockPathname.mockReturnValue('/settings');
      render(<Sidebar />);

      const settingsLink = screen.getByRole('link', { name: /settings/i });
      expect(settingsLink).toHaveClass('bg-blue-50', 'text-blue-600');
    });

    it('highlights child link when on child route', async () => {
      mockPathname.mockReturnValue('/cases');
      const user = userEvent.setup();
      render(<Sidebar />);

      await user.click(screen.getByRole('button', { name: /case management/i }));

      const casesLink = screen.getByRole('link', { name: /^cases$/i });
      expect(casesLink).toHaveClass('bg-blue-50', 'text-blue-600');
    });
  });

  // ============================================================================
  // ICONS TESTS
  // ============================================================================

  describe('Icons', () => {
    it('renders BarChart icon for Dashboard', () => {
      render(<Sidebar />);
      expect(screen.getAllByTestId('bar-chart-icon').length).toBeGreaterThan(0);
    });

    it('renders Scale icon for Case Management', () => {
      render(<Sidebar />);
      expect(screen.getAllByTestId('scale-icon').length).toBeGreaterThan(0);
    });

    it('renders Folder icon for Documents & Discovery', () => {
      render(<Sidebar />);
      expect(screen.getAllByTestId('folder-icon').length).toBeGreaterThan(0);
    });

    it('renders Zap icon for Legal Operations', () => {
      render(<Sidebar />);
      expect(screen.getByTestId('zap-icon')).toBeInTheDocument();
    });

    it('renders DollarSign icon for Firm Operations', () => {
      render(<Sidebar />);
      expect(screen.getAllByTestId('dollar-sign-icon').length).toBeGreaterThan(0);
    });

    it('renders Settings icon', () => {
      render(<Sidebar />);
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    });

    it('renders ChevronDown icons for collapsible sections', () => {
      render(<Sidebar />);
      expect(screen.getAllByTestId('chevron-down-icon').length).toBe(4);
    });
  });

  // ============================================================================
  // STYLING TESTS
  // ============================================================================

  describe('Styling', () => {
    it('sidebar has correct width', () => {
      render(<Sidebar />);
      const aside = screen.getByRole('complementary');
      expect(aside).toHaveClass('w-64');
    });

    it('sidebar has border-right', () => {
      render(<Sidebar />);
      const aside = screen.getByRole('complementary');
      expect(aside).toHaveClass('border-r');
    });

    it('sidebar is hidden on mobile', () => {
      render(<Sidebar />);
      const aside = screen.getByRole('complementary');
      expect(aside).toHaveClass('hidden', 'lg:flex');
    });

    it('logo section has gradient background', () => {
      render(<Sidebar />);
      const logoSection = screen.getByText('LexiFlow').closest('div.h-16');
      expect(logoSection).toHaveClass('bg-linear-to-r');
    });

    it('logout button has red text color', () => {
      render(<Sidebar />);
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton).toHaveClass('text-red-600');
    });
  });

  // ============================================================================
  // DARK MODE TESTS
  // ============================================================================

  describe('Dark Mode Support', () => {
    it('applies dark mode classes to sidebar', () => {
      render(<Sidebar />);
      const aside = screen.getByRole('complementary');
      expect(aside).toHaveClass('dark:bg-slate-950', 'dark:border-slate-800');
    });

    it('applies dark mode classes to logo text', () => {
      render(<Sidebar />);
      const logoText = screen.getByText('LexiFlow');
      expect(logoText).toHaveClass('dark:text-slate-50');
    });

    it('applies dark mode classes to user name', () => {
      render(<Sidebar />);
      const userName = screen.getByText('John Doe');
      expect(userName).toHaveClass('dark:text-slate-50');
    });

    it('applies dark mode classes to logout button', () => {
      render(<Sidebar />);
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton).toHaveClass('dark:text-red-400', 'dark:hover:bg-red-950/20');
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================

  describe('Accessibility', () => {
    it('uses semantic aside element', () => {
      render(<Sidebar />);
      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('uses semantic nav element', () => {
      render(<Sidebar />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('all top-level links have href attributes', () => {
      render(<Sidebar />);
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      const settingsLink = screen.getByRole('link', { name: /settings/i });

      expect(dashboardLink).toHaveAttribute('href');
      expect(settingsLink).toHaveAttribute('href');
    });

    it('collapsible buttons are keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);

      const caseManagementButton = screen.getByRole('button', { name: /case management/i });
      caseManagementButton.focus();

      await user.keyboard('{Enter}');

      expect(screen.getByRole('link', { name: /^cases$/i })).toBeInTheDocument();
    });
  });
});
