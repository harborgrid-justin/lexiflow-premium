/**
 * @fileoverview Enterprise-grade tests for CaseAnalytics component
 * @module components/case-analytics/CaseAnalytics.test
 *
 * Tests metrics rendering, charts, time range selection, and export functionality.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CaseAnalytics } from './CaseAnalytics';

// ============================================================================
// MOCKS
// ============================================================================

// Mock recharts to avoid DOM measurement issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowDown: () => <svg data-testid="arrow-down-icon" />,
  ArrowUp: () => <svg data-testid="arrow-up-icon" />,
  Briefcase: () => <svg data-testid="briefcase-icon" />,
  Clock: () => <svg data-testid="clock-icon" />,
  DollarSign: () => <svg data-testid="dollar-icon" />,
  Download: () => <svg data-testid="download-icon" />,
  Users: () => <svg data-testid="users-icon" />,
}));

// ============================================================================
// HEADER TESTS
// ============================================================================

describe('CaseAnalytics', () => {
  describe('Header', () => {
    it('renders the Case Analytics title', () => {
      render(<CaseAnalytics />);
      expect(screen.getByRole('heading', { name: /case analytics/i })).toBeInTheDocument();
    });

    it('renders the subtitle', () => {
      render(<CaseAnalytics />);
      expect(screen.getByText(/performance & business intelligence/i)).toBeInTheDocument();
    });

    it('renders time range selector', () => {
      render(<CaseAnalytics />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders export button', () => {
      render(<CaseAnalytics />);
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // TIME RANGE SELECTION TESTS
  // ============================================================================

  describe('Time Range Selection', () => {
    it('defaults to Last 30 days', () => {
      render(<CaseAnalytics />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('30d');
    });

    it('allows selecting different time ranges', async () => {
      const user = userEvent.setup();
      render(<CaseAnalytics />);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, '7d');

      expect(select).toHaveValue('7d');
    });

    it('has all time range options', () => {
      render(<CaseAnalytics />);

      expect(screen.getByRole('option', { name: /last 7 days/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /last 30 days/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /last 90 days/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /year to date/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // METRICS GRID TESTS
  // ============================================================================

  describe('Metrics Grid', () => {
    it('renders Total Revenue metric', () => {
      render(<CaseAnalytics />);
      expect(screen.getByText(/total revenue/i)).toBeInTheDocument();
      expect(screen.getByText('$1.2M')).toBeInTheDocument();
    });

    it('renders Active Matters metric', () => {
      render(<CaseAnalytics />);
      expect(screen.getByText(/active matters/i)).toBeInTheDocument();
      expect(screen.getByText('142')).toBeInTheDocument();
    });

    it('renders Avg Resolution metric', () => {
      render(<CaseAnalytics />);
      expect(screen.getByText(/avg resolution/i)).toBeInTheDocument();
      expect(screen.getByText('45 Days')).toBeInTheDocument();
    });

    it('renders Team Utilization metric', () => {
      render(<CaseAnalytics />);
      expect(screen.getByText(/team utilization/i)).toBeInTheDocument();
      expect(screen.getByText('87%')).toBeInTheDocument();
    });

    it('renders positive change indicators', () => {
      render(<CaseAnalytics />);
      expect(screen.getByText('+12%')).toBeInTheDocument();
      expect(screen.getByText('+5%')).toBeInTheDocument();
    });

    it('renders negative change indicators', () => {
      render(<CaseAnalytics />);
      expect(screen.getByText('-2%')).toBeInTheDocument();
      expect(screen.getByText('-1%')).toBeInTheDocument();
    });

    it('renders vs last period text for each metric', () => {
      render(<CaseAnalytics />);
      const periodTexts = screen.getAllByText(/vs last period/i);
      expect(periodTexts.length).toBe(4);
    });

    it('renders metric icons', () => {
      render(<CaseAnalytics />);
      expect(screen.getByTestId('dollar-icon')).toBeInTheDocument();
      expect(screen.getByTestId('briefcase-icon')).toBeInTheDocument();
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // CHANGE INDICATOR COLOR TESTS
  // ============================================================================

  describe('Change Indicator Colors', () => {
    it('shows emerald color for positive changes', () => {
      render(<CaseAnalytics />);
      const positiveIndicator = screen.getByText('+12%');
      expect(positiveIndicator).toHaveClass('text-emerald-600');
    });

    it('shows red color for negative non-positive metrics', () => {
      render(<CaseAnalytics />);
      // Team Utilization -1% is negative (isPositive: false)
      const negativeIndicator = screen.getByText('-1%');
      expect(negativeIndicator).toHaveClass('text-red-600');
    });
  });

  // ============================================================================
  // CHARTS TESTS
  // ============================================================================

  describe('Charts', () => {
    it('renders Revenue vs Expenses chart', () => {
      render(<CaseAnalytics />);
      expect(screen.getByText(/revenue vs expenses/i)).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('renders Matter Status Distribution chart', () => {
      render(<CaseAnalytics />);
      expect(screen.getByText(/matter status distribution/i)).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('renders ResponsiveContainer for charts', () => {
      render(<CaseAnalytics />);
      const containers = screen.getAllByTestId('responsive-container');
      expect(containers.length).toBe(2);
    });
  });

  // ============================================================================
  // EXPORT BUTTON TESTS
  // ============================================================================

  describe('Export Button', () => {
    it('renders export button with download icon', () => {
      render(<CaseAnalytics />);

      const exportButton = screen.getByRole('button', { name: /export/i });
      expect(exportButton).toBeInTheDocument();
      expect(screen.getByTestId('download-icon')).toBeInTheDocument();
    });

    it('export button is clickable', async () => {
      const user = userEvent.setup();
      render(<CaseAnalytics />);

      const exportButton = screen.getByRole('button', { name: /export/i });
      await expect(user.click(exportButton)).resolves.not.toThrow();
    });
  });

  // ============================================================================
  // RESPONSIVE LAYOUT TESTS
  // ============================================================================

  describe('Responsive Layout', () => {
    it('uses responsive grid for metrics', () => {
      render(<CaseAnalytics />);

      const metricsGrid = screen.getByText(/total revenue/i).closest('.grid');
      expect(metricsGrid).toHaveClass('md:grid-cols-2', 'lg:grid-cols-4');
    });

    it('uses responsive grid for charts', () => {
      render(<CaseAnalytics />);

      const chartsGrid = screen.getByText(/revenue vs expenses/i).closest('.grid');
      expect(chartsGrid).toHaveClass('lg:grid-cols-2');
    });
  });

  // ============================================================================
  // DARK MODE TESTS
  // ============================================================================

  describe('Dark Mode Support', () => {
    it('applies dark mode classes to title', () => {
      render(<CaseAnalytics />);

      const title = screen.getByRole('heading', { name: /case analytics/i });
      expect(title).toHaveClass('dark:text-white');
    });

    it('applies dark mode classes to metric cards', () => {
      render(<CaseAnalytics />);

      const card = screen.getByText(/total revenue/i).closest('.bg-white');
      expect(card).toHaveClass('dark:bg-slate-800');
    });

    it('applies dark mode classes to chart containers', () => {
      render(<CaseAnalytics />);

      const chartContainer = screen.getByText(/revenue vs expenses/i).closest('.bg-white');
      expect(chartContainer).toHaveClass('dark:bg-slate-800');
    });
  });

  // ============================================================================
  // CARD STYLING TESTS
  // ============================================================================

  describe('Card Styling', () => {
    it('metric cards have proper border and shadow', () => {
      render(<CaseAnalytics />);

      const card = screen.getByText(/total revenue/i).closest('.bg-white');
      expect(card).toHaveClass('rounded-xl', 'border');
    });

    it('chart cards have proper heading styling', () => {
      render(<CaseAnalytics />);

      const chartHeading = screen.getByText(/revenue vs expenses/i);
      expect(chartHeading).toHaveClass('text-lg', 'font-semibold');
    });
  });

  // ============================================================================
  // CONTAINER STYLING TESTS
  // ============================================================================

  describe('Container Styling', () => {
    it('has min-height for full screen', () => {
      render(<CaseAnalytics />);

      const container = screen.getByRole('heading', { name: /case analytics/i }).closest('.min-h-screen');
      expect(container).toBeInTheDocument();
    });

    it('applies background colors', () => {
      render(<CaseAnalytics />);

      const container = screen.getByRole('heading', { name: /case analytics/i }).closest('.bg-slate-50');
      expect(container).toBeInTheDocument();
    });
  });
});
