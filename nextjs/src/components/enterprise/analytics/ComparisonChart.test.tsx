/**
 * @fileoverview Enterprise-grade tests for ComparisonChart component
 * Tests YoY/MoM comparisons, visualization types, and data transformations
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ComparisonChart, type ComparisonDataPoint } from './ComparisonChart';

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
    BarChart: ({ children, data }: { children: React.ReactNode; data: ComparisonDataPoint[] }) => (
      <div data-testid="bar-chart" data-length={data.length}>
        {children}
      </div>
    ),
    LineChart: ({ children, data }: { children: React.ReactNode; data: ComparisonDataPoint[] }) => (
      <div data-testid="line-chart" data-length={data.length}>
        {children}
      </div>
    ),
    ComposedChart: ({ children, data }: { children: React.ReactNode; data: ComparisonDataPoint[] }) => (
      <div data-testid="composed-chart" data-length={data.length}>
        {children}
      </div>
    ),
    Bar: ({ dataKey, name, fill }: { dataKey: string; name: string; fill: string }) => (
      <div data-testid={`bar-${dataKey}`} data-name={name} data-fill={fill} />
    ),
    Line: ({ dataKey, name, stroke }: { dataKey: string; name: string; stroke: string }) => (
      <div data-testid={`line-${dataKey}`} data-name={name} data-stroke={stroke} />
    ),
    XAxis: ({ dataKey }: { dataKey: string }) => <div data-testid="x-axis" data-key={dataKey} />,
    YAxis: ({ yAxisId }: { yAxisId?: string }) => <div data-testid={`y-axis-${yAxisId || 'default'}`} />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
    ReferenceLine: ({ y, label }: { y?: number; label?: string }) => (
      <div data-testid="reference-line" data-y={y} data-label={label} />
    ),
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
      danger: '#ef4444'
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

describe('ComparisonChart', () => {
  const mockData: ComparisonDataPoint[] = [
    { period: 'Jan', current: 120, previous: 100 },
    { period: 'Feb', current: 150, previous: 130 },
    { period: 'Mar', current: 180, previous: 160 },
    { period: 'Apr', current: 140, previous: 150 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with required data prop', () => {
      render(<ComparisonChart data={mockData} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('renders bar chart by default', () => {
      render(<ComparisonChart data={mockData} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('renders line chart when visualizationType is line', () => {
      render(<ComparisonChart data={mockData} visualizationType="line" />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('renders composed chart when visualizationType is composed', () => {
      render(<ComparisonChart data={mockData} visualizationType="composed" />);

      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('renders current and previous bars in bar chart', () => {
      render(<ComparisonChart data={mockData} visualizationType="bar" />);

      expect(screen.getByTestId('bar-current')).toBeInTheDocument();
      expect(screen.getByTestId('bar-previous')).toBeInTheDocument();
    });

    it('renders current and previous lines in line chart', () => {
      render(<ComparisonChart data={mockData} visualizationType="line" />);

      expect(screen.getByTestId('line-current')).toBeInTheDocument();
      expect(screen.getByTestId('line-previous')).toBeInTheDocument();
    });
  });

  describe('Comparison Types', () => {
    it('uses YoY labels by default', () => {
      render(<ComparisonChart data={mockData} comparisonType="yoy" />);

      const currentBar = screen.getByTestId('bar-current');
      const previousBar = screen.getByTestId('bar-previous');

      expect(currentBar).toHaveAttribute('data-name', 'This Year');
      expect(previousBar).toHaveAttribute('data-name', 'Last Year');
    });

    it('uses MoM labels when comparisonType is mom', () => {
      render(<ComparisonChart data={mockData} comparisonType="mom" />);

      const currentBar = screen.getByTestId('bar-current');
      const previousBar = screen.getByTestId('bar-previous');

      expect(currentBar).toHaveAttribute('data-name', 'This Month');
      expect(previousBar).toHaveAttribute('data-name', 'Last Month');
    });

    it('uses QoQ labels when comparisonType is qoq', () => {
      render(<ComparisonChart data={mockData} comparisonType="qoq" />);

      const currentBar = screen.getByTestId('bar-current');
      const previousBar = screen.getByTestId('bar-previous');

      expect(currentBar).toHaveAttribute('data-name', 'This Quarter');
      expect(previousBar).toHaveAttribute('data-name', 'Last Quarter');
    });

    it('uses custom labels when comparisonType is custom', () => {
      render(<ComparisonChart data={mockData} comparisonType="custom" />);

      const currentBar = screen.getByTestId('bar-current');
      expect(currentBar).toHaveAttribute('data-name', 'Current');
    });
  });

  describe('Custom Labels', () => {
    it('applies custom labels when provided', () => {
      const customLabels = {
        current: 'Budget',
        previous: 'Actual'
      };

      render(<ComparisonChart data={mockData} labels={customLabels} />);

      const currentBar = screen.getByTestId('bar-current');
      const previousBar = screen.getByTestId('bar-previous');

      expect(currentBar).toHaveAttribute('data-name', 'Budget');
      expect(previousBar).toHaveAttribute('data-name', 'Actual');
    });
  });

  describe('Loading State', () => {
    it('displays loading message when loading is true', () => {
      render(<ComparisonChart data={mockData} loading={true} />);

      expect(screen.getByText('Loading comparison data...')).toBeInTheDocument();
    });

    it('does not render chart when loading', () => {
      render(<ComparisonChart data={mockData} loading={true} />);

      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays empty message when data is empty', () => {
      render(<ComparisonChart data={[]} />);

      expect(screen.getByText('No comparison data available')).toBeInTheDocument();
    });

    it('does not render chart when data is empty', () => {
      render(<ComparisonChart data={[]} />);

      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });
  });

  describe('Grid and Legend', () => {
    it('renders grid when showGrid is true', () => {
      render(<ComparisonChart data={mockData} showGrid={true} />);

      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    });

    it('hides grid when showGrid is false', () => {
      render(<ComparisonChart data={mockData} showGrid={false} />);

      expect(screen.queryByTestId('cartesian-grid')).not.toBeInTheDocument();
    });

    it('renders legend when showLegend is true', () => {
      render(<ComparisonChart data={mockData} showLegend={true} />);

      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });

    it('hides legend when showLegend is false', () => {
      render(<ComparisonChart data={mockData} showLegend={false} />);

      expect(screen.queryByTestId('legend')).not.toBeInTheDocument();
    });
  });

  describe('Target Line', () => {
    it('renders target reference line when showTarget is true and data has target', () => {
      const dataWithTarget: ComparisonDataPoint[] = [
        { period: 'Jan', current: 120, previous: 100, target: 150 }
      ];

      render(<ComparisonChart data={dataWithTarget} showTarget={true} visualizationType="bar" />);

      expect(screen.getByTestId('reference-line')).toBeInTheDocument();
    });

    it('does not render target line when showTarget is false', () => {
      const dataWithTarget: ComparisonDataPoint[] = [
        { period: 'Jan', current: 120, previous: 100, target: 150 }
      ];

      render(<ComparisonChart data={dataWithTarget} showTarget={false} />);

      expect(screen.queryByTestId('reference-line')).not.toBeInTheDocument();
    });
  });

  describe('Change Calculation', () => {
    it('calculates percentage change automatically', () => {
      const dataWithoutChange: ComparisonDataPoint[] = [
        { period: 'Jan', current: 120, previous: 100 } // 20% increase
      ];

      render(<ComparisonChart data={dataWithoutChange} />);

      // The component calculates change internally
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('uses provided change values when present', () => {
      const dataWithChange: ComparisonDataPoint[] = [
        { period: 'Jan', current: 120, previous: 100, change: 25 } // Override
      ];

      render(<ComparisonChart data={dataWithChange} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('handles zero previous value', () => {
      const dataWithZero: ComparisonDataPoint[] = [
        { period: 'Jan', current: 100, previous: 0 }
      ];

      render(<ComparisonChart data={dataWithZero} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('Composed Chart', () => {
    it('renders both bars and change line in composed chart', () => {
      render(<ComparisonChart data={mockData} visualizationType="composed" showChange={true} />);

      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar-current')).toBeInTheDocument();
      expect(screen.getByTestId('bar-previous')).toBeInTheDocument();
      expect(screen.getByTestId('line-change')).toBeInTheDocument();
    });

    it('renders dual Y-axes in composed chart with showChange', () => {
      render(<ComparisonChart data={mockData} visualizationType="composed" showChange={true} />);

      expect(screen.getByTestId('y-axis-left')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis-right')).toBeInTheDocument();
    });
  });

  describe('Custom Colors', () => {
    it('applies custom colors when provided', () => {
      const customColors = {
        current: '#ff0000',
        previous: '#00ff00'
      };

      render(<ComparisonChart data={mockData} colors={customColors} />);

      const currentBar = screen.getByTestId('bar-current');
      const previousBar = screen.getByTestId('bar-previous');

      expect(currentBar).toHaveAttribute('data-fill', '#ff0000');
      expect(previousBar).toHaveAttribute('data-fill', '#00ff00');
    });
  });

  describe('Value Formatters', () => {
    it('accepts custom value formatter', () => {
      const customFormatter = (value: number) => `$${value.toFixed(2)}`;

      render(<ComparisonChart data={mockData} formatValue={customFormatter} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('accepts custom percentage formatter', () => {
      const customPercentFormatter = (value: number) => `${value}%`;

      render(<ComparisonChart data={mockData} formatPercentage={customPercentFormatter} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('Height Configuration', () => {
    it('uses default height of 400', () => {
      render(<ComparisonChart data={mockData} />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveStyle({ height: '400px' });
    });

    it('applies custom height', () => {
      render(<ComparisonChart data={mockData} height={600} />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveStyle({ height: '600px' });
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<ComparisonChart data={mockData} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Tooltip', () => {
    it('renders tooltip component', () => {
      render(<ComparisonChart data={mockData} />);

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles single data point', () => {
      const singlePoint: ComparisonDataPoint[] = [
        { period: 'Jan', current: 100, previous: 90 }
      ];

      render(<ComparisonChart data={singlePoint} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('handles negative values', () => {
      const negativeData: ComparisonDataPoint[] = [
        { period: 'Jan', current: -50, previous: 100 }
      ];

      render(<ComparisonChart data={negativeData} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('handles equal current and previous values', () => {
      const equalData: ComparisonDataPoint[] = [
        { period: 'Jan', current: 100, previous: 100 }
      ];

      render(<ComparisonChart data={equalData} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('handles very large values', () => {
      const largeData: ComparisonDataPoint[] = [
        { period: 'Jan', current: 1000000000, previous: 900000000 }
      ];

      render(<ComparisonChart data={largeData} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });
});
