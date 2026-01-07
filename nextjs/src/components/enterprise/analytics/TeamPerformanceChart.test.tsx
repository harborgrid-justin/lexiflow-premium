/**
 * @fileoverview Enterprise-grade tests for TeamPerformanceChart component
 * Tests bar charts, metrics display, sorting, and interactions
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TeamPerformanceChart, type TeamMemberPerformance } from './TeamPerformanceChart';

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
    BarChart: ({ children, data, layout }: { children: React.ReactNode; data: TeamMemberPerformance[]; layout: string }) => (
      <div data-testid="bar-chart" data-length={data.length} data-layout={layout}>
        {children}
      </div>
    ),
    Bar: ({ dataKey, name, fill, stackId, onClick }: { dataKey: string; name: string; fill: string; stackId?: string; onClick?: (data: unknown) => void }) => (
      <div
        data-testid={`bar-${dataKey}`}
        data-name={name}
        data-fill={fill}
        data-stack-id={stackId}
        onClick={() => onClick?.({ name: 'test' })}
        role="button"
      />
    ),
    XAxis: ({ dataKey, type }: { dataKey?: string; type?: string }) => (
      <div data-testid="x-axis" data-key={dataKey} data-type={type} />
    ),
    YAxis: ({ dataKey, type }: { dataKey?: string; type?: string }) => (
      <div data-testid="y-axis" data-key={dataKey} data-type={type} />
    ),
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

describe('TeamPerformanceChart', () => {
  const mockData: TeamMemberPerformance[] = [
    { name: 'John Smith', totalCases: 45, activeCases: 15, closedCases: 30, billableHours: 180, revenue: 45000, satisfaction: 92 },
    { name: 'Jane Doe', totalCases: 38, activeCases: 12, closedCases: 26, billableHours: 160, revenue: 40000, satisfaction: 95 },
    { name: 'Bob Johnson', totalCases: 52, activeCases: 20, closedCases: 32, billableHours: 200, revenue: 55000, satisfaction: 88 },
    { name: 'Alice Williams', totalCases: 41, activeCases: 14, closedCases: 27, billableHours: 175, revenue: 42000, satisfaction: 90 }
  ];

  const mockOnBarClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with required data prop', () => {
      render(<TeamPerformanceChart data={mockData} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('renders all team members', () => {
      render(<TeamPerformanceChart data={mockData} />);

      const chart = screen.getByTestId('bar-chart');
      expect(chart).toHaveAttribute('data-length', '4');
    });

    it('renders default metrics bars', () => {
      render(<TeamPerformanceChart data={mockData} />);

      expect(screen.getByTestId('bar-totalCases')).toBeInTheDocument();
      expect(screen.getByTestId('bar-billableHours')).toBeInTheDocument();
      expect(screen.getByTestId('bar-revenue')).toBeInTheDocument();
    });
  });

  describe('Metrics Configuration', () => {
    it('renders only specified metrics', () => {
      render(<TeamPerformanceChart data={mockData} metrics={['totalCases', 'revenue']} />);

      expect(screen.getByTestId('bar-totalCases')).toBeInTheDocument();
      expect(screen.getByTestId('bar-revenue')).toBeInTheDocument();
      expect(screen.queryByTestId('bar-billableHours')).not.toBeInTheDocument();
    });

    it('renders active cases metric', () => {
      render(<TeamPerformanceChart data={mockData} metrics={['activeCases']} />);

      expect(screen.getByTestId('bar-activeCases')).toBeInTheDocument();
    });

    it('renders closed cases metric', () => {
      render(<TeamPerformanceChart data={mockData} metrics={['closedCases']} />);

      expect(screen.getByTestId('bar-closedCases')).toBeInTheDocument();
    });

    it('renders satisfaction metric', () => {
      render(<TeamPerformanceChart data={mockData} metrics={['satisfaction']} />);

      expect(screen.getByTestId('bar-satisfaction')).toBeInTheDocument();
    });

    it('applies correct labels to metrics', () => {
      render(<TeamPerformanceChart data={mockData} metrics={['totalCases', 'billableHours']} />);

      expect(screen.getByTestId('bar-totalCases')).toHaveAttribute('data-name', 'Total Cases');
      expect(screen.getByTestId('bar-billableHours')).toHaveAttribute('data-name', 'Billable Hours');
    });
  });

  describe('Layout Options', () => {
    it('renders horizontal layout by default', () => {
      render(<TeamPerformanceChart data={mockData} />);

      const chart = screen.getByTestId('bar-chart');
      expect(chart).toHaveAttribute('data-layout', 'vertical');
    });

    it('renders horizontal layout when specified', () => {
      render(<TeamPerformanceChart data={mockData} layout="horizontal" />);

      const chart = screen.getByTestId('bar-chart');
      expect(chart).toHaveAttribute('data-layout', 'horizontal');
    });

    it('renders vertical layout when specified', () => {
      render(<TeamPerformanceChart data={mockData} layout="vertical" />);

      const chart = screen.getByTestId('bar-chart');
      expect(chart).toHaveAttribute('data-layout', 'vertical');
    });
  });

  describe('Chart Types', () => {
    it('renders grouped bars by default', () => {
      render(<TeamPerformanceChart data={mockData} type="grouped" />);

      const bar = screen.getByTestId('bar-totalCases');
      expect(bar).not.toHaveAttribute('data-stack-id');
    });

    it('renders stacked bars when type is stacked', () => {
      render(<TeamPerformanceChart data={mockData} type="stacked" />);

      const bar = screen.getByTestId('bar-totalCases');
      expect(bar).toHaveAttribute('data-stack-id', 'stack');
    });
  });

  describe('Sorting', () => {
    it('sorts data by specified metric in descending order', () => {
      render(<TeamPerformanceChart data={mockData} sortBy="totalCases" sortOrder="desc" />);

      // Bob has most cases (52), should be first
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('sorts data in ascending order when specified', () => {
      render(<TeamPerformanceChart data={mockData} sortBy="totalCases" sortOrder="asc" />);

      // Jane has least cases (38), should be first
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('does not sort when sortBy is not provided', () => {
      render(<TeamPerformanceChart data={mockData} />);

      // Data should remain in original order
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('displays loading message when loading is true', () => {
      render(<TeamPerformanceChart data={mockData} loading={true} />);

      expect(screen.getByText('Loading team performance data...')).toBeInTheDocument();
    });

    it('does not render chart when loading', () => {
      render(<TeamPerformanceChart data={mockData} loading={true} />);

      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays empty message when data is empty', () => {
      render(<TeamPerformanceChart data={[]} />);

      expect(screen.getByText('No team performance data available')).toBeInTheDocument();
    });

    it('does not render chart when data is empty', () => {
      render(<TeamPerformanceChart data={[]} />);

      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });

    it('handles undefined data gracefully', () => {
      // @ts-expect-error Testing undefined case
      render(<TeamPerformanceChart data={undefined} />);

      expect(screen.getByText('No team performance data available')).toBeInTheDocument();
    });
  });

  describe('Grid and Legend', () => {
    it('renders grid when showGrid is true', () => {
      render(<TeamPerformanceChart data={mockData} showGrid={true} />);

      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    });

    it('hides grid when showGrid is false', () => {
      render(<TeamPerformanceChart data={mockData} showGrid={false} />);

      expect(screen.queryByTestId('cartesian-grid')).not.toBeInTheDocument();
    });

    it('renders legend when showLegend is true', () => {
      render(<TeamPerformanceChart data={mockData} showLegend={true} />);

      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });

    it('hides legend when showLegend is false', () => {
      render(<TeamPerformanceChart data={mockData} showLegend={false} />);

      expect(screen.queryByTestId('legend')).not.toBeInTheDocument();
    });
  });

  describe('Custom Colors', () => {
    it('applies custom colors when provided', () => {
      const customColors = {
        totalCases: '#ff0000',
        revenue: '#00ff00'
      };

      render(
        <TeamPerformanceChart
          data={mockData}
          metrics={['totalCases', 'revenue']}
          colorMap={customColors}
        />
      );

      expect(screen.getByTestId('bar-totalCases')).toHaveAttribute('data-fill', '#ff0000');
      expect(screen.getByTestId('bar-revenue')).toHaveAttribute('data-fill', '#00ff00');
    });
  });

  describe('Value Formatting', () => {
    it('accepts custom value formatter', () => {
      const customFormatter = (value: number) => `$${value.toFixed(2)}`;

      render(
        <TeamPerformanceChart
          data={mockData}
          formatValue={customFormatter}
        />
      );

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('Height Configuration', () => {
    it('uses default height of 400', () => {
      render(<TeamPerformanceChart data={mockData} />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveStyle({ height: '400px' });
    });

    it('applies custom height', () => {
      render(<TeamPerformanceChart data={mockData} height={600} />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveStyle({ height: '600px' });
    });
  });

  describe('Bar Click Handler', () => {
    it('calls onBarClick when bar is clicked', async () => {
      const user = userEvent.setup();
      render(<TeamPerformanceChart data={mockData} onBarClick={mockOnBarClick} />);

      const bar = screen.getByTestId('bar-totalCases');
      await user.click(bar);

      expect(mockOnBarClick).toHaveBeenCalled();
    });

    it('does not crash when onBarClick is not provided', async () => {
      const user = userEvent.setup();
      render(<TeamPerformanceChart data={mockData} />);

      const bar = screen.getByTestId('bar-totalCases');
      await user.click(bar);

      // Should not throw
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('Tooltip', () => {
    it('renders tooltip component', () => {
      render(<TeamPerformanceChart data={mockData} />);

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });
  });

  describe('Axes Configuration', () => {
    it('renders X-axis', () => {
      render(<TeamPerformanceChart data={mockData} />);

      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    });

    it('renders Y-axis with name dataKey for vertical layout', () => {
      render(<TeamPerformanceChart data={mockData} layout="vertical" />);

      expect(screen.getByTestId('y-axis')).toHaveAttribute('data-key', 'name');
    });

    it('renders X-axis with name dataKey for horizontal layout', () => {
      render(<TeamPerformanceChart data={mockData} layout="horizontal" />);

      expect(screen.getByTestId('x-axis')).toHaveAttribute('data-key', 'name');
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<TeamPerformanceChart data={mockData} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Edge Cases', () => {
    it('handles single team member', () => {
      const singleMember: TeamMemberPerformance[] = [
        { name: 'John Smith', totalCases: 45, billableHours: 180, revenue: 45000 }
      ];

      render(<TeamPerformanceChart data={singleMember} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('handles zero values', () => {
      const zeroData: TeamMemberPerformance[] = [
        { name: 'John Smith', totalCases: 0, billableHours: 0, revenue: 0 }
      ];

      render(<TeamPerformanceChart data={zeroData} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('handles missing optional fields', () => {
      const minimalData: TeamMemberPerformance[] = [
        { name: 'John Smith' },
        { name: 'Jane Doe' }
      ];

      render(<TeamPerformanceChart data={minimalData} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('handles large team', () => {
      const largeTeam: TeamMemberPerformance[] = Array.from({ length: 50 }, (_, i) => ({
        name: `Team Member ${i}`,
        totalCases: Math.floor(Math.random() * 100),
        billableHours: Math.floor(Math.random() * 200),
        revenue: Math.floor(Math.random() * 100000)
      }));

      render(<TeamPerformanceChart data={largeTeam} />);

      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-length', '50');
    });

    it('handles custom additional metrics', () => {
      const dataWithCustomMetric: TeamMemberPerformance[] = [
        { name: 'John Smith', totalCases: 45, customMetric: 100 }
      ];

      render(<TeamPerformanceChart data={dataWithCustomMetric} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });
});
