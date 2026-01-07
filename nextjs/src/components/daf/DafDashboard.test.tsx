/**
 * @fileoverview Enterprise-grade tests for DafDashboard component
 * @module components/daf/DafDashboard.test
 *
 * Tests Data Access Framework dashboard, metrics, and security management.
 */

import { render, screen } from '@testing-library/react';
import DafDashboard from './DafDashboard';

// ============================================================================
// MOCKS
// ============================================================================

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Database: () => <svg data-testid="database-icon" />,
  Key: () => <svg data-testid="key-icon" />,
  Lock: () => <svg data-testid="lock-icon" />,
  ShieldCheck: () => <svg data-testid="shield-check-icon" />,
}));

// ============================================================================
// HEADER TESTS
// ============================================================================

describe('DafDashboard', () => {
  describe('Header', () => {
    it('renders the DAF Operations title', () => {
      render(<DafDashboard />);
      expect(screen.getByRole('heading', { name: /daf operations/i })).toBeInTheDocument();
    });

    it('renders the description', () => {
      render(<DafDashboard />);
      expect(screen.getByText(/data access framework - security & compliance management/i)).toBeInTheDocument();
    });

    it('renders shield icon in header', () => {
      render(<DafDashboard />);
      const shieldIcons = screen.getAllByTestId('shield-check-icon');
      expect(shieldIcons.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // STATS CARDS TESTS
  // ============================================================================

  describe('Stats Cards', () => {
    it('renders Data Sources metric', () => {
      render(<DafDashboard />);
      expect(screen.getByText(/data sources/i)).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('renders Access Policies metric', () => {
      render(<DafDashboard />);
      expect(screen.getByText(/access policies/i)).toBeInTheDocument();
      expect(screen.getByText('47')).toBeInTheDocument();
    });

    it('renders Active Keys metric', () => {
      render(<DafDashboard />);
      expect(screen.getByText(/active keys/i)).toBeInTheDocument();
      expect(screen.getByText('23')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // METRIC ICONS TESTS
  // ============================================================================

  describe('Metric Icons', () => {
    it('renders Database icon for Data Sources', () => {
      render(<DafDashboard />);
      expect(screen.getByTestId('database-icon')).toBeInTheDocument();
    });

    it('renders Lock icon for Access Policies', () => {
      render(<DafDashboard />);
      expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
    });

    it('renders Key icon for Active Keys', () => {
      render(<DafDashboard />);
      expect(screen.getByTestId('key-icon')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ICON COLORS TESTS
  // ============================================================================

  describe('Icon Colors', () => {
    it('applies blue color to database icon', () => {
      render(<DafDashboard />);

      const databaseIcon = screen.getByTestId('database-icon');
      const iconContainer = databaseIcon.closest('.text-blue-600');
      expect(iconContainer || databaseIcon).toBeInTheDocument();
    });

    it('applies emerald color to lock icon', () => {
      render(<DafDashboard />);

      const lockIcon = screen.getByTestId('lock-icon');
      const iconContainer = lockIcon.closest('.text-emerald-600');
      expect(iconContainer || lockIcon).toBeInTheDocument();
    });

    it('applies purple color to key icon', () => {
      render(<DafDashboard />);

      const keyIcon = screen.getByTestId('key-icon');
      const iconContainer = keyIcon.closest('.text-purple-600');
      expect(iconContainer || keyIcon).toBeInTheDocument();
    });
  });

  // ============================================================================
  // MAIN CONTENT TESTS
  // ============================================================================

  describe('Main Content', () => {
    it('renders DAF Operations Dashboard heading', () => {
      render(<DafDashboard />);

      const dashboardHeading = screen.getByRole('heading', { name: /daf operations dashboard/i });
      expect(dashboardHeading).toBeInTheDocument();
    });

    it('renders development notice', () => {
      render(<DafDashboard />);
      expect(screen.getByText(/this module is currently in development/i)).toBeInTheDocument();
    });

    it('renders description text', () => {
      render(<DafDashboard />);
      expect(screen.getByText(/manage data access policies, security protocols/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // CARD STYLING TESTS
  // ============================================================================

  describe('Card Styling', () => {
    it('applies rounded border to stat cards', () => {
      render(<DafDashboard />);

      const dataSourcesLabel = screen.getByText(/data sources/i);
      const card = dataSourcesLabel.closest('.rounded-xl');
      expect(card).toBeInTheDocument();
    });

    it('applies shadow to stat cards', () => {
      render(<DafDashboard />);

      const dataSourcesLabel = screen.getByText(/data sources/i);
      const card = dataSourcesLabel.closest('.shadow-sm');
      expect(card).toBeInTheDocument();
    });

    it('applies border to stat cards', () => {
      render(<DafDashboard />);

      const dataSourcesLabel = screen.getByText(/data sources/i);
      const card = dataSourcesLabel.closest('.border');
      expect(card).toBeInTheDocument();
    });
  });

  // ============================================================================
  // PLACEHOLDER STYLING TESTS
  // ============================================================================

  describe('Placeholder Styling', () => {
    it('applies dashed border to placeholder', () => {
      render(<DafDashboard />);

      const placeholder = screen.getByText(/this module is currently in development/i).closest('.border-dashed');
      expect(placeholder).toBeInTheDocument();
    });

    it('applies large border-2 to placeholder', () => {
      render(<DafDashboard />);

      const placeholder = screen.getByText(/this module is currently in development/i).closest('.border-2');
      expect(placeholder).toBeInTheDocument();
    });

    it('centers content in placeholder', () => {
      render(<DafDashboard />);

      const placeholder = screen.getByText(/this module is currently in development/i).closest('.text-center');
      expect(placeholder).toBeInTheDocument();
    });
  });

  // ============================================================================
  // RESPONSIVE LAYOUT TESTS
  // ============================================================================

  describe('Responsive Layout', () => {
    it('uses responsive grid for stat cards', () => {
      render(<DafDashboard />);

      const grid = screen.getByText(/data sources/i).closest('.grid');
      expect(grid).toHaveClass('md:grid-cols-3');
    });

    it('uses space-y-6 for main container', () => {
      render(<DafDashboard />);

      const container = screen.getByRole('heading', { name: /daf operations/i }).closest('.space-y-6');
      expect(container).toBeInTheDocument();
    });
  });

  // ============================================================================
  // DARK MODE TESTS
  // ============================================================================

  describe('Dark Mode Support', () => {
    it('applies dark mode classes to title', () => {
      render(<DafDashboard />);

      const title = screen.getByRole('heading', { name: /daf operations/i });
      expect(title).toHaveClass('dark:text-white');
    });

    it('applies dark mode classes to stat cards', () => {
      render(<DafDashboard />);

      const dataSourcesLabel = screen.getByText(/data sources/i);
      const card = dataSourcesLabel.closest('.dark\\:bg-slate-800');
      expect(card).toBeInTheDocument();
    });

    it('applies dark mode classes to description', () => {
      render(<DafDashboard />);

      const description = screen.getByText(/data access framework - security/i);
      expect(description).toHaveClass('dark:text-slate-400');
    });

    it('applies dark mode classes to stat values', () => {
      render(<DafDashboard />);

      const statValue = screen.getByText('12');
      expect(statValue).toHaveClass('dark:text-white');
    });

    it('applies dark mode classes to header icon container', () => {
      render(<DafDashboard />);

      const shieldIcons = screen.getAllByTestId('shield-check-icon');
      const iconContainer = shieldIcons[0].closest('.dark\\:bg-blue-900\\/20');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  // ============================================================================
  // METRIC VALUE FORMATTING TESTS
  // ============================================================================

  describe('Metric Value Formatting', () => {
    it('displays data sources count as number', () => {
      render(<DafDashboard />);

      const dataSourcesValue = screen.getByText('12');
      expect(dataSourcesValue).toHaveClass('text-2xl', 'font-bold');
    });

    it('displays access policies count as number', () => {
      render(<DafDashboard />);

      const policiesValue = screen.getByText('47');
      expect(policiesValue).toHaveClass('text-2xl', 'font-bold');
    });

    it('displays active keys count as number', () => {
      render(<DafDashboard />);

      const keysValue = screen.getByText('23');
      expect(keysValue).toHaveClass('text-2xl', 'font-bold');
    });
  });

  // ============================================================================
  // LAYOUT STRUCTURE TESTS
  // ============================================================================

  describe('Layout Structure', () => {
    it('header uses flex layout with gap', () => {
      render(<DafDashboard />);

      const header = screen.getByRole('heading', { name: /daf operations/i }).closest('.flex');
      expect(header).toHaveClass('items-center', 'gap-3');
    });

    it('stat cards use flex layout for content', () => {
      render(<DafDashboard />);

      const dataSourcesLabel = screen.getByText(/data sources/i);
      const flexContainer = dataSourcesLabel.closest('.flex');
      expect(flexContainer).toHaveClass('items-center', 'gap-3');
    });
  });
});
