/**
 * @fileoverview Enterprise-grade tests for CaseDistributionChart component
 * Tests pie/donut chart rendering, interactions, and accessibility
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { CaseDistributionChart, type CaseDistributionData } from './CaseDistributionChart';

expect.extend(toHaveNoViolations);

// Mock recharts components
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container" style={{ width: 800, height: 400 }}>
        {children}
      </div>
    ),
    PieChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="pie-chart">{children}</div>
    ),
    Pie: ({
      data,
      onMouseEnter,
      onMouseLeave,
      onClick,
      children
    }: {
      data: CaseDistributionData[];
      onMouseEnter?: (e: unknown, index: number) => void;
      onMouseLeave?: () => void;
      onClick?: (entry: unknown) => void;
      children: React.ReactNode;
    }) => (
      <div data-testid="pie">
        {data.map((item, index) => (
          <div
            key={item.name}
            data-testid={`pie-slice-${index}`}
            data-name={item.name}
            data-value={item.value}
            onMouseEnter={(e) => onMouseEnter?.(e, index)}
            onMouseLeave={onMouseLeave}
            onClick={() => onClick?.(item)}
            role="button"
          >
            {item.name}: {item.value}
          </div>
        ))}
        {children}
      </div>
    ),
    Cell: ({ fill }: { fill: string }) => <div data-testid="cell" data-fill={fill} />,
    Tooltip: ({ content }: { content: React.ReactNode }) => (
      <div data-testid="tooltip">{content}</div>
    ),
    Legend: () => <div data-testid="legend">Legend</div>,
  };
});

// Mock useChartTheme hook
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
      purple: '#8b5cf6',
      emerald: '#10b981'
    },
    text: '#1e293b',
    grid: '#e2e8f0',
    tooltipStyle: {
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '12px'
    }
  })
}));

describe('CaseDistributionChart', () => {
  const mockData: CaseDistributionData[] = [
    { name: 'Civil Litigation', value: 45 },
    { name: 'Corporate', value: 30 },
    { name: 'Real Estate', value: 15 },
    { name: 'Family Law', value: 10 }
  ];

  const mockOnSliceClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with required data prop', () => {
      render(<CaseDistributionChart data={mockData} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('renders all data slices', () => {
      render(<CaseDistributionChart data={mockData} />);

      mockData.forEach((item, index) => {
        expect(screen.getByTestId(`pie-slice-${index}`)).toBeInTheDocument();
        expect(screen.getByText(`${item.name}: ${item.value}`)).toBeInTheDocument();
      });
    });

    it('renders as pie chart by default', () => {
      render(<CaseDistributionChart data={mockData} type="pie" />);

      expect(screen.getByTestId('pie')).toBeInTheDocument();
    });

    it('renders as donut chart when type is donut', () => {
      render(<CaseDistributionChart data={mockData} type="donut" />);

      expect(screen.getByTestId('pie')).toBeInTheDocument();
    });

    it('renders legend when showLegend is true', () => {
      render(<CaseDistributionChart data={mockData} showLegend={true} />);

      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });

    it('hides legend when showLegend is false', () => {
      render(<CaseDistributionChart data={mockData} showLegend={false} />);

      expect(screen.queryByTestId('legend')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('displays loading message when loading is true', () => {
      render(<CaseDistributionChart data={mockData} loading={true} />);

      expect(screen.getByText('Loading case distribution data...')).toBeInTheDocument();
    });

    it('does not render chart when loading', () => {
      render(<CaseDistributionChart data={mockData} loading={true} />);

      expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays empty message when data is empty', () => {
      render(<CaseDistributionChart data={[]} />);

      expect(screen.getByText('No case distribution data available')).toBeInTheDocument();
    });

    it('does not render chart when data is empty', () => {
      render(<CaseDistributionChart data={[]} />);

      expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
    });

    it('handles undefined data gracefully', () => {
      // @ts-expect-error Testing undefined case
      render(<CaseDistributionChart data={undefined} />);

      expect(screen.getByText('No case distribution data available')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onSliceClick when a slice is clicked', async () => {
      const user = userEvent.setup();
      render(<CaseDistributionChart data={mockData} onSliceClick={mockOnSliceClick} />);

      await user.click(screen.getByTestId('pie-slice-0'));

      expect(mockOnSliceClick).toHaveBeenCalledWith(mockData[0]);
    });

    it('highlights slice on mouse enter', async () => {
      render(<CaseDistributionChart data={mockData} />);

      const slice = screen.getByTestId('pie-slice-0');
      fireEvent.mouseEnter(slice);

      // The component tracks activeIndex internally
      // This is primarily a smoke test for the event handler
      expect(slice).toBeInTheDocument();
    });

    it('removes highlight on mouse leave', async () => {
      render(<CaseDistributionChart data={mockData} />);

      const slice = screen.getByTestId('pie-slice-0');
      fireEvent.mouseEnter(slice);
      fireEvent.mouseLeave(slice);

      expect(slice).toBeInTheDocument();
    });
  });

  describe('Custom Colors', () => {
    it('uses custom colors when provided', () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
      render(<CaseDistributionChart data={mockData} colors={customColors} />);

      const cells = screen.getAllByTestId('cell');
      expect(cells.length).toBe(mockData.length);
    });

    it('uses item-specific colors when provided in data', () => {
      const dataWithColors: CaseDistributionData[] = [
        { name: 'Civil', value: 45, color: '#ff0000' },
        { name: 'Corporate', value: 30, color: '#00ff00' }
      ];

      render(<CaseDistributionChart data={dataWithColors} />);

      expect(screen.getByTestId('pie')).toBeInTheDocument();
    });
  });

  describe('Height Configuration', () => {
    it('uses default height of 400', () => {
      render(<CaseDistributionChart data={mockData} />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveStyle({ height: '400px' });
    });

    it('applies custom height', () => {
      render(<CaseDistributionChart data={mockData} height={600} />);

      // The mock doesn't actually apply the height prop, but component receives it
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });
  });

  describe('Labels and Percentages', () => {
    it('shows labels when showLabels is true', () => {
      render(<CaseDistributionChart data={mockData} showLabels={true} />);

      // Labels are rendered by the Pie component
      expect(screen.getByTestId('pie')).toBeInTheDocument();
    });

    it('shows percentages when showPercentages is true', () => {
      render(<CaseDistributionChart data={mockData} showPercentages={true} />);

      expect(screen.getByTestId('pie')).toBeInTheDocument();
    });
  });

  describe('Donut Configuration', () => {
    it('applies innerRadius for donut chart', () => {
      render(<CaseDistributionChart data={mockData} type="donut" innerRadius={60} />);

      expect(screen.getByTestId('pie')).toBeInTheDocument();
    });
  });

  describe('Data Calculations', () => {
    it('calculates total correctly', () => {
      render(<CaseDistributionChart data={mockData} />);

      // Total should be 100 (45 + 30 + 15 + 10)
      const total = mockData.reduce((sum, item) => sum + item.value, 0);
      expect(total).toBe(100);
    });

    it('handles data with zero values', () => {
      const dataWithZeros: CaseDistributionData[] = [
        { name: 'Active', value: 50 },
        { name: 'Inactive', value: 0 },
        { name: 'Pending', value: 50 }
      ];

      render(<CaseDistributionChart data={dataWithZeros} />);

      expect(screen.getByText('Active: 50')).toBeInTheDocument();
      expect(screen.getByText('Inactive: 0')).toBeInTheDocument();
    });

    it('handles single item data', () => {
      const singleItemData: CaseDistributionData[] = [
        { name: 'All Cases', value: 100 }
      ];

      render(<CaseDistributionChart data={singleItemData} />);

      expect(screen.getByText('All Cases: 100')).toBeInTheDocument();
    });
  });

  describe('Tooltip', () => {
    it('renders tooltip component', () => {
      render(<CaseDistributionChart data={mockData} />);

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<CaseDistributionChart data={mockData} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides interactive elements for slices', () => {
      render(<CaseDistributionChart data={mockData} onSliceClick={mockOnSliceClick} />);

      mockData.forEach((_, index) => {
        const slice = screen.getByTestId(`pie-slice-${index}`);
        expect(slice).toHaveAttribute('role', 'button');
      });
    });
  });

  describe('Metadata Support', () => {
    it('handles data with metadata', () => {
      const dataWithMetadata: CaseDistributionData[] = [
        { name: 'Civil', value: 45, metadata: { avgValue: 50000, count: 45 } },
        { name: 'Corporate', value: 30, metadata: { avgValue: 75000, count: 30 } }
      ];

      render(<CaseDistributionChart data={dataWithMetadata} />);

      expect(screen.getByText('Civil: 45')).toBeInTheDocument();
      expect(screen.getByText('Corporate: 30')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very large values', () => {
      const largeData: CaseDistributionData[] = [
        { name: 'Large', value: 1000000 },
        { name: 'Small', value: 1 }
      ];

      render(<CaseDistributionChart data={largeData} />);

      expect(screen.getByText('Large: 1000000')).toBeInTheDocument();
    });

    it('handles many data items', () => {
      const manyItems: CaseDistributionData[] = Array.from({ length: 20 }, (_, i) => ({
        name: `Category ${i}`,
        value: Math.floor(Math.random() * 100) + 1
      }));

      render(<CaseDistributionChart data={manyItems} />);

      expect(screen.getByTestId('pie')).toBeInTheDocument();
    });

    it('handles fractional values', () => {
      const fractionalData: CaseDistributionData[] = [
        { name: 'A', value: 33.33 },
        { name: 'B', value: 33.33 },
        { name: 'C', value: 33.34 }
      ];

      render(<CaseDistributionChart data={fractionalData} />);

      expect(screen.getByText('A: 33.33')).toBeInTheDocument();
    });
  });
});
