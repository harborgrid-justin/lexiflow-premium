/**
 * @fileoverview Enterprise-grade tests for RevenueTrendChart component
 * Tests area/line charts, revenue streams, and data visualization
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RevenueTrendChart, type RevenueDataPoint } from './RevenueTrendChart';

expect.extend(toHaveNoViolations);

// Mock recharts components
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children, height }: { children: React.ReactNode; height: number }) => (
      <div data-testid="responsive-container" style={{ width: '100%', height }}>
        {children}
      </div>
    ),
    AreaChart: ({ children, data }: { children: React.ReactNode; data: RevenueDataPoint[] }) => (
      <div data-testid="area-chart" data-length={data.length}>
        {children}
      </div>
    ),
    LineChart: ({ children, data }: { children: React.ReactNode; data: RevenueDataPoint[] }) => (
      <div data-testid="line-chart" data-length={data.length}>
        {children}
      </div>
    ),
    Area: ({ dataKey, name, stroke, fill }: { dataKey: string; name: string; stroke: string; fill: string }) => (
      <div data-testid={`area-${dataKey}`} data-name={name} data-stroke={stroke} data-fill={fill} />
    ),
    Line: ({ dataKey, name, stroke }: { dataKey: string; name: string; stroke: string }) => (
      <div data-testid={`line-${dataKey}`} data-name={name} data-stroke={stroke} />
    ),
    XAxis: ({ dataKey }: { dataKey: string }) => <div data-testid="x-axis" data-key={dataKey} />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />
  };
});

// Mock useChartTheme
jest.mock('@/components/organisms/ChartHelpers/ChartHelpers', () => ({
  useChartTheme: () => ({
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#ef4444',
      neutral: '#94a3b8',
      blue: '#3b82f6',
      emerald: '#10b981',
      purple: '#8b5cf6'
    },
    text: '#1e293b',
    grid: '#e2e8f0',
    tooltipStyle: {
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      padding: '12px'
    }
  })
}));

describe('RevenueTrendChart', () => {
  const mockData: RevenueDataPoint[] = [
    { period: 'Jan', revenue: 120000, billableRevenue: 80000, flatFeeRevenue: 30000, contingencyRevenue: 10000 },
    { period: 'Feb', revenue: 135000, billableRevenue: 90000, flatFeeRevenue: 35000, contingencyRevenue: 10000 },
    { period: 'Mar', revenue: 150000, billableRevenue: 100000, flatFeeRevenue: 40000, contingencyRevenue: 10000 },
    { period: 'Apr', revenue: 145000, billableRevenue: 95000, flatFeeRevenue: 38000, contingencyRevenue: 12000 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with required data prop', () => {
      render(<RevenueTrendChart data={mockData} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('renders area chart by default', () => {
      render(<RevenueTrendChart data={mockData} />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('renders line chart when type is line', () => {
      render(<RevenueTrendChart data={mockData} type="line" />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('renders revenue area by default', () => {
      render(<RevenueTrendChart data={mockData} />);

      expect(screen.getByTestId('area-revenue')).toBeInTheDocument();
    });
  });

  describe('Revenue Streams', () => {
    it('renders single stream by default', () => {
      render(<RevenueTrendChart data={mockData} />);

      expect(screen.getByTestId('area-revenue')).toBeInTheDocument();
      expect(screen.queryByTestId('area-billableRevenue')).not.toBeInTheDocument();
    });

    it('renders multiple streams when specified', () => {
      render(
        <RevenueTrendChart
          data={mockData}
          streams={['revenue', 'billableRevenue', 'flatFeeRevenue']}
        />
      );

      expect(screen.getByTestId('area-revenue')).toBeInTheDocument();
      expect(screen.getByTestId('area-billableRevenue')).toBeInTheDocument();
      expect(screen.getByTestId('area-flatFeeRevenue')).toBeInTheDocument();
    });

    it('renders contingency revenue stream', () => {
      render(
        <RevenueTrendChart
          data={mockData}
          streams={['contingencyRevenue']}
        />
      );

      expect(screen.getByTestId('area-contingencyRevenue')).toBeInTheDocument();
    });

    it('renders projected revenue stream', () => {
      const dataWithProjected: RevenueDataPoint[] = mockData.map(d => ({
        ...d,
        projected: d.revenue * 1.1
      }));

      render(
        <RevenueTrendChart
          data={dataWithProjected}
          streams={['revenue', 'projected']}
        />
      );

      expect(screen.getByTestId('area-revenue')).toBeInTheDocument();
      expect(screen.getByTestId('area-projected')).toBeInTheDocument();
    });

    it('applies correct labels to streams', () => {
      render(
        <RevenueTrendChart
          data={mockData}
          streams={['revenue', 'billableRevenue']}
        />
      );

      expect(screen.getByTestId('area-revenue')).toHaveAttribute('data-name', 'Total Revenue');
      expect(screen.getByTestId('area-billableRevenue')).toHaveAttribute('data-name', 'Billable Hours');
    });
  });

  describe('Chart Type', () => {
    it('renders Area components for area type', () => {
      render(<RevenueTrendChart data={mockData} type="area" />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
      expect(screen.getByTestId('area-revenue')).toBeInTheDocument();
    });

    it('renders Line components for line type', () => {
      render(<RevenueTrendChart data={mockData} type="line" />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('line-revenue')).toBeInTheDocument();
    });

    it('renders multiple lines for line type with multiple streams', () => {
      render(
        <RevenueTrendChart
          data={mockData}
          type="line"
          streams={['revenue', 'billableRevenue']}
        />
      );

      expect(screen.getByTestId('line-revenue')).toBeInTheDocument();
      expect(screen.getByTestId('line-billableRevenue')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('displays loading message when loading is true', () => {
      render(<RevenueTrendChart data={mockData} loading={true} />);

      expect(screen.getByText('Loading revenue data...')).toBeInTheDocument();
    });

    it('does not render chart when loading', () => {
      render(<RevenueTrendChart data={mockData} loading={true} />);

      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays empty message when data is empty', () => {
      render(<RevenueTrendChart data={[]} />);

      expect(screen.getByText('No revenue data available')).toBeInTheDocument();
    });

    it('does not render chart when data is empty', () => {
      render(<RevenueTrendChart data={[]} />);

      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument();
    });

    it('handles undefined data gracefully', () => {
      // @ts-expect-error Testing undefined case
      render(<RevenueTrendChart data={undefined} />);

      expect(screen.getByText('No revenue data available')).toBeInTheDocument();
    });
  });

  describe('Grid and Legend', () => {
    it('renders grid when showGrid is true', () => {
      render(<RevenueTrendChart data={mockData} showGrid={true} />);

      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    });

    it('hides grid when showGrid is false', () => {
      render(<RevenueTrendChart data={mockData} showGrid={false} />);

      expect(screen.queryByTestId('cartesian-grid')).not.toBeInTheDocument();
    });

    it('renders legend when showLegend is true', () => {
      render(<RevenueTrendChart data={mockData} showLegend={true} />);

      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });

    it('hides legend when showLegend is false', () => {
      render(<RevenueTrendChart data={mockData} showLegend={false} />);

      expect(screen.queryByTestId('legend')).not.toBeInTheDocument();
    });
  });

  describe('Custom Colors', () => {
    it('applies custom colors when provided', () => {
      const customColors = {
        revenue: '#ff0000',
        billableRevenue: '#00ff00'
      };

      render(
        <RevenueTrendChart
          data={mockData}
          streams={['revenue', 'billableRevenue']}
          colorMap={customColors}
        />
      );

      expect(screen.getByTestId('area-revenue')).toHaveAttribute('data-stroke', '#ff0000');
      expect(screen.getByTestId('area-billableRevenue')).toHaveAttribute('data-stroke', '#00ff00');
    });
  });

  describe('Currency Formatting', () => {
    it('accepts custom currency formatter', () => {
      const customFormatter = (value: number) => `EUR ${value.toFixed(2)}`;

      render(
        <RevenueTrendChart
          data={mockData}
          formatCurrency={customFormatter}
        />
      );

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('uses default formatter when not provided', () => {
      render(<RevenueTrendChart data={mockData} />);

      // Default formatter formats as $XK
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
  });

  describe('Height Configuration', () => {
    it('uses default height of 400', () => {
      render(<RevenueTrendChart data={mockData} />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveStyle({ height: '400px' });
    });

    it('applies custom height', () => {
      render(<RevenueTrendChart data={mockData} height={600} />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveStyle({ height: '600px' });
    });
  });

  describe('Tooltip', () => {
    it('renders tooltip component', () => {
      render(<RevenueTrendChart data={mockData} />);

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });
  });

  describe('Axes', () => {
    it('renders X-axis with period dataKey', () => {
      render(<RevenueTrendChart data={mockData} />);

      expect(screen.getByTestId('x-axis')).toHaveAttribute('data-key', 'period');
    });

    it('renders Y-axis', () => {
      render(<RevenueTrendChart data={mockData} />);

      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<RevenueTrendChart data={mockData} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Edge Cases', () => {
    it('handles single data point', () => {
      const singlePoint: RevenueDataPoint[] = [
        { period: 'Jan', revenue: 100000 }
      ];

      render(<RevenueTrendChart data={singlePoint} />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('handles zero values', () => {
      const zeroData: RevenueDataPoint[] = [
        { period: 'Jan', revenue: 0 },
        { period: 'Feb', revenue: 0 }
      ];

      render(<RevenueTrendChart data={zeroData} />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('handles negative values', () => {
      const negativeData: RevenueDataPoint[] = [
        { period: 'Jan', revenue: -50000 },
        { period: 'Feb', revenue: 100000 }
      ];

      render(<RevenueTrendChart data={negativeData} />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('handles very large values', () => {
      const largeData: RevenueDataPoint[] = [
        { period: 'Jan', revenue: 1000000000 },
        { period: 'Feb', revenue: 2000000000 }
      ];

      render(<RevenueTrendChart data={largeData} />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('handles missing optional fields', () => {
      const minimalData: RevenueDataPoint[] = [
        { period: 'Jan', revenue: 100000 },
        { period: 'Feb', revenue: 120000 }
      ];

      render(
        <RevenueTrendChart
          data={minimalData}
          streams={['revenue', 'billableRevenue']}
        />
      );

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
  });
});
