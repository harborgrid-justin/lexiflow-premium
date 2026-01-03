/**
 * @jest-environment jsdom
 * @module __tests__/components/enterprise/dashboard/EnterpriseDashboard
 * @description Comprehensive Jest unit tests for EnterpriseDashboard component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EnterpriseDashboard, EnterpriseDashboardProps } from '@/components/enterprise/EnterpriseDashboard';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';

// ============================================================================
// MOCKS
// ============================================================================

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children, height }: any) => (
    <div data-testid="responsive-container" style={{ height }}>{children}</div>
  ),
  AreaChart: ({ children, data }: any) => (
    <div data-testid="area-chart" data-chart-data={JSON.stringify(data)}>{children}</div>
  ),
  Area: (props: any) => <div data-testid="area" {...props} />,
  BarChart: ({ children, data, layout }: any) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)} data-layout={layout}>{children}</div>
  ),
  Bar: (props: any) => <div data-testid="bar" {...props} />,
  LineChart: ({ children, data }: any) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>{children}</div>
  ),
  Line: (props: any) => <div data-testid="line" {...props} />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: (props: any) => <div data-testid="pie" {...props} />,
  Cell: (props: any) => <div data-testid="cell" {...props} />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  XAxis: (props: any) => <div data-testid="x-axis" {...props} />,
  YAxis: (props: any) => <div data-testid="y-axis" {...props} />,
  Tooltip: (props: any) => <div data-testid="tooltip" {...props} />,
  Legend: () => <div data-testid="legend" />,
}));

// Mock KPICard component
jest.mock('@/components/dashboard/widgets/KPICard', () => ({
  KPICard: ({ label, value, format, color, isLoading, target }: any) => (
    <div data-testid={`kpi-card-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <span data-testid="kpi-label">{label}</span>
      <span data-testid="kpi-value">{value}</span>
      <span data-testid="kpi-format">{format}</span>
      <span data-testid="kpi-color">{color}</span>
      {isLoading && <span data-testid="kpi-loading">Loading...</span>}
      {target && <span data-testid="kpi-target">{target}</span>}
    </div>
  ),
}));

// Mock ActivityFeed component
jest.mock('@/components/dashboard/widgets/ActivityFeed', () => ({
  ActivityFeed: ({ activities, isLoading, maxItems, showAvatars }: any) => (
    <div data-testid="activity-feed">
      <span data-testid="activity-count">{activities?.length || 0}</span>
      <span data-testid="activity-max-items">{maxItems}</span>
      <span data-testid="activity-show-avatars">{showAvatars ? 'true' : 'false'}</span>
      {isLoading && <span data-testid="activity-loading">Loading...</span>}
      {activities?.map((activity: any, index: number) => (
        <div key={activity.id} data-testid={`activity-item-${index}`}>
          {activity.title}
        </div>
      ))}
    </div>
  ),
}));

// Mock ChartCard component
jest.mock('@/components/dashboard/widgets/ChartCard', () => ({
  ChartCard: ({ title, subtitle, icon, isLoading, onRefresh, height, children }: any) => (
    <div data-testid={`chart-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <h3 data-testid="chart-title">{title}</h3>
      <p data-testid="chart-subtitle">{subtitle}</p>
      <div data-testid="chart-height" style={{ height }}>{children}</div>
      {isLoading && <span data-testid="chart-loading">Loading...</span>}
      {onRefresh && (
        <button onClick={onRefresh} data-testid="chart-refresh-btn">Refresh Chart</button>
      )}
    </div>
  ),
}));

// ============================================================================
// TEST WRAPPER
// ============================================================================

const renderWithTheme = (ui: React.ReactElement, theme: 'light' | 'dark' = 'light') => {
  return render(
    <ThemeProvider initialTheme={theme}>
      {ui}
    </ThemeProvider>
  );
};

// ============================================================================
// TEST SUITE
// ============================================================================

describe('EnterpriseDashboard', () => {
  const defaultProps: EnterpriseDashboardProps = {
    userId: 'test-user-123',
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // RENDERING TESTS
  // ==========================================================================

  describe('Component Rendering', () => {
    test('renders dashboard header with title and description', () => {
      renderWithTheme(<EnterpriseDashboard {...defaultProps} />);

      expect(screen.getByText('Executive Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Comprehensive business intelligence and performance insights')).toBeInTheDocument();
    });

    test('renders all four KPI cards with correct data', () => {
      renderWithTheme(<EnterpriseDashboard {...defaultProps} />);

      // Check all KPI cards are rendered
      expect(screen.getByTestId('kpi-card-matters-opened')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-card-total-revenue')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-card-billable-hours')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-card-collection-rate')).toBeInTheDocument();
    });

    test('renders KPI cards with correct values and formats', () => {
      renderWithTheme(<EnterpriseDashboard {...defaultProps} />);

      const mattersCard = screen.getByTestId('kpi-card-matters-opened');
      expect(within(mattersCard).getByTestId('kpi-value')).toHaveTextContent('47');
      expect(within(mattersCard).getByTestId('kpi-format')).toHaveTextContent('number');
      expect(within(mattersCard).getByTestId('kpi-color')).toHaveTextContent('blue');
      expect(within(mattersCard).getByTestId('kpi-target')).toHaveTextContent('50');
    });

    test('renders revenue overview chart with correct data', () => {
      renderWithTheme(<EnterpriseDashboard {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-revenue-overview');
      expect(chartCard).toBeInTheDocument();
      expect(within(chartCard).getByTestId('chart-title')).toHaveTextContent('Revenue Overview');
      expect(within(chartCard).getByTestId('chart-subtitle')).toHaveTextContent('Monthly revenue, target, and collections');

      const areaChart = within(chartCard).getByTestId('area-chart');
      expect(areaChart).toBeInTheDocument();
    });

    test('renders case pipeline chart with all stages', () => {
      renderWithTheme(<EnterpriseDashboard {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-case-pipeline');
      expect(chartCard).toBeInTheDocument();
      expect(within(chartCard).getByTestId('chart-title')).toHaveTextContent('Case Pipeline');

      const barChart = within(chartCard).getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');

      expect(chartData).toHaveLength(6);
      expect(chartData.map((d: any) => d.stage)).toEqual([
        'Lead', 'Consultation', 'Retained', 'Active', 'Settlement', 'Trial'
      ]);
    });

    test('renders team performance metrics chart', () => {
      renderWithTheme(<EnterpriseDashboard {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-team-performance');
      expect(chartCard).toBeInTheDocument();
      expect(within(chartCard).getByTestId('chart-title')).toHaveTextContent('Team Performance');

      const barChart = within(chartCard).getByTestId('bar-chart');
      expect(barChart).toHaveAttribute('data-layout', 'vertical');
    });

    test('renders financial summary widget with all metrics', () => {
      renderWithTheme(<EnterpriseDashboard {...defaultProps} />);

      expect(screen.getByText('Financial Summary')).toBeInTheDocument();
      // Use getAllByText for text that appears multiple times (in KPI cards and Financial Summary)
      expect(screen.getAllByText('Total Revenue').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Collected')).toBeInTheDocument();
      expect(screen.getByText('Outstanding AR')).toBeInTheDocument();
      expect(screen.getByText('Realization Rate')).toBeInTheDocument();
      expect(screen.getAllByText('Collection Rate').length).toBeGreaterThanOrEqual(1);
    });

    test('renders activity feed with correct configuration', () => {
      renderWithTheme(<EnterpriseDashboard {...defaultProps} />);

      const activityFeed = screen.getByTestId('activity-feed');
      expect(activityFeed).toBeInTheDocument();
      expect(within(activityFeed).getByTestId('activity-count')).toHaveTextContent('5');
      expect(within(activityFeed).getByTestId('activity-max-items')).toHaveTextContent('5');
      expect(within(activityFeed).getByTestId('activity-show-avatars')).toHaveTextContent('false');
    });

    test('renders quick stats widgets', () => {
      renderWithTheme(<EnterpriseDashboard {...defaultProps} />);

      expect(screen.getByText('Win Rate')).toBeInTheDocument();
      expect(screen.getByText('87.5%')).toBeInTheDocument();
      expect(screen.getByText('Utilization')).toBeInTheDocument();
      expect(screen.getByText('76.4%')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // TIMEFRAME SELECTOR TESTS
  // ==========================================================================

  describe('Timeframe Selector', () => {
    test('renders all timeframe options', () => {
      renderWithTheme(<EnterpriseDashboard {...defaultProps} />);

      expect(screen.getByRole('button', { name: /week/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /month/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /quarter/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /year/i })).toBeInTheDocument();
    });

    test('defaults to month timeframe', () => {
      renderWithTheme(<EnterpriseDashboard {...defaultProps} />);

      const monthButton = screen.getByRole('button', { name: /month/i });
      expect(monthButton).toHaveClass('bg-white');
      expect(monthButton).toHaveClass('text-blue-600');
    });

    test('changes timeframe when button is clicked', () => {
      renderWithTheme(<EnterpriseDashboard {...defaultProps} />);

      const weekButton = screen.getByRole('button', { name: /week/i });
      const monthButton = screen.getByRole('button', { name: /month/i });

      // Initially month is selected
      expect(monthButton).toHaveClass('bg-white');

      // Click week
      fireEvent.click(weekButton);

      // Week should now be selected
      expect(weekButton).toHaveClass('bg-white');
      expect(weekButton).toHaveClass('text-blue-600');
    });

    test('allows switching between all timeframes', () => {
      renderWithTheme(<EnterpriseDashboard {...defaultProps} />);

      const weekButton = screen.getByRole('button', { name: /week/i });
      const quarterButton = screen.getByRole('button', { name: /quarter/i });
      const yearButton = screen.getByRole('button', { name: /year/i });

      fireEvent.click(weekButton);
      expect(weekButton).toHaveClass('bg-white');

      fireEvent.click(quarterButton);
      expect(quarterButton).toHaveClass('bg-white');

      fireEvent.click(yearButton);
      expect(yearButton).toHaveClass('bg-white');
    });
  });

  // ==========================================================================
  // REFRESH FUNCTIONALITY TESTS
  // ==========================================================================

  describe('Refresh Functionality', () => {
    test('renders refresh button when onRefresh is provided', () => {
      const onRefresh = jest.fn();
      renderWithTheme(<EnterpriseDashboard {...defaultProps} onRefresh={onRefresh} />);

      const refreshButtons = screen.getAllByTitle('Refresh data');
      expect(refreshButtons.length).toBeGreaterThan(0);
    });

    test('calls onRefresh when refresh button is clicked', () => {
      const onRefresh = jest.fn();
      renderWithTheme(<EnterpriseDashboard {...defaultProps} onRefresh={onRefresh} />);

      const refreshButton = screen.getByTitle('Refresh data');
      fireEvent.click(refreshButton);

      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    test('disables refresh button when loading', () => {
      const onRefresh = jest.fn();
      renderWithTheme(<EnterpriseDashboard {...defaultProps} isLoading={true} onRefresh={onRefresh} />);

      const refreshButton = screen.getByTitle('Refresh data');
      expect(refreshButton).toBeDisabled();
    });

    test('shows spin animation on refresh button when loading', () => {
      const onRefresh = jest.fn();
      renderWithTheme(<EnterpriseDashboard {...defaultProps} isLoading={true} onRefresh={onRefresh} />);

      const refreshButton = screen.getByTitle('Refresh data');
      expect(refreshButton).toHaveClass('animate-spin');
    });

    test('does not render refresh button when onRefresh is not provided', () => {
      renderWithTheme(<EnterpriseDashboard {...defaultProps} />);

      const refreshButton = screen.queryByTitle('Refresh data');
      expect(refreshButton).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // ACTION BUTTONS TESTS
  // ==========================================================================

  describe('Action Buttons', () => {
    test('renders configure widgets button when handler is provided', () => {
      const onConfigureWidgets = jest.fn();
      renderWithTheme(<EnterpriseDashboard {...defaultProps} onConfigureWidgets={onConfigureWidgets} />);

      const configureButton = screen.getByTitle('Configure widgets');
      expect(configureButton).toBeInTheDocument();
    });

    test('calls onConfigureWidgets when configure button is clicked', () => {
      const onConfigureWidgets = jest.fn();
      renderWithTheme(<EnterpriseDashboard {...defaultProps} onConfigureWidgets={onConfigureWidgets} />);

      const configureButton = screen.getByTitle('Configure widgets');
      fireEvent.click(configureButton);

      expect(onConfigureWidgets).toHaveBeenCalledTimes(1);
    });

    test('renders export button when handler is provided', () => {
      const onExport = jest.fn();
      renderWithTheme(<EnterpriseDashboard {...defaultProps} onExport={onExport} />);

      const exportButton = screen.getByRole('button', { name: /export/i });
      expect(exportButton).toBeInTheDocument();
    });

    test('calls onExport when export button is clicked', () => {
      const onExport = jest.fn();
      renderWithTheme(<EnterpriseDashboard {...defaultProps} onExport={onExport} />);

      const exportButton = screen.getByRole('button', { name: /export/i });
      fireEvent.click(exportButton);

      expect(onExport).toHaveBeenCalledTimes(1);
    });

    test('does not render action buttons when handlers are not provided', () => {
      renderWithTheme(<EnterpriseDashboard {...defaultProps} />);

      expect(screen.queryByTitle('Configure widgets')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /export/i })).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // LOADING STATE TESTS
  // ==========================================================================

  describe('Loading State', () => {
    test('passes isLoading prop to KPI cards', () => {
      renderWithTheme(<EnterpriseDashboard {...defaultProps} isLoading={true} />);

      const kpiCard = screen.getByTestId('kpi-card-matters-opened');
      expect(within(kpiCard).getByTestId('kpi-loading')).toBeInTheDocument();
    });

    test('passes isLoading prop to chart cards', () => {
      renderWithTheme(<EnterpriseDashboard {...defaultProps} isLoading={true} />);

      const chartCard = screen.getByTestId('chart-card-revenue-overview');
      expect(within(chartCard).getByTestId('chart-loading')).toBeInTheDocument();
    });

    test('passes isLoading prop to activity feed', () => {
      renderWithTheme(<EnterpriseDashboard {...defaultProps} isLoading={true} />);

      const activityFeed = screen.getByTestId('activity-feed');
      expect(within(activityFeed).getByTestId('activity-loading')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // ERROR STATE TESTS
  // ==========================================================================

  describe('Error State', () => {
    test('renders error state when error prop is provided', () => {
      const errorMessage = 'Failed to load dashboard data';
      renderWithTheme(<EnterpriseDashboard {...defaultProps} error={errorMessage} />);

      expect(screen.getByText('Failed to Load Dashboard')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    test('renders try again button in error state when onRefresh is provided', () => {
      const onRefresh = jest.fn();
      renderWithTheme(<EnterpriseDashboard {...defaultProps} error="Error occurred" onRefresh={onRefresh} />);

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      expect(tryAgainButton).toBeInTheDocument();
    });

    test('calls onRefresh when try again button is clicked', () => {
      const onRefresh = jest.fn();
      renderWithTheme(<EnterpriseDashboard {...defaultProps} error="Error occurred" onRefresh={onRefresh} />);

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(tryAgainButton);

      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    test('does not render dashboard content when error is present', () => {
      renderWithTheme(<EnterpriseDashboard {...defaultProps} error="Error occurred" />);

      expect(screen.queryByText('Executive Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByTestId('kpi-card-matters-opened')).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // DARK MODE TESTS
  // ==========================================================================

  describe('Dark Mode Theming', () => {
    test('renders correctly in light mode', () => {
      renderWithTheme(<EnterpriseDashboard {...defaultProps} />, 'light');

      expect(screen.getByText('Executive Dashboard')).toBeInTheDocument();
    });

    test('renders correctly in dark mode', () => {
      renderWithTheme(<EnterpriseDashboard {...defaultProps} />, 'dark');

      expect(screen.getByText('Executive Dashboard')).toBeInTheDocument();
    });

    test('applies dark mode classes to timeframe selector', () => {
      renderWithTheme(<EnterpriseDashboard {...defaultProps} />, 'dark');

      const monthButton = screen.getByRole('button', { name: /month/i });
      expect(monthButton).toHaveClass('dark:bg-gray-700');
    });
  });

  // ==========================================================================
  // RESPONSIVE BEHAVIOR TESTS
  // ==========================================================================

  describe('Responsive Behavior', () => {
    test('renders KPI cards in responsive grid', () => {
      const { container } = renderWithTheme(<EnterpriseDashboard {...defaultProps} />);

      const kpiGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
      expect(kpiGrid).toBeInTheDocument();
    });

    test('renders main content in responsive grid layout', () => {
      const { container } = renderWithTheme(<EnterpriseDashboard {...defaultProps} />);

      const mainGrid = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-3');
      expect(mainGrid).toBeInTheDocument();
    });

    test('applies responsive classes to header actions', () => {
      const { container } = renderWithTheme(<EnterpriseDashboard {...defaultProps} />);

      const headerActions = container.querySelector('.flex.flex-wrap');
      expect(headerActions).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // PROPS TESTS
  // ==========================================================================

  describe('Props Handling', () => {
    test('applies custom className when provided', () => {
      const { container } = renderWithTheme(<EnterpriseDashboard {...defaultProps} className="custom-class" />);

      const dashboard = container.querySelector('.custom-class');
      expect(dashboard).toBeInTheDocument();
    });

    test('handles userId prop', () => {
      const userId = 'user-abc-123';
      renderWithTheme(<EnterpriseDashboard {...defaultProps} userId={userId} />);

      // Component should render successfully with userId
      expect(screen.getByText('Executive Dashboard')).toBeInTheDocument();
    });

    test('handles dateRange prop', () => {
      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31'),
      };
      renderWithTheme(<EnterpriseDashboard {...defaultProps} dateRange={dateRange} />);

      // Component should render successfully with dateRange
      expect(screen.getByText('Executive Dashboard')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // ACTIVITY FEED TESTS
  // ==========================================================================

  describe('Activity Feed Updates', () => {
    test('displays recent activity section', () => {
      renderWithTheme(<EnterpriseDashboard {...defaultProps} />);

      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    test('shows activity items from mock data', () => {
      renderWithTheme(<EnterpriseDashboard {...defaultProps} />);

      const activityFeed = screen.getByTestId('activity-feed');
      expect(within(activityFeed).getByTestId('activity-count')).toHaveTextContent('5');
    });

    test('limits activity feed to 5 items', () => {
      renderWithTheme(<EnterpriseDashboard {...defaultProps} />);

      const activityFeed = screen.getByTestId('activity-feed');
      expect(within(activityFeed).getByTestId('activity-max-items')).toHaveTextContent('5');
    });
  });
});
