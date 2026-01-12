/**
 * @jest-environment jsdom
 * @module __tests__/components/enterprise/dashboard/AnalyticsWidgets
 * @description Comprehensive Jest unit tests for AnalyticsWidgets component
 */

import { AnalyticsWidgets, AnalyticsWidgetsProps } from '@/components/enterprise/AnalyticsWidgets';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';

// ============================================================================
// MOCKS
// ============================================================================

// Mock analytics service
jest.mock('@/api/intelligence/enterprise-analytics.service', () => ({
  analyticsService: {
    getCaseTrends: jest.fn().mockResolvedValue([
      { month: 'Jan', opened: 15, closed: 12, winRate: 85 },
      { month: 'Feb', opened: 18, closed: 14, winRate: 87 },
      { month: 'Mar', opened: 20, closed: 16, winRate: 86 },
      { month: 'Apr', opened: 17, closed: 15, winRate: 88 },
      { month: 'May', opened: 19, closed: 17, winRate: 89 },
      { month: 'Jun', opened: 22, closed: 18, winRate: 90 },
      { month: 'Jul', opened: 21, closed: 19, winRate: 89 },
      { month: 'Aug', opened: 23, closed: 20, winRate: 91 },
      { month: 'Sep', opened: 20, closed: 18, winRate: 88 },
      { month: 'Oct', opened: 24, closed: 21, winRate: 90 },
      { month: 'Nov', opened: 22, closed: 20, winRate: 89 },
      { month: 'Dec', opened: 25, closed: 22, winRate: 92 },
    ]),
    getBillingTrends: jest.fn().mockResolvedValue([
      { month: 'Jan', billed: 125000, collected: 115000 },
      { month: 'Feb', billed: 135000, collected: 125000 },
      { month: 'Mar', billed: 145000, collected: 135000 },
      { month: 'Apr', billed: 140000, collected: 130000 },
      { month: 'May', billed: 150000, collected: 140000 },
      { month: 'Jun', billed: 160000, collected: 150000 },
    ]),
    getAttorneyUtilization: jest.fn().mockResolvedValue([
      { name: 'John Doe', billable: 160, nonBillable: 20, admin: 10 },
      { name: 'Jane Smith', billable: 150, nonBillable: 25, admin: 15 },
      { name: 'Bob Johnson', billable: 140, nonBillable: 30, admin: 20 },
    ]),
    getClientAcquisition: jest.fn().mockResolvedValue([
      { month: 'Jan', newClients: 5, lostClients: 2, totalActive: 50, retentionRate: 96, ltv: 25000 },
      { month: 'Feb', newClients: 7, lostClients: 1, totalActive: 56, retentionRate: 98, ltv: 26000 },
      { month: 'Mar', newClients: 6, lostClients: 3, totalActive: 59, retentionRate: 95, ltv: 24500 },
    ]),
    getARAgingData: jest.fn().mockResolvedValue([
      { name: 'Current', value: 45000 },
      { name: '1-30 days', value: 25000 },
      { name: '31-60 days', value: 15000 },
      { name: '60+ days', value: 5000 },
    ]),
    getPracticeAreaPerformance: jest.fn().mockResolvedValue([
      { area: 'Corporate', caseLoad: 85, winRate: 90, billable: 88, utilization: 92 },
      { area: 'Litigation', caseLoad: 75, winRate: 85, billable: 82, utilization: 87 },
      { area: 'Real Estate', caseLoad: 65, winRate: 88, billable: 80, utilization: 85 },
    ]),
  },
}));

// Mock Recharts components
jest.mock('recharts', () => {
  const originalModule = jest.requireActual('recharts');

  return {
    ...originalModule,
    ResponsiveContainer: ({ children, height }: any) => (
      <div data-testid="responsive-container" style={{ height }}>{children}</div>
    ),
    LineChart: ({ children, data }: any) => (
      <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>{children}</div>
    ),
    Line: (props: any) => <div data-testid="line" data-key={props.dataKey} {...props} />,
    AreaChart: ({ children, data }: any) => (
      <div data-testid="area-chart" data-chart-data={JSON.stringify(data)}>{children}</div>
    ),
    Area: (props: any) => <div data-testid="area" data-key={props.dataKey} {...props} />,
    BarChart: ({ children, data, layout }: any) => (
      <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)} data-layout={layout}>{children}</div>
    ),
    Bar: (props: any) => <div data-testid="bar" data-key={props.dataKey} data-stack-id={props.stackId} {...props} />,
    PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
    Pie: ({ data, label, dataKey }: any) => (
      <div data-testid="pie" data-key={dataKey} data-chart-data={JSON.stringify(data)}>
        {data && data.map((entry: any, index: number) => (
          <div key={index} data-testid={`pie-cell-${index}`}>
            {label && typeof label === 'function' && label(entry)}
          </div>
        ))}
      </div>
    ),
    Cell: (props: any) => <div data-testid="cell" {...props} />,
    ComposedChart: ({ children, data }: any) => (
      <div data-testid="composed-chart" data-chart-data={JSON.stringify(data)}>{children}</div>
    ),
    RadarChart: ({ children, data }: any) => (
      <div data-testid="radar-chart" data-chart-data={JSON.stringify(data)}>{children}</div>
    ),
    Radar: (props: any) => <div data-testid="radar" data-key={props.dataKey} {...props} />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    XAxis: (props: any) => <div data-testid="x-axis" data-key={props.dataKey} {...props} />,
    YAxis: (props: any) => <div data-testid="y-axis" data-axis-id={props.yAxisId} {...props} />,
    Tooltip: ({ formatter, contentStyle }: any) => (
      <div data-testid="tooltip" data-formatter={formatter ? 'custom' : 'default'}>
        {contentStyle && <span data-testid="tooltip-styled">Styled</span>}
      </div>
    ),
    Legend: () => <div data-testid="legend" />,
    PolarGrid: () => <div data-testid="polar-grid" />,
    PolarAngleAxis: (props: any) => <div data-testid="polar-angle-axis" {...props} />,
    PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
  };
});

// Mock ChartCard component
jest.mock('@/features/dashboard/widgets/ChartCard', () => ({
  ChartCard: ({ title, subtitle, icon, isLoading, onRefresh, height, children }: any) => (
    <div data-testid={`chart-card-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
      <h3 data-testid="chart-title">{title}</h3>
      <p data-testid="chart-subtitle">{subtitle}</p>
      <div data-testid="chart-content" style={{ height }}>{children}</div>
      {isLoading && <span data-testid="chart-loading">Loading...</span>}
      {onRefresh && (
        <button onClick={onRefresh} data-testid="chart-refresh-btn">Refresh</button>
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

describe('AnalyticsWidgets', () => {
  const defaultProps: AnalyticsWidgetsProps = {
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // CASE TRENDS CHART TESTS
  // ==========================================================================

  describe('CaseTrendsChart', () => {
    test('renders case trends chart with correct title and subtitle', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-case-trends');
      expect(chartCard).toBeInTheDocument();
      expect(within(chartCard).getByTestId('chart-title')).toHaveTextContent('Case Trends');
      expect(within(chartCard).getByTestId('chart-subtitle')).toHaveTextContent('Cases opened, closed, and outcomes over time');
    });

    test('renders ComposedChart with case trend data', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-case-trends');
      const composedChart = within(chartCard).getByTestId('composed-chart');

      expect(composedChart).toBeInTheDocument();
      const chartData = JSON.parse(composedChart.getAttribute('data-chart-data') || '[]');
      expect(chartData).toHaveLength(12); // 12 months
    });

    test('displays opened and closed bars in case trends', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-case-trends');
      const bars = within(chartCard).getAllByTestId('bar');

      const openedBar = bars.find(bar => bar.getAttribute('data-key') === 'opened');
      const closedBar = bars.find(bar => bar.getAttribute('data-key') === 'closed');

      expect(openedBar).toBeInTheDocument();
      expect(closedBar).toBeInTheDocument();
    });

    test('displays win rate line in case trends', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-case-trends');
      const lines = within(chartCard).getAllByTestId('line');

      const winRateLine = lines.find(line => line.getAttribute('data-key') === 'winRate');
      expect(winRateLine).toBeInTheDocument();
    });

    test('includes dual Y-axes for case counts and win rate percentage', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-case-trends');
      const yAxes = within(chartCard).getAllByTestId('y-axis');

      expect(yAxes).toHaveLength(2);
      const leftAxis = yAxes.find(axis => axis.getAttribute('data-axis-id') === 'left');
      const rightAxis = yAxes.find(axis => axis.getAttribute('data-axis-id') === 'right');

      expect(leftAxis).toBeInTheDocument();
      expect(rightAxis).toBeInTheDocument();
    });

    test('renders tooltip with custom styling', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-case-trends');
      const tooltip = within(chartCard).getByTestId('tooltip');

      expect(tooltip).toBeInTheDocument();
      expect(within(tooltip).getByTestId('tooltip-styled')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // BILLING TRENDS CHART TESTS
  // ==========================================================================

  describe('BillingTrendsChart', () => {
    test('renders billing and collections chart', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-billing-collections');
      expect(chartCard).toBeInTheDocument();
      expect(within(chartCard).getByTestId('chart-title')).toHaveTextContent('Billing & Collections');
      expect(within(chartCard).getByTestId('chart-subtitle')).toHaveTextContent('Monthly billed vs collected revenue');
    });

    test('renders AreaChart with billing trend data', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-billing-collections');
      const areaChart = within(chartCard).getByTestId('area-chart');

      expect(areaChart).toBeInTheDocument();
      const chartData = JSON.parse(areaChart.getAttribute('data-chart-data') || '[]');
      expect(chartData).toHaveLength(12);
    });

    test('displays billed and collected areas', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-billing-collections');
      const areas = within(chartCard).getAllByTestId('area');

      const billedArea = areas.find(area => area.getAttribute('data-key') === 'billed');
      const collectedArea = areas.find(area => area.getAttribute('data-key') === 'collected');

      expect(billedArea).toBeInTheDocument();
      expect(collectedArea).toBeInTheDocument();
    });

    test('uses currency formatter for tooltip', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-billing-collections');
      const tooltip = within(chartCard).getByTestId('tooltip');

      expect(tooltip).toHaveAttribute('data-formatter', 'custom');
    });

    test('renders AR Aging pie chart', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-ar-aging');
      expect(chartCard).toBeInTheDocument();
      expect(within(chartCard).getByTestId('chart-title')).toHaveTextContent('AR Aging');
    });

    test('displays all AR aging segments', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-ar-aging');
      const pieChart = within(chartCard).getByTestId('pie-chart');
      const pie = within(pieChart).getByTestId('pie');

      const chartData = JSON.parse(pie.getAttribute('data-chart-data') || '[]');
      expect(chartData).toHaveLength(4); // 4 AR aging ranges
      expect(chartData.map((d: any) => d.range)).toEqual([
        '0-30 days',
        '31-60 days',
        '61-90 days',
        '90+ days'
      ]);
    });
  });

  // ==========================================================================
  // ATTORNEY UTILIZATION CHART TESTS
  // ==========================================================================

  describe('AttorneyUtilizationChart', () => {
    test('renders attorney utilization chart', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-attorney-utilization');
      expect(chartCard).toBeInTheDocument();
      expect(within(chartCard).getByTestId('chart-title')).toHaveTextContent('Attorney Utilization');
      expect(within(chartCard).getByTestId('chart-subtitle')).toHaveTextContent('Billable vs non-billable hours breakdown');
    });

    test('renders horizontal bar chart with attorney data', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-attorney-utilization');
      const barChart = within(chartCard).getByTestId('bar-chart');

      expect(barChart).toBeInTheDocument();
      expect(barChart).toHaveAttribute('data-layout', 'horizontal');

      const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');
      expect(chartData).toHaveLength(8); // 8 attorneys
    });

    test('displays stacked bars for billable, non-billable, and admin hours', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-attorney-utilization');
      const bars = within(chartCard).getAllByTestId('bar');

      const billableBar = bars.find(bar => bar.getAttribute('data-key') === 'billable');
      const nonBillableBar = bars.find(bar => bar.getAttribute('data-key') === 'nonBillable');
      const adminBar = bars.find(bar => bar.getAttribute('data-key') === 'admin');

      expect(billableBar).toBeInTheDocument();
      expect(nonBillableBar).toBeInTheDocument();
      expect(adminBar).toBeInTheDocument();
    });

    test('uses stack id for stacked bars', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-attorney-utilization');
      const bars = within(chartCard).getAllByTestId('bar');

      bars.forEach(bar => {
        expect(bar).toHaveAttribute('data-stack-id', 'a');
      });
    });

    test('includes X-axis with angled labels', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-attorney-utilization');
      const xAxis = within(chartCard).getByTestId('x-axis');

      expect(xAxis).toBeInTheDocument();
      expect(xAxis).toHaveAttribute('data-key', 'name');
    });
  });

  // ==========================================================================
  // CLIENT ACQUISITION CHART TESTS
  // ==========================================================================

  describe('ClientAcquisitionChart', () => {
    test('renders client acquisition chart', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-client-acquisition');
      expect(chartCard).toBeInTheDocument();
      expect(within(chartCard).getByTestId('chart-title')).toHaveTextContent('Client Acquisition');
      expect(within(chartCard).getByTestId('chart-subtitle')).toHaveTextContent('New vs lost clients over time');
    });

    test('renders ComposedChart with client acquisition data', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-client-acquisition');
      const composedChart = within(chartCard).getByTestId('composed-chart');

      expect(composedChart).toBeInTheDocument();
      const chartData = JSON.parse(composedChart.getAttribute('data-chart-data') || '[]');
      expect(chartData).toHaveLength(12);
    });

    test('displays new and lost client bars', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-client-acquisition');
      const bars = within(chartCard).getAllByTestId('bar');

      const newClientsBar = bars.find(bar => bar.getAttribute('data-key') === 'newClients');
      const lostClientsBar = bars.find(bar => bar.getAttribute('data-key') === 'lostClients');

      expect(newClientsBar).toBeInTheDocument();
      expect(lostClientsBar).toBeInTheDocument();
    });

    test('displays total active clients line', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-client-acquisition');
      const lines = within(chartCard).getAllByTestId('line');

      const totalActiveLine = lines.find(line => line.getAttribute('data-key') === 'totalActive');
      expect(totalActiveLine).toBeInTheDocument();
    });

    test('renders retention and LTV chart', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-client-retention-ltv');
      expect(chartCard).toBeInTheDocument();
      expect(within(chartCard).getByTestId('chart-title')).toHaveTextContent('Client Retention & LTV');
    });

    test('displays retention rate line and LTV bars', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-client-retention-ltv');
      const composedChart = within(chartCard).getByTestId('composed-chart');

      const bars = within(composedChart).getAllByTestId('bar');
      const lines = within(composedChart).getAllByTestId('line');

      const ltvBar = bars.find(bar => bar.getAttribute('data-key') === 'avgLifetimeValue');
      const retentionLine = lines.find(line => line.getAttribute('data-key') === 'retentionRate');

      expect(ltvBar).toBeInTheDocument();
      expect(retentionLine).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // PRACTICE AREA PERFORMANCE TESTS
  // ==========================================================================

  describe('PracticeAreaPerformance', () => {
    test('renders practice area performance radar chart', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-practice-area-performance');
      expect(chartCard).toBeInTheDocument();
      expect(within(chartCard).getByTestId('chart-title')).toHaveTextContent('Practice Area Performance');
      expect(within(chartCard).getByTestId('chart-subtitle')).toHaveTextContent('Multi-dimensional performance analysis');
    });

    test('renders RadarChart with practice area data', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-practice-area-performance');
      const radarChart = within(chartCard).getByTestId('radar-chart');

      expect(radarChart).toBeInTheDocument();
      const chartData = JSON.parse(radarChart.getAttribute('data-chart-data') || '[]');
      expect(chartData).toHaveLength(6); // 6 practice areas
    });

    test('displays win rate and utilization radars', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-practice-area-performance');
      const radars = within(chartCard).getAllByTestId('radar');

      const winRateRadar = radars.find(radar => radar.getAttribute('data-key') === 'winRate');
      const utilizationRadar = radars.find(radar => radar.getAttribute('data-key') === 'utilizationRate');

      expect(winRateRadar).toBeInTheDocument();
      expect(utilizationRadar).toBeInTheDocument();
    });

    test('includes polar grid and axes', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-practice-area-performance');

      expect(within(chartCard).getByTestId('polar-grid')).toBeInTheDocument();
      expect(within(chartCard).getByTestId('polar-angle-axis')).toBeInTheDocument();
      expect(within(chartCard).getByTestId('polar-radius-axis')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // TOOLTIP INTERACTION TESTS
  // ==========================================================================

  describe('Recharts Tooltip Interactions', () => {
    test('all charts include tooltip component', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const tooltips = screen.getAllByTestId('tooltip');
      expect(tooltips.length).toBeGreaterThan(0);
    });

    test('tooltips have custom styling applied', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const tooltips = screen.getAllByTestId('tooltip');
      tooltips.forEach(tooltip => {
        expect(within(tooltip).getByTestId('tooltip-styled')).toBeInTheDocument();
      });
    });

    test('billing chart tooltip uses custom formatter', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-billing-collections');
      const tooltip = within(chartCard).getByTestId('tooltip');

      expect(tooltip).toHaveAttribute('data-formatter', 'custom');
    });

    test('AR aging chart tooltip uses currency formatter', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-ar-aging');
      const tooltip = within(chartCard).getByTestId('tooltip');

      expect(tooltip).toHaveAttribute('data-formatter', 'custom');
    });

    test('retention chart tooltip uses custom formatter for LTV', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const chartCard = screen.getByTestId('chart-card-client-retention-ltv');
      const tooltip = within(chartCard).getByTestId('tooltip');

      expect(tooltip).toHaveAttribute('data-formatter', 'custom');
    });
  });

  // ==========================================================================
  // WIDGET SELECTION TESTS
  // ==========================================================================

  describe('Widget Selection', () => {
    test('renders all widgets when selectedWidgets is not provided', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      expect(screen.getByTestId('chart-card-case-trends')).toBeInTheDocument();
      expect(screen.getByTestId('chart-card-billing-collections')).toBeInTheDocument();
      expect(screen.getByTestId('chart-card-attorney-utilization')).toBeInTheDocument();
      expect(screen.getByTestId('chart-card-client-acquisition')).toBeInTheDocument();
      expect(screen.getByTestId('chart-card-practice-area-performance')).toBeInTheDocument();
    });

    test('renders all widgets when selectedWidgets is empty array', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} selectedWidgets={[]} />);

      expect(screen.getByTestId('chart-card-case-trends')).toBeInTheDocument();
      expect(screen.getByTestId('chart-card-billing-collections')).toBeInTheDocument();
      expect(screen.getByTestId('chart-card-attorney-utilization')).toBeInTheDocument();
    });

    test('renders only selected widgets when selectedWidgets is provided', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} selectedWidgets={['case-trends', 'billing-trends']} />);

      expect(screen.getByTestId('chart-card-case-trends')).toBeInTheDocument();
      expect(screen.getByTestId('chart-card-billing-collections')).toBeInTheDocument();
      expect(screen.queryByTestId('chart-card-attorney-utilization')).not.toBeInTheDocument();
      expect(screen.queryByTestId('chart-card-client-acquisition')).not.toBeInTheDocument();
    });

    test('hides widgets not in selectedWidgets array', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} selectedWidgets={['attorney-utilization']} />);

      expect(screen.getByTestId('chart-card-attorney-utilization')).toBeInTheDocument();
      expect(screen.queryByTestId('chart-card-case-trends')).not.toBeInTheDocument();
      expect(screen.queryByTestId('chart-card-billing-collections')).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // LOADING STATE TESTS
  // ==========================================================================

  describe('Loading State', () => {
    test('passes isLoading prop to all chart cards', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} isLoading={true} />);

      const chartCards = [
        screen.getByTestId('chart-card-case-trends'),
        screen.getByTestId('chart-card-billing-collections'),
        screen.getByTestId('chart-card-attorney-utilization'),
      ];

      chartCards.forEach(card => {
        expect(within(card).getByTestId('chart-loading')).toBeInTheDocument();
      });
    });

    test('does not show loading state when isLoading is false', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} isLoading={false} />);

      const chartCard = screen.getByTestId('chart-card-case-trends');
      expect(within(chartCard).queryByTestId('chart-loading')).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // REFRESH FUNCTIONALITY TESTS
  // ==========================================================================

  describe('Refresh Functionality', () => {
    test('passes onRefresh to chart cards when provided', () => {
      const onRefresh = jest.fn();
      renderWithTheme(<AnalyticsWidgets {...defaultProps} onRefresh={onRefresh} />);

      const chartCard = screen.getByTestId('chart-card-case-trends');
      const refreshButton = within(chartCard).getByTestId('chart-refresh-btn');

      expect(refreshButton).toBeInTheDocument();
    });

    test('calls onRefresh when chart refresh button is clicked', () => {
      const onRefresh = jest.fn();
      renderWithTheme(<AnalyticsWidgets {...defaultProps} onRefresh={onRefresh} />);

      const chartCard = screen.getByTestId('chart-card-case-trends');
      const refreshButton = within(chartCard).getByTestId('chart-refresh-btn');

      fireEvent.click(refreshButton);
      expect(onRefresh).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================================================
  // DARK MODE TESTS
  // ==========================================================================

  describe('Dark Mode Theming', () => {
    test('renders correctly in light mode', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />, 'light');

      expect(screen.getByTestId('chart-card-case-trends')).toBeInTheDocument();
    });

    test('renders correctly in dark mode', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />, 'dark');

      expect(screen.getByTestId('chart-card-case-trends')).toBeInTheDocument();
    });

    test('all charts render in dark mode', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />, 'dark');

      expect(screen.getByTestId('chart-card-case-trends')).toBeInTheDocument();
      expect(screen.getByTestId('chart-card-billing-collections')).toBeInTheDocument();
      expect(screen.getByTestId('chart-card-attorney-utilization')).toBeInTheDocument();
      expect(screen.getByTestId('chart-card-client-acquisition')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // RESPONSIVE BEHAVIOR TESTS
  // ==========================================================================

  describe('Responsive Behavior', () => {
    test('renders billing trends in responsive grid', () => {
      const { container } = renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const billingGrid = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
      expect(billingGrid).toBeInTheDocument();
    });

    test('renders client acquisition charts in responsive grid', () => {
      const { container } = renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const grids = container.querySelectorAll('.grid.grid-cols-1.lg\\:grid-cols-2');
      expect(grids.length).toBeGreaterThanOrEqual(2); // Billing and Client acquisition grids
    });

    test('charts have responsive container wrappers', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const responsiveContainers = screen.getAllByTestId('responsive-container');
      expect(responsiveContainers.length).toBeGreaterThan(0);
    });

    test('applies appropriate heights to different chart types', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const caseTrendsCard = screen.getByTestId('chart-card-case-trends');
      const caseTrendsContent = within(caseTrendsCard).getByTestId('chart-content');
      expect(caseTrendsContent).toHaveStyle({ height: '350px' });

      const billingCard = screen.getByTestId('chart-card-billing-collections');
      const billingContent = within(billingCard).getByTestId('chart-content');
      expect(billingContent).toHaveStyle({ height: '320px' });
    });
  });

  // ==========================================================================
  // PROPS HANDLING TESTS
  // ==========================================================================

  describe('Props Handling', () => {
    test('applies custom className when provided', () => {
      const { container } = renderWithTheme(<AnalyticsWidgets {...defaultProps} className="custom-analytics" />);

      const analyticsWidget = container.querySelector('.custom-analytics');
      expect(analyticsWidget).toBeInTheDocument();
    });

    test('handles dateRange prop', () => {
      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31'),
      };
      renderWithTheme(<AnalyticsWidgets {...defaultProps} dateRange={dateRange} />);

      // Component should render successfully with dateRange
      expect(screen.getByTestId('chart-card-case-trends')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // LEGEND AND GRID TESTS
  // ==========================================================================

  describe('Chart Elements', () => {
    test('all major charts include legend', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const legends = screen.getAllByTestId('legend');
      expect(legends.length).toBeGreaterThan(5); // Multiple charts have legends
    });

    test('all charts include CartesianGrid or PolarGrid', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const cartesianGrids = screen.getAllByTestId('cartesian-grid');
      const polarGrids = screen.getAllByTestId('polar-grid');

      expect(cartesianGrids.length + polarGrids.length).toBeGreaterThan(5);
    });

    test('charts include appropriate axes', () => {
      renderWithTheme(<AnalyticsWidgets {...defaultProps} />);

      const xAxes = screen.getAllByTestId('x-axis');
      const yAxes = screen.getAllByTestId('y-axis');

      expect(xAxes.length).toBeGreaterThan(0);
      expect(yAxes.length).toBeGreaterThan(0);
    });
  });
});
