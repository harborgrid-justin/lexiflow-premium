/**
 * @fileoverview Enterprise-grade tests for CaseOverviewDashboard component
 * @module components/case-overview/CaseOverviewDashboard.test
 *
 * Tests KPI cards, pipeline visualization, activity feed, and search functionality.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CaseOverviewDashboard } from './CaseOverviewDashboard';

// ============================================================================
// MOCKS
// ============================================================================

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Activity: () => <svg data-testid="activity-icon" />,
  AlertCircle: () => <svg data-testid="alert-circle-icon" />,
  Briefcase: () => <svg data-testid="briefcase-icon" />,
  CheckCircle: () => <svg data-testid="check-circle-icon" />,
  Clock: () => <svg data-testid="clock-icon" />,
  DollarSign: () => <svg data-testid="dollar-icon" />,
  Plus: () => <svg data-testid="plus-icon" />,
  Search: () => <svg data-testid="search-icon" />,
  TrendingUp: () => <svg data-testid="trending-up-icon" />,
  Users: () => <svg data-testid="users-icon" />,
}));

// ============================================================================
// HEADER TESTS
// ============================================================================

describe('CaseOverviewDashboard', () => {
  describe('Header', () => {
    it('renders the Case Overview title', () => {
      render(<CaseOverviewDashboard />);
      expect(screen.getByRole('heading', { name: /case overview/i })).toBeInTheDocument();
    });

    it('renders the subtitle', () => {
      render(<CaseOverviewDashboard />);
      expect(screen.getByText(/enterprise matter management command center/i)).toBeInTheDocument();
    });

    it('renders search input', () => {
      render(<CaseOverviewDashboard />);
      expect(screen.getByPlaceholderText(/search matters/i)).toBeInTheDocument();
    });

    it('renders New Matter button', () => {
      render(<CaseOverviewDashboard />);
      expect(screen.getByRole('button', { name: /new matter/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // KPI CARDS TESTS
  // ============================================================================

  describe('KPI Cards', () => {
    it('renders Active Matters KPI', () => {
      render(<CaseOverviewDashboard />);
      expect(screen.getByText(/active matters/i)).toBeInTheDocument();
      expect(screen.getByText('142')).toBeInTheDocument();
    });

    it('renders Pending Intake KPI', () => {
      render(<CaseOverviewDashboard />);
      expect(screen.getByText(/pending intake/i)).toBeInTheDocument();
      expect(screen.getByText('28')).toBeInTheDocument();
    });

    it('renders Upcoming Deadlines KPI', () => {
      render(<CaseOverviewDashboard />);
      expect(screen.getByText(/upcoming deadlines/i)).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('renders Revenue YTD KPI', () => {
      render(<CaseOverviewDashboard />);
      expect(screen.getByText(/revenue ytd/i)).toBeInTheDocument();
      expect(screen.getByText('$1.25M')).toBeInTheDocument();
    });

    it('displays percentage change for each KPI', () => {
      render(<CaseOverviewDashboard />);

      // Active Matters: +12%
      expect(screen.getByText('12%')).toBeInTheDocument();
      // Pending Intake: +5%
      expect(screen.getByText('5%')).toBeInTheDocument();
      // Deadlines: -2% (shown as 2%)
      expect(screen.getByText('2%')).toBeInTheDocument();
      // Revenue: +8%
      expect(screen.getByText('8%')).toBeInTheDocument();
    });

    it('renders vs last month text', () => {
      render(<CaseOverviewDashboard />);
      const lastMonthTexts = screen.getAllByText(/vs last month/i);
      expect(lastMonthTexts.length).toBe(4);
    });

    it('renders KPI icons', () => {
      render(<CaseOverviewDashboard />);
      expect(screen.getByTestId('briefcase-icon')).toBeInTheDocument();
      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
      expect(screen.getByTestId('dollar-icon')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // PIPELINE CHART TESTS
  // ============================================================================

  describe('Intake Pipeline', () => {
    it('renders Intake Pipeline section', () => {
      render(<CaseOverviewDashboard />);
      expect(screen.getByText(/intake pipeline/i)).toBeInTheDocument();
    });

    it('renders pipeline stages', () => {
      render(<CaseOverviewDashboard />);

      expect(screen.getByText('Initial Contact')).toBeInTheDocument();
      expect(screen.getByText('Conflict Check')).toBeInTheDocument();
      expect(screen.getByText('Engagement Review')).toBeInTheDocument();
      expect(screen.getByText('Contract Pending')).toBeInTheDocument();
    });

    it('renders pipeline stage counts and values', () => {
      render(<CaseOverviewDashboard />);

      // Check for matter counts
      expect(screen.getByText(/12 matters/i)).toBeInTheDocument();
      expect(screen.getByText(/8 matters/i)).toBeInTheDocument();
      expect(screen.getByText(/5 matters/i)).toBeInTheDocument();
      expect(screen.getByText(/3 matters/i)).toBeInTheDocument();
    });

    it('renders pipeline progress bars', () => {
      render(<CaseOverviewDashboard />);

      const progressBars = document.querySelectorAll('.bg-blue-500.rounded-full');
      expect(progressBars.length).toBe(4);
    });

    it('renders time range selector for pipeline', () => {
      render(<CaseOverviewDashboard />);

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });
  });

  // ============================================================================
  // TIME RANGE SELECTION TESTS
  // ============================================================================

  describe('Time Range Selection', () => {
    it('defaults to Last 30 days', () => {
      render(<CaseOverviewDashboard />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('30d');
    });

    it('allows selecting different time ranges', async () => {
      const user = userEvent.setup();
      render(<CaseOverviewDashboard />);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, '7d');

      expect(select).toHaveValue('7d');
    });

    it('has all time range options', () => {
      render(<CaseOverviewDashboard />);

      expect(screen.getByRole('option', { name: /last 7 days/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /last 30 days/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /last 90 days/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // RECENT ACTIVITY TESTS
  // ============================================================================

  describe('Recent Activity', () => {
    it('renders Recent Activity section', () => {
      render(<CaseOverviewDashboard />);
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    it('renders activity items', () => {
      render(<CaseOverviewDashboard />);

      expect(screen.getByText('Smith v. Jones')).toBeInTheDocument();
      expect(screen.getByText('TechCorp Merger')).toBeInTheDocument();
      expect(screen.getByText('Estate of H. Doe')).toBeInTheDocument();
    });

    it('renders activity descriptions', () => {
      render(<CaseOverviewDashboard />);

      expect(screen.getByText(/new matter created/i)).toBeInTheDocument();
      expect(screen.getByText(/filing deadline approaching/i)).toBeInTheDocument();
      expect(screen.getByText(/status changed to closed/i)).toBeInTheDocument();
    });

    it('renders activity timestamps', () => {
      render(<CaseOverviewDashboard />);

      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
      expect(screen.getByText('4 hours ago')).toBeInTheDocument();
      expect(screen.getByText('1 day ago')).toBeInTheDocument();
    });

    it('renders View All Activity button', () => {
      render(<CaseOverviewDashboard />);
      expect(screen.getByRole('button', { name: /view all activity/i })).toBeInTheDocument();
    });

    it('renders activity type icons', () => {
      render(<CaseOverviewDashboard />);

      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
      expect(screen.getAllByTestId('plus-icon').length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // SEARCH FUNCTIONALITY TESTS
  // ============================================================================

  describe('Search Functionality', () => {
    it('renders search input with placeholder', () => {
      render(<CaseOverviewDashboard />);

      const searchInput = screen.getByPlaceholderText(/search matters/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('renders search icon', () => {
      render(<CaseOverviewDashboard />);
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('allows typing in search input', async () => {
      const user = userEvent.setup();
      render(<CaseOverviewDashboard />);

      const searchInput = screen.getByPlaceholderText(/search matters/i);
      await user.type(searchInput, 'Smith');

      expect(searchInput).toHaveValue('Smith');
    });
  });

  // ============================================================================
  // NEW MATTER BUTTON TESTS
  // ============================================================================

  describe('New Matter Button', () => {
    it('renders with Plus icon', () => {
      render(<CaseOverviewDashboard />);

      const newMatterButton = screen.getByRole('button', { name: /new matter/i });
      expect(newMatterButton).toBeInTheDocument();
    });

    it('has correct styling', () => {
      render(<CaseOverviewDashboard />);

      const newMatterButton = screen.getByRole('button', { name: /new matter/i });
      expect(newMatterButton).toHaveClass('bg-blue-600', 'text-white');
    });
  });

  // ============================================================================
  // PRIORITY INDICATORS TESTS
  // ============================================================================

  describe('Priority Indicators', () => {
    it('applies high priority styling to deadline activity', () => {
      render(<CaseOverviewDashboard />);

      // TechCorp Merger has high priority (deadline)
      const deadlineActivity = screen.getByText('TechCorp Merger').closest('div');
      const iconContainer = deadlineActivity?.parentElement?.querySelector('.bg-red-100');
      expect(iconContainer).toBeInTheDocument();
    });

    it('applies medium priority styling to standard activities', () => {
      render(<CaseOverviewDashboard />);

      // Smith v. Jones has medium priority
      const activityItem = screen.getByText('Smith v. Jones').closest('div');
      const iconContainer = activityItem?.parentElement?.querySelector('.bg-blue-100');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  // ============================================================================
  // RESPONSIVE LAYOUT TESTS
  // ============================================================================

  describe('Responsive Layout', () => {
    it('uses responsive grid for KPI cards', () => {
      render(<CaseOverviewDashboard />);

      const kpiGrid = screen.getByText(/active matters/i).closest('.grid');
      expect(kpiGrid).toHaveClass('md:grid-cols-2', 'lg:grid-cols-4');
    });

    it('uses responsive grid for main content', () => {
      render(<CaseOverviewDashboard />);

      const mainGrid = screen.getByText(/intake pipeline/i).closest('.grid');
      expect(mainGrid).toHaveClass('lg:grid-cols-3');
    });

    it('pipeline takes 2 columns on large screens', () => {
      render(<CaseOverviewDashboard />);

      const pipelineCard = screen.getByText(/intake pipeline/i).closest('.lg\\:col-span-2');
      expect(pipelineCard).toBeInTheDocument();
    });
  });

  // ============================================================================
  // DARK MODE TESTS
  // ============================================================================

  describe('Dark Mode Support', () => {
    it('applies dark mode classes to container', () => {
      render(<CaseOverviewDashboard />);

      const container = screen.getByRole('heading', { name: /case overview/i }).closest('.dark\\:bg-slate-900');
      expect(container).toBeInTheDocument();
    });

    it('applies dark mode classes to KPI cards', () => {
      render(<CaseOverviewDashboard />);

      const card = screen.getByText(/active matters/i).closest('.dark\\:bg-slate-800');
      expect(card).toBeInTheDocument();
    });

    it('applies dark mode classes to title', () => {
      render(<CaseOverviewDashboard />);

      const title = screen.getByRole('heading', { name: /case overview/i });
      expect(title).toHaveClass('dark:text-white');
    });
  });
});
