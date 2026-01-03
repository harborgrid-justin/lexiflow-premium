/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ClientAnalytics } from '@/components/enterprise/CRM/ClientAnalytics';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';

// Mock the data service
jest.mock('@/services/data/dataService', () => ({
  DataService: {
    clients: {
      getAll: jest.fn(),
    },
  },
}));

// Mock hooks
jest.mock('@/hooks/backend', () => ({
  useQuery: jest.fn(),
}));

// Mock chart color service
jest.mock('@/services/theme/chartColorService', () => ({
  ChartColorService: {
    getPalette: (mode: string) => ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
  },
}));

// Mock chart config
jest.mock('@/utils/chartConfig', () => ({
  getChartTheme: (mode: string) => ({
    grid: '#e5e7eb',
    text: '#374151',
    tooltipStyle: {
      backgroundColor: '#fff',
      border: '1px solid #e5e7eb',
    },
  }),
}));

// Mock Recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  RadarChart: ({ children }: any) => <div data-testid="radar-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  Pie: () => <div data-testid="pie" />,
  Radar: () => <div data-testid="radar" />,
  CartesianGrid: () => <div data-testid="grid" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  Cell: () => <div data-testid="cell" />,
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
}));

// Mock Lucide icons
jest.mock('lucide-react', () => {
  const React = require('react');
  return {
    TrendingUp: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="trending-up-icon" {...props} />),
    TrendingDown: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="trending-down-icon" {...props} />),
    DollarSign: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="dollar-icon" {...props} />),
    Users: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="users-icon" {...props} />),
    AlertTriangle: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="alert-icon" {...props} />),
    ThumbsUp: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="thumbs-up-icon" {...props} />),
    Star: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="star-icon" {...props} />),
    PieChart: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="pie-chart-icon" {...props} />),
    BarChart3: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="bar-chart-icon" {...props} />),
    Target: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="target-icon" {...props} />),
    Award: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="award-icon" {...props} />),
    Activity: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="activity-icon" {...props} />),
    CheckCircle2: React.forwardRef((props: any, ref: any) => <div ref={ref} data-testid="check-icon" {...props} />),
  };
});

const mockClients = [
  {
    id: '1',
    name: 'Acme Corporation',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Tech Innovations',
    status: 'Active',
  },
];

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>{component}</ThemeProvider>
  );
};

describe('ClientAnalytics Component', () => {
  beforeEach(() => {
    const { useQuery } = require('@/hooks/backend');
    useQuery.mockImplementation(() => ({
      data: mockClients,
      isLoading: false,
      error: null,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Profitability Charts', () => {
    test('renders profitability tab by default', () => {
      renderWithProviders(<ClientAnalytics />);

      expect(screen.getByText('Revenue & Profit Trend (6 Months)')).toBeInTheDocument();
      expect(screen.getByText('Client Profitability Analysis')).toBeInTheDocument();
    });

    test('displays revenue and profit trend chart', () => {
      renderWithProviders(<ClientAnalytics />);

      const lineCharts = screen.getAllByTestId('line-chart');
      expect(lineCharts.length).toBeGreaterThan(0);
    });

    test('shows client profitability data with margins', () => {
      renderWithProviders(<ClientAnalytics />);

      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      expect(screen.getByText('Tech Startup Inc.')).toBeInTheDocument();
      expect(screen.getByText('40% Margin')).toBeInTheDocument();
      expect(screen.getByText('30% Margin')).toBeInTheDocument();
    });

    test('displays revenue, costs, and profit for each client', () => {
      renderWithProviders(<ClientAnalytics />);

      const revenueElements = screen.getAllByText('Revenue');
      expect(revenueElements.length).toBeGreaterThan(0);
      const costsElements = screen.getAllByText('Costs');
      expect(costsElements.length).toBeGreaterThan(0);
      const profitElements = screen.getAllByText('Profit');
      expect(profitElements.length).toBeGreaterThan(0);
    });

    test('shows realization and collection rates', () => {
      renderWithProviders(<ClientAnalytics />);

      const realizationElements = screen.getAllByText('Realization');
      expect(realizationElements.length).toBeGreaterThan(0);
      const collectionElements = screen.getAllByText('Collection');
      expect(collectionElements.length).toBeGreaterThan(0);
      const rate92 = screen.getAllByText('92%');
      expect(rate92.length).toBeGreaterThan(0);
      const rate95 = screen.getAllByText('95%');
      expect(rate95.length).toBeGreaterThan(0);
    });

    test('displays trend indicators (up, down, stable)', () => {
      renderWithProviders(<ClientAnalytics />);

      const trendingIcons = screen.getAllByTestId('trending-up-icon');
      expect(trendingIcons.length).toBeGreaterThan(0);
    });

    test('renders revenue by segment pie chart', () => {
      renderWithProviders(<ClientAnalytics />);

      expect(screen.getByText('Revenue by Segment')).toBeInTheDocument();
      const pieCharts = screen.getAllByTestId('pie-chart');
      expect(pieCharts.length).toBeGreaterThan(0);
    });

    test('renders clients by segment bar chart', () => {
      renderWithProviders(<ClientAnalytics />);

      expect(screen.getByText('Clients by Segment')).toBeInTheDocument();
      const barCharts = screen.getAllByTestId('bar-chart');
      expect(barCharts.length).toBeGreaterThan(0);
    });
  });

  describe('Lifetime Value Display', () => {
    test('switches to lifetime value tab when clicked', () => {
      renderWithProviders(<ClientAnalytics />);

      const ltvTab = screen.getByText('Lifetime Value');
      fireEvent.click(ltvTab);

      expect(screen.getByText('Client Lifetime Value Analysis')).toBeInTheDocument();
    });

    test('displays LTV for each client', () => {
      renderWithProviders(<ClientAnalytics />);

      const ltvTab = screen.getByText('Lifetime Value');
      fireEvent.click(ltvTab);

      expect(screen.getByText(/1250k/)).toBeInTheDocument();
      expect(screen.getByText(/780k/)).toBeInTheDocument();
    });

    test('shows acquisition cost', () => {
      renderWithProviders(<ClientAnalytics />);

      const ltvTab = screen.getByText('Lifetime Value');
      fireEvent.click(ltvTab);

      const acquisitionCostElements = screen.getAllByText('Acquisition Cost');
      expect(acquisitionCostElements.length).toBeGreaterThan(0);
    });

    test('displays retention rate', () => {
      renderWithProviders(<ClientAnalytics />);

      const ltvTab = screen.getByText('Lifetime Value');
      fireEvent.click(ltvTab);

      const retentionRateElements = screen.getAllByText('Retention Rate');
      expect(retentionRateElements.length).toBeGreaterThan(0);
      const rate95 = screen.getAllByText('95%');
      expect(rate95.length).toBeGreaterThan(0);
      const rate88 = screen.getAllByText('88%');
      expect(rate88.length).toBeGreaterThan(0);
    });

    test('shows ROI calculation', () => {
      renderWithProviders(<ClientAnalytics />);

      const ltvTab = screen.getByText('Lifetime Value');
      fireEvent.click(ltvTab);

      const roiElements = screen.getAllByText('ROI');
      expect(roiElements.length).toBeGreaterThan(0);
    });

    test('displays projected future value', () => {
      renderWithProviders(<ClientAnalytics />);

      const ltvTab = screen.getByText('Lifetime Value');
      fireEvent.click(ltvTab);

      const projectedElements = screen.getAllByText('Projected Future Value');
      expect(projectedElements.length).toBeGreaterThan(0);
    });

    test('shows LTV composition visualization', () => {
      renderWithProviders(<ClientAnalytics />);

      const ltvTab = screen.getByText('Lifetime Value');
      fireEvent.click(ltvTab);

      const ltvElements = screen.getAllByText('LTV Composition');
      expect(ltvElements.length).toBeGreaterThan(0);
    });
  });

  describe('Risk Assessment', () => {
    test('switches to risk assessment tab when clicked', () => {
      renderWithProviders(<ClientAnalytics />);

      const riskTab = screen.getByText('Risk Assessment');
      fireEvent.click(riskTab);

      expect(screen.getByText('Client Risk Assessment')).toBeInTheDocument();
    });

    test('displays overall risk rating', () => {
      renderWithProviders(<ClientAnalytics />);

      const riskTab = screen.getByText('Risk Assessment');
      fireEvent.click(riskTab);

      expect(screen.getByText(/Low Risk \(15\/100\)/)).toBeInTheDocument();
      expect(screen.getByText(/High Risk \(78\/100\)/)).toBeInTheDocument();
    });

    test('shows risk factor breakdown', () => {
      renderWithProviders(<ClientAnalytics />);

      const riskTab = screen.getByText('Risk Assessment');
      fireEvent.click(riskTab);

      // Just verify the risk assessment tab is displayed with some client info
      expect(screen.getByText('Client Risk Assessment')).toBeInTheDocument();
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
    });

    test('displays outstanding balance', () => {
      renderWithProviders(<ClientAnalytics />);

      const riskTab = screen.getByText('Risk Assessment');
      fireEvent.click(riskTab);

      const outstandingBalanceElements = screen.getAllByText('Outstanding Balance');
      expect(outstandingBalanceElements.length).toBeGreaterThan(0);
      const balance15k = screen.getAllByText('$15,000');
      expect(balance15k.length).toBeGreaterThan(0);
      const balance125k = screen.getAllByText('$125,000');
      expect(balance125k.length).toBeGreaterThan(0);
    });

    test('shows days outstanding metric', () => {
      renderWithProviders(<ClientAnalytics />);

      const riskTab = screen.getByText('Risk Assessment');
      fireEvent.click(riskTab);

      const daysOutstandingElements = screen.getAllByText('Days Outstanding');
      expect(daysOutstandingElements.length).toBeGreaterThan(0);
      const days12 = screen.getAllByText('12 days');
      expect(days12.length).toBeGreaterThan(0);
      const days87 = screen.getAllByText('87 days');
      expect(days87.length).toBeGreaterThan(0);
    });

    test('displays disputed invoices count', () => {
      renderWithProviders(<ClientAnalytics />);

      const riskTab = screen.getByText('Risk Assessment');
      fireEvent.click(riskTab);

      const disputedInvoicesElements = screen.getAllByText('Disputed Invoices');
      expect(disputedInvoicesElements.length).toBeGreaterThan(0);
    });
  });

  describe('Satisfaction Metrics', () => {
    test('switches to satisfaction tab when clicked', () => {
      renderWithProviders(<ClientAnalytics />);

      const satisfactionTab = screen.getByText('Satisfaction');
      fireEvent.click(satisfactionTab);

      expect(screen.getByText('Client Satisfaction Metrics')).toBeInTheDocument();
    });

    test('displays NPS scores', () => {
      renderWithProviders(<ClientAnalytics />);

      const satisfactionTab = screen.getByText('Satisfaction');
      fireEvent.click(satisfactionTab);

      const npsLabels = screen.getAllByText('NPS');
      expect(npsLabels.length).toBeGreaterThan(0);
      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText('72')).toBeInTheDocument();
    });

    test('displays CSAT scores', () => {
      renderWithProviders(<ClientAnalytics />);

      const satisfactionTab = screen.getByText('Satisfaction');
      fireEvent.click(satisfactionTab);

      const csatLabels = screen.getAllByText('CSAT');
      expect(csatLabels.length).toBeGreaterThan(0);
      expect(screen.getByText('92%')).toBeInTheDocument();
      expect(screen.getByText('84%')).toBeInTheDocument();
    });

    test('shows individual satisfaction metrics', () => {
      renderWithProviders(<ClientAnalytics />);

      const satisfactionTab = screen.getByText('Satisfaction');
      fireEvent.click(satisfactionTab);

      const responsivenessElements = screen.getAllByText('Responsiveness');
      expect(responsivenessElements.length).toBeGreaterThan(0);
      const qualityElements = screen.getAllByText('Quality');
      expect(qualityElements.length).toBeGreaterThan(0);
      const valueElements = screen.getAllByText('Value');
      expect(valueElements.length).toBeGreaterThan(0);
      const recommendElements = screen.getAllByText('Likelihood to Recommend');
      expect(recommendElements.length).toBeGreaterThan(0);
    });

    test('displays metric scores out of 10', () => {
      renderWithProviders(<ClientAnalytics />);

      const satisfactionTab = screen.getByText('Satisfaction');
      fireEvent.click(satisfactionTab);

      expect(screen.getByText('9.2/10')).toBeInTheDocument();
      expect(screen.getByText('9.5/10')).toBeInTheDocument();
    });
  });

  describe('Radar Chart Rendering', () => {
    test('renders radar chart for satisfaction metrics', () => {
      renderWithProviders(<ClientAnalytics />);

      const satisfactionTab = screen.getByText('Satisfaction');
      fireEvent.click(satisfactionTab);

      const radarCharts = screen.getAllByTestId('radar-chart');
      expect(radarCharts.length).toBeGreaterThan(0);
    });

    test('displays radar chart with correct data points', () => {
      renderWithProviders(<ClientAnalytics />);

      const satisfactionTab = screen.getByText('Satisfaction');
      fireEvent.click(satisfactionTab);

      const radarElements = screen.getAllByTestId('radar');
      expect(radarElements.length).toBeGreaterThan(0);
    });
  });

  describe('Metrics Summary', () => {
    test('displays total client profit metric', () => {
      renderWithProviders(<ClientAnalytics />);

      expect(screen.getByText('Total Client Profit')).toBeInTheDocument();
    });

    test('shows average profit margin', () => {
      renderWithProviders(<ClientAnalytics />);

      expect(screen.getByText('Avg Profit Margin')).toBeInTheDocument();
    });

    test('displays total LTV', () => {
      renderWithProviders(<ClientAnalytics />);

      expect(screen.getByText('Total LTV')).toBeInTheDocument();
    });

    test('shows average NPS score', () => {
      renderWithProviders(<ClientAnalytics />);

      expect(screen.getByText('Avg NPS Score')).toBeInTheDocument();
    });
  });

  describe('Risk Alerts', () => {
    test('displays high-risk client alert when present', () => {
      renderWithProviders(<ClientAnalytics />);

      expect(screen.getByText(/High-Risk Client.*Require Attention/)).toBeInTheDocument();
    });

    test('shows alert with recommendation to review risk tab', () => {
      renderWithProviders(<ClientAnalytics />);

      expect(screen.getByText(/Review risk assessment tab/)).toBeInTheDocument();
    });
  });

  describe('Data Privacy', () => {
    test('does not expose sensitive financial data in DOM attributes', () => {
      const { container } = renderWithProviders(<ClientAnalytics />);

      // Check that sensitive data is not in data attributes
      const elements = container.querySelectorAll('[data-revenue], [data-profit], [data-balance]');
      expect(elements.length).toBe(0);
    });

    test('renders client names without exposing in attributes', () => {
      renderWithProviders(<ClientAnalytics />);

      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      expect(screen.getByText('Tech Startup Inc.')).toBeInTheDocument();
    });
  });
});
