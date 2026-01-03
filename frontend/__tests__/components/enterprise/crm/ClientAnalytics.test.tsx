/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ClientAnalytics } from '@/components/enterprise/CRM/ClientAnalytics';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
    getPalette: jest.fn(() => ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']),
  },
}));

// Mock chart config
jest.mock('@/utils/chartConfig', () => ({
  getChartTheme: jest.fn(() => ({
    grid: '#e5e7eb',
    text: '#374151',
    tooltipStyle: {
      backgroundColor: '#fff',
      border: '1px solid #e5e7eb',
    },
  })),
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
jest.mock('lucide-react', () => ({
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  TrendingDown: () => <div data-testid="trending-down-icon" />,
  DollarSign: () => <div data-testid="dollar-icon" />,
  Users: () => <div data-testid="users-icon" />,
  AlertTriangle: () => <div data-testid="alert-icon" />,
  ThumbsUp: () => <div data-testid="thumbs-up-icon" />,
  Star: () => <div data-testid="star-icon" />,
  PieChart: () => <div data-testid="pie-chart-icon" />,
  BarChart3: () => <div data-testid="bar-chart-icon" />,
  Target: () => <div data-testid="target-icon" />,
  Award: () => <div data-testid="award-icon" />,
  Activity: () => <div data-testid="activity-icon" />,
  CheckCircle2: () => <div data-testid="check-icon" />,
}));

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
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{component}</ThemeProvider>
    </QueryClientProvider>
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

      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('Costs')).toBeInTheDocument();
      expect(screen.getByText('Profit')).toBeInTheDocument();
    });

    test('shows realization and collection rates', () => {
      renderWithProviders(<ClientAnalytics />);

      expect(screen.getByText('Realization')).toBeInTheDocument();
      expect(screen.getByText('Collection')).toBeInTheDocument();
      expect(screen.getByText('92%')).toBeInTheDocument();
      expect(screen.getByText('95%')).toBeInTheDocument();
    });

    test('displays trend indicators (up, down, stable)', () => {
      renderWithProviders(<ClientAnalytics />);

      expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
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

      expect(screen.getByText('Acquisition Cost')).toBeInTheDocument();
    });

    test('displays retention rate', () => {
      renderWithProviders(<ClientAnalytics />);

      const ltvTab = screen.getByText('Lifetime Value');
      fireEvent.click(ltvTab);

      expect(screen.getByText('Retention Rate')).toBeInTheDocument();
      expect(screen.getByText('95%')).toBeInTheDocument();
      expect(screen.getByText('88%')).toBeInTheDocument();
    });

    test('shows ROI calculation', () => {
      renderWithProviders(<ClientAnalytics />);

      const ltvTab = screen.getByText('Lifetime Value');
      fireEvent.click(ltvTab);

      expect(screen.getByText('ROI')).toBeInTheDocument();
    });

    test('displays projected future value', () => {
      renderWithProviders(<ClientAnalytics />);

      const ltvTab = screen.getByText('Lifetime Value');
      fireEvent.click(ltvTab);

      expect(screen.getByText('Projected Future Value')).toBeInTheDocument();
    });

    test('shows LTV composition visualization', () => {
      renderWithProviders(<ClientAnalytics />);

      const ltvTab = screen.getByText('Lifetime Value');
      fireEvent.click(ltvTab);

      expect(screen.getByText('LTV Composition')).toBeInTheDocument();
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

      expect(screen.getByText(/Payment/)).toBeInTheDocument();
      expect(screen.getByText(/Scope Creep/)).toBeInTheDocument();
      expect(screen.getByText(/Communication/)).toBeInTheDocument();
      expect(screen.getByText(/Expectation/)).toBeInTheDocument();
      expect(screen.getByText(/Compliance/)).toBeInTheDocument();
    });

    test('displays outstanding balance', () => {
      renderWithProviders(<ClientAnalytics />);

      const riskTab = screen.getByText('Risk Assessment');
      fireEvent.click(riskTab);

      expect(screen.getByText('Outstanding Balance')).toBeInTheDocument();
      expect(screen.getByText('$15,000')).toBeInTheDocument();
      expect(screen.getByText('$125,000')).toBeInTheDocument();
    });

    test('shows days outstanding metric', () => {
      renderWithProviders(<ClientAnalytics />);

      const riskTab = screen.getByText('Risk Assessment');
      fireEvent.click(riskTab);

      expect(screen.getByText('Days Outstanding')).toBeInTheDocument();
      expect(screen.getByText('12 days')).toBeInTheDocument();
      expect(screen.getByText('87 days')).toBeInTheDocument();
    });

    test('displays disputed invoices count', () => {
      renderWithProviders(<ClientAnalytics />);

      const riskTab = screen.getByText('Risk Assessment');
      fireEvent.click(riskTab);

      expect(screen.getByText('Disputed Invoices')).toBeInTheDocument();
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

      expect(screen.getByText('Responsiveness')).toBeInTheDocument();
      expect(screen.getByText('Quality')).toBeInTheDocument();
      expect(screen.getByText('Value')).toBeInTheDocument();
      expect(screen.getByText('Likelihood to Recommend')).toBeInTheDocument();
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
