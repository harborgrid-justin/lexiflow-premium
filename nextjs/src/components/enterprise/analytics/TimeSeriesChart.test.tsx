/**
 * @fileoverview Enterprise-grade tests for TimeSeriesChart component
 * Tests composed charts, multiple series, reference lines/areas, and brush
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TimeSeriesChart, type TimeSeriesDataPoint, type SeriesConfig } from './TimeSeriesChart';

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
    ComposedChart: ({ children, data, syncId }: { children: React.ReactNode; data: TimeSeriesDataPoint[]; syncId?: string }) => (
      <div data-testid="composed-chart" data-length={data.length} data-sync-id={syncId}>
        {children}
      </div>
    ),
    Line: ({ dataKey, name, stroke, yAxisId }: { dataKey: string; name: string; stroke: string; yAxisId?: string }) => (
      <div data-testid={`line-${dataKey}`} data-name={name} data-stroke={stroke} data-y-axis-id={yAxisId} />
    ),
    Area: ({ dataKey, name, stroke, fill, yAxisId }: { dataKey: string; name: string; stroke: string; fill: string; yAxisId?: string }) => (
      <div data-testid={`area-${dataKey}`} data-name={name} data-stroke={stroke} data-fill={fill} data-y-axis-id={yAxisId} />
    ),
    Bar: ({ dataKey, name, fill, yAxisId, stackId }: { dataKey: string; name: string; fill: string; yAxisId?: string; stackId?: string }) => (
      <div data-testid={`bar-${dataKey}`} data-name={name} data-fill={fill} data-y-axis-id={yAxisId} data-stack-id={stackId} />
    ),
    XAxis: ({ dataKey, label }: { dataKey: string; label?: { value: string } }) => (
      <div data-testid="x-axis" data-key={dataKey} data-label={label?.value} />
    ),
    YAxis: ({ yAxisId, orientation, label }: { yAxisId: string; orientation?: string; label?: { value: string } }) => (
      <div data-testid={`y-axis-${yAxisId}`} data-orientation={orientation} data-label={label?.value} />
    ),
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
    ReferenceLine: ({ y, x, stroke, label }: { y?: number; x?: string; stroke: string; label?: string }) => (
      <div data-testid="reference-line" data-y={y} data-x={x} data-stroke={stroke} data-label={label} />
    ),
    ReferenceArea: ({ x1, x2, y1, y2, fill, label }: { x1?: string | number; x2?: string | number; y1?: number; y2?: number; fill: string; label?: string }) => (
      <div data-testid="reference-area" data-x1={x1} data-x2={x2} data-y1={y1} data-y2={y2} data-fill={fill} data-label={label} />
    ),
    Brush: ({ dataKey, height }: { dataKey: string; height: number }) => (
      <div data-testid="brush" data-key={dataKey} data-height={height} />
    )
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

describe('TimeSeriesChart', () => {
  const mockData: TimeSeriesDataPoint[] = [
    { timestamp: '2024-01-01', revenue: 100000, cases: 45, hours: 180 },
    { timestamp: '2024-01-02', revenue: 120000, cases: 52, hours: 195 },
    { timestamp: '2024-01-03', revenue: 115000, cases: 48, hours: 185 },
    { timestamp: '2024-01-04', revenue: 130000, cases: 55, hours: 210 }
  ];

  const defaultSeries: SeriesConfig[] = [
    { dataKey: 'revenue', name: 'Revenue', type: 'area', color: '#3b82f6' },
    { dataKey: 'cases', name: 'Cases', type: 'line', color: '#22c55e' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with required props', () => {
      render(<TimeSeriesChart data={mockData} series={defaultSeries} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('renders all data points', () => {
      render(<TimeSeriesChart data={mockData} series={defaultSeries} />);

      const chart = screen.getByTestId('composed-chart');
      expect(chart).toHaveAttribute('data-length', '4');
    });

    it('renders all series', () => {
      render(<TimeSeriesChart data={mockData} series={defaultSeries} />);

      expect(screen.getByTestId('area-revenue')).toBeInTheDocument();
      expect(screen.getByTestId('line-cases')).toBeInTheDocument();
    });
  });

  describe('Series Types', () => {
    it('renders line series correctly', () => {
      const lineSeries: SeriesConfig[] = [
        { dataKey: 'revenue', name: 'Revenue', type: 'line', color: '#3b82f6' }
      ];

      render(<TimeSeriesChart data={mockData} series={lineSeries} />);

      expect(screen.getByTestId('line-revenue')).toBeInTheDocument();
    });

    it('renders area series correctly', () => {
      const areaSeries: SeriesConfig[] = [
        { dataKey: 'revenue', name: 'Revenue', type: 'area', color: '#3b82f6' }
      ];

      render(<TimeSeriesChart data={mockData} series={areaSeries} />);

      expect(screen.getByTestId('area-revenue')).toBeInTheDocument();
    });

    it('renders bar series correctly', () => {
      const barSeries: SeriesConfig[] = [
        { dataKey: 'cases', name: 'Cases', type: 'bar', color: '#22c55e' }
      ];

      render(<TimeSeriesChart data={mockData} series={barSeries} />);

      expect(screen.getByTestId('bar-cases')).toBeInTheDocument();
    });

    it('renders mixed series types', () => {
      const mixedSeries: SeriesConfig[] = [
        { dataKey: 'revenue', name: 'Revenue', type: 'area', color: '#3b82f6' },
        { dataKey: 'cases', name: 'Cases', type: 'line', color: '#22c55e' },
        { dataKey: 'hours', name: 'Hours', type: 'bar', color: '#f59e0b' }
      ];

      render(<TimeSeriesChart data={mockData} series={mixedSeries} />);

      expect(screen.getByTestId('area-revenue')).toBeInTheDocument();
      expect(screen.getByTestId('line-cases')).toBeInTheDocument();
      expect(screen.getByTestId('bar-hours')).toBeInTheDocument();
    });
  });

  describe('Dual Y-Axis', () => {
    it('renders left Y-axis by default', () => {
      render(<TimeSeriesChart data={mockData} series={defaultSeries} />);

      expect(screen.getByTestId('y-axis-left')).toBeInTheDocument();
    });

    it('renders right Y-axis when series uses it', () => {
      const seriesWithRightAxis: SeriesConfig[] = [
        { dataKey: 'revenue', name: 'Revenue', type: 'area', color: '#3b82f6', yAxisId: 'left' },
        { dataKey: 'cases', name: 'Cases', type: 'line', color: '#22c55e', yAxisId: 'right' }
      ];

      render(<TimeSeriesChart data={mockData} series={seriesWithRightAxis} />);

      expect(screen.getByTestId('y-axis-left')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis-right')).toBeInTheDocument();
    });

    it('applies correct yAxisId to series', () => {
      const seriesWithRightAxis: SeriesConfig[] = [
        { dataKey: 'revenue', name: 'Revenue', type: 'area', color: '#3b82f6', yAxisId: 'left' },
        { dataKey: 'cases', name: 'Cases', type: 'line', color: '#22c55e', yAxisId: 'right' }
      ];

      render(<TimeSeriesChart data={mockData} series={seriesWithRightAxis} />);

      expect(screen.getByTestId('area-revenue')).toHaveAttribute('data-y-axis-id', 'left');
      expect(screen.getByTestId('line-cases')).toHaveAttribute('data-y-axis-id', 'right');
    });
  });

  describe('Reference Lines', () => {
    it('renders horizontal reference line', () => {
      const referenceLines = [
        { value: 100000, orientation: 'horizontal' as const, label: 'Target', color: '#ef4444' }
      ];

      render(<TimeSeriesChart data={mockData} series={defaultSeries} referenceLines={referenceLines} />);

      expect(screen.getByTestId('reference-line')).toBeInTheDocument();
      expect(screen.getByTestId('reference-line')).toHaveAttribute('data-y', '100000');
    });

    it('renders vertical reference line', () => {
      const referenceLines = [
        { value: '2024-01-02', orientation: 'vertical' as const, label: 'Event' }
      ];

      render(<TimeSeriesChart data={mockData} series={defaultSeries} referenceLines={referenceLines} />);

      expect(screen.getByTestId('reference-line')).toBeInTheDocument();
      expect(screen.getByTestId('reference-line')).toHaveAttribute('data-x', '2024-01-02');
    });

    it('renders multiple reference lines', () => {
      const referenceLines = [
        { value: 100000, orientation: 'horizontal' as const, label: 'Target' },
        { value: 120000, orientation: 'horizontal' as const, label: 'Stretch Goal' }
      ];

      render(<TimeSeriesChart data={mockData} series={defaultSeries} referenceLines={referenceLines} />);

      const lines = screen.getAllByTestId('reference-line');
      expect(lines.length).toBe(2);
    });
  });

  describe('Reference Areas', () => {
    it('renders reference area', () => {
      const referenceAreas = [
        { x1: '2024-01-01', x2: '2024-01-02', fill: '#3b82f6', fillOpacity: 0.3 }
      ];

      render(<TimeSeriesChart data={mockData} series={defaultSeries} referenceAreas={referenceAreas} />);

      expect(screen.getByTestId('reference-area')).toBeInTheDocument();
    });

    it('renders reference area with y values', () => {
      const referenceAreas = [
        { y1: 100000, y2: 120000, fill: '#22c55e', label: 'Target Zone' }
      ];

      render(<TimeSeriesChart data={mockData} series={defaultSeries} referenceAreas={referenceAreas} />);

      const area = screen.getByTestId('reference-area');
      expect(area).toHaveAttribute('data-y1', '100000');
      expect(area).toHaveAttribute('data-y2', '120000');
    });
  });

  describe('Brush (Zoom)', () => {
    it('renders brush when showBrush is true', () => {
      render(<TimeSeriesChart data={mockData} series={defaultSeries} showBrush={true} />);

      expect(screen.getByTestId('brush')).toBeInTheDocument();
    });

    it('hides brush when showBrush is false', () => {
      render(<TimeSeriesChart data={mockData} series={defaultSeries} showBrush={false} />);

      expect(screen.queryByTestId('brush')).not.toBeInTheDocument();
    });

    it('brush uses timestamp dataKey', () => {
      render(<TimeSeriesChart data={mockData} series={defaultSeries} showBrush={true} />);

      expect(screen.getByTestId('brush')).toHaveAttribute('data-key', 'timestamp');
    });
  });

  describe('Loading State', () => {
    it('displays loading message when loading is true', () => {
      render(<TimeSeriesChart data={mockData} series={defaultSeries} loading={true} />);

      expect(screen.getByText('Loading time series data...')).toBeInTheDocument();
    });

    it('does not render chart when loading', () => {
      render(<TimeSeriesChart data={mockData} series={defaultSeries} loading={true} />);

      expect(screen.queryByTestId('composed-chart')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays empty message when data is empty', () => {
      render(<TimeSeriesChart data={[]} series={defaultSeries} />);

      expect(screen.getByText('No time series data available')).toBeInTheDocument();
    });

    it('does not render chart when data is empty', () => {
      render(<TimeSeriesChart data={[]} series={defaultSeries} />);

      expect(screen.queryByTestId('composed-chart')).not.toBeInTheDocument();
    });

    it('handles undefined data gracefully', () => {
      // @ts-expect-error Testing undefined case
      render(<TimeSeriesChart data={undefined} series={defaultSeries} />);

      expect(screen.getByText('No time series data available')).toBeInTheDocument();
    });
  });

  describe('Grid and Legend', () => {
    it('renders grid when showGrid is true', () => {
      render(<TimeSeriesChart data={mockData} series={defaultSeries} showGrid={true} />);

      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    });

    it('hides grid when showGrid is false', () => {
      render(<TimeSeriesChart data={mockData} series={defaultSeries} showGrid={false} />);

      expect(screen.queryByTestId('cartesian-grid')).not.toBeInTheDocument();
    });

    it('renders legend when showLegend is true', () => {
      render(<TimeSeriesChart data={mockData} series={defaultSeries} showLegend={true} />);

      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });

    it('hides legend when showLegend is false', () => {
      render(<TimeSeriesChart data={mockData} series={defaultSeries} showLegend={false} />);

      expect(screen.queryByTestId('legend')).not.toBeInTheDocument();
    });
  });

  describe('Axis Labels', () => {
    it('applies X-axis label when provided', () => {
      render(<TimeSeriesChart data={mockData} series={defaultSeries} xAxisLabel="Time Period" />);

      expect(screen.getByTestId('x-axis')).toHaveAttribute('data-label', 'Time Period');
    });

    it('applies left Y-axis label when provided', () => {
      render(<TimeSeriesChart data={mockData} series={defaultSeries} yAxisLabelLeft="Revenue ($)" />);

      expect(screen.getByTestId('y-axis-left')).toHaveAttribute('data-label', 'Revenue ($)');
    });

    it('applies right Y-axis label when provided', () => {
      const seriesWithRightAxis: SeriesConfig[] = [
        { dataKey: 'cases', name: 'Cases', type: 'line', color: '#22c55e', yAxisId: 'right' }
      ];

      render(
        <TimeSeriesChart
          data={mockData}
          series={seriesWithRightAxis}
          yAxisLabelRight="Case Count"
        />
      );

      expect(screen.getByTestId('y-axis-right')).toHaveAttribute('data-label', 'Case Count');
    });
  });

  describe('Formatters', () => {
    it('accepts custom date formatter', () => {
      const formatDate = (value: string) => new Date(value).toLocaleDateString();

      render(<TimeSeriesChart data={mockData} series={defaultSeries} formatDate={formatDate} />);

      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('accepts custom value formatters', () => {
      const formatValueLeft = (value: number) => `$${value.toLocaleString()}`;
      const formatValueRight = (value: number) => value.toString();

      render(
        <TimeSeriesChart
          data={mockData}
          series={defaultSeries}
          formatValueLeft={formatValueLeft}
          formatValueRight={formatValueRight}
        />
      );

      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });
  });

  describe('Sync ID', () => {
    it('applies syncId for chart synchronization', () => {
      render(<TimeSeriesChart data={mockData} series={defaultSeries} syncId="dashboard-sync" />);

      expect(screen.getByTestId('composed-chart')).toHaveAttribute('data-sync-id', 'dashboard-sync');
    });
  });

  describe('Height Configuration', () => {
    it('uses default height of 400', () => {
      render(<TimeSeriesChart data={mockData} series={defaultSeries} />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveStyle({ height: '400px' });
    });

    it('applies custom height', () => {
      render(<TimeSeriesChart data={mockData} series={defaultSeries} height={600} />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveStyle({ height: '600px' });
    });
  });

  describe('Stacked Series', () => {
    it('renders stacked bars with stackId', () => {
      const stackedSeries: SeriesConfig[] = [
        { dataKey: 'revenue', name: 'Revenue', type: 'bar', color: '#3b82f6', stackId: 'stack1' },
        { dataKey: 'cases', name: 'Cases', type: 'bar', color: '#22c55e', stackId: 'stack1' }
      ];

      render(<TimeSeriesChart data={mockData} series={stackedSeries} />);

      expect(screen.getByTestId('bar-revenue')).toHaveAttribute('data-stack-id', 'stack1');
      expect(screen.getByTestId('bar-cases')).toHaveAttribute('data-stack-id', 'stack1');
    });
  });

  describe('Tooltip', () => {
    it('renders tooltip component', () => {
      render(<TimeSeriesChart data={mockData} series={defaultSeries} />);

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<TimeSeriesChart data={mockData} series={defaultSeries} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Edge Cases', () => {
    it('handles single data point', () => {
      const singlePoint: TimeSeriesDataPoint[] = [
        { timestamp: '2024-01-01', revenue: 100000 }
      ];

      render(<TimeSeriesChart data={singlePoint} series={defaultSeries} />);

      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('handles empty series array', () => {
      render(<TimeSeriesChart data={mockData} series={[]} />);

      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('handles zero values', () => {
      const zeroData: TimeSeriesDataPoint[] = [
        { timestamp: '2024-01-01', revenue: 0, cases: 0 },
        { timestamp: '2024-01-02', revenue: 0, cases: 0 }
      ];

      render(<TimeSeriesChart data={zeroData} series={defaultSeries} />);

      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('handles negative values', () => {
      const negativeData: TimeSeriesDataPoint[] = [
        { timestamp: '2024-01-01', revenue: -50000, cases: 45 },
        { timestamp: '2024-01-02', revenue: 100000, cases: 52 }
      ];

      render(<TimeSeriesChart data={negativeData} series={defaultSeries} />);

      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('handles very large datasets', () => {
      const largeData: TimeSeriesDataPoint[] = Array.from({ length: 365 }, (_, i) => ({
        timestamp: `2024-${String(Math.floor(i / 30) + 1).padStart(2, '0')}-${String((i % 30) + 1).padStart(2, '0')}`,
        revenue: Math.floor(Math.random() * 1000000),
        cases: Math.floor(Math.random() * 100)
      }));

      render(<TimeSeriesChart data={largeData} series={defaultSeries} />);

      expect(screen.getByTestId('composed-chart')).toHaveAttribute('data-length', '365');
    });

    it('handles missing data fields', () => {
      const incompleteData: TimeSeriesDataPoint[] = [
        { timestamp: '2024-01-01', revenue: 100000 },
        { timestamp: '2024-01-02', cases: 52 }
      ];

      render(<TimeSeriesChart data={incompleteData} series={defaultSeries} />);

      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });
  });
});
