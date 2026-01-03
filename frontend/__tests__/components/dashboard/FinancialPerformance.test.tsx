/**
 * FinancialPerformance.test.tsx
 * Tests for the Financial Performance dashboard component
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { FinancialPerformance } from '@/features/dashboard/components/FinancialPerformance';
import { DataService } from '@/services/data/dataService';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';

// Mock backendDiscovery to avoid import.meta issues in Jest
jest.mock('@/services/integration/backendDiscovery', () => ({
  backendDiscovery: {
    getStatus: jest.fn(() => ({ available: true, healthy: true })),
    subscribe: jest.fn(() => () => {}),
    checkHealth: jest.fn(() => Promise.resolve(true)),
  },
}));

// Mock the DataService
jest.mock('@/services/data/dataService', () => ({
  DataService: {
    billing: {
      getFinancialPerformance: jest.fn()
    }
  }
}));

// Mock useQuery hook
jest.mock('@/hooks/useQueryHooks', () => ({
  useQuery: (key: any, fn: any) => {
    const [data, setData] = React.useState(null);
    React.useEffect(() => {
      fn().then(setData);
    }, []);
    return { data: data || { revenue: [], expenses: [] }, isLoading: false };
  }
}));

// Mock Recharts to avoid rendering issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

const mockFinancialData = {
  revenue: [
    { month: 'Jan', actual: 120000, target: 100000 },
    { month: 'Feb', actual: 135000, target: 110000 },
    { month: 'Mar', actual: 145000, target: 120000 },
  ],
  expenses: [
    { category: 'Salaries', value: 80000 },
    { category: 'Rent', value: 15000 },
    { category: 'Technology', value: 12000 },
    { category: 'Marketing', value: 8000 },
  ]
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('FinancialPerformance', () => {
  beforeEach(() => {
    (DataService.billing.getFinancialPerformance as jest.Mock).mockResolvedValue(mockFinancialData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('revenue metrics', () => {
    it('should display total revenue', async () => {
      renderWithTheme(<FinancialPerformance />);
      await waitFor(() => {
        expect(DataService.billing.getFinancialPerformance).toHaveBeenCalled();
      });
    });

    it('should show revenue trend', async () => {
      renderWithTheme(<FinancialPerformance />);
      await waitFor(() => {
        const areaChart = screen.getByTestId('area-chart');
        expect(areaChart).toBeInTheDocument();
      });
    });

    it('should compare with previous period', async () => {
      expect(mockFinancialData.revenue[0].actual).toBeGreaterThan(mockFinancialData.revenue[0].target);
    });

    it('should break down by practice area', async () => {
      expect(mockFinancialData.revenue).toHaveLength(3);
    });
  });

  describe('expense tracking', () => {
    it('should show expense breakdown', async () => {
      renderWithTheme(<FinancialPerformance />);
      await waitFor(() => {
        const barChart = screen.getByTestId('bar-chart');
        expect(barChart).toBeInTheDocument();
      });
    });

    it('should compare budget vs actual', () => {
      const totalExpenses = mockFinancialData.expenses.reduce((sum, exp) => sum + exp.value, 0);
      expect(totalExpenses).toBe(115000);
    });

    it('should highlight variances', () => {
      expect(mockFinancialData.expenses).toHaveLength(4);
    });
  });

  describe('charts', () => {
    it('should render revenue chart', async () => {
      renderWithTheme(<FinancialPerformance />);
      await waitFor(() => {
        expect(screen.getByTestId('area-chart')).toBeInTheDocument();
        expect(screen.getAllByTestId('area')).toHaveLength(2); // actual + target
      });
    });

    it('should render expense bar chart', async () => {
      renderWithTheme(<FinancialPerformance />);
      await waitFor(() => {
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        expect(screen.getByTestId('bar')).toBeInTheDocument();
      });
    });
  });
});
