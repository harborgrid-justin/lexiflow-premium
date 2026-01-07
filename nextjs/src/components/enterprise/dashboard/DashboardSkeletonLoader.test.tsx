/**
 * @module components/enterprise/dashboard/DashboardSkeletonLoader.test
 * @description Unit tests for DashboardSkeletonLoader components.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Skeleton,
  KPICardSkeleton,
  MetricsGridSkeleton,
  ChartSkeleton,
  ActivityFeedSkeleton,
  TableSkeleton,
  DashboardSkeleton,
  WidgetSkeleton,
} from './DashboardSkeletonLoader';

// ============================================================================
// MOCKS
// ============================================================================

// Mock useTheme
jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: 'bg-white', raised: 'bg-gray-50', highlight: 'bg-gray-100' },
      text: { primary: 'text-gray-900', secondary: 'text-gray-600', tertiary: 'text-gray-400' },
      border: { default: 'border-gray-200', subtle: 'border-gray-100' },
    },
  }),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, style, ...props }: React.ComponentProps<'div'>) => (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    ),
  },
}));

// ============================================================================
// SKELETON BASE COMPONENT TESTS
// ============================================================================

describe('Skeleton', () => {
  it('should render with default props', () => {
    const { container } = render(<Skeleton />);

    expect(container.firstChild).toHaveClass('bg-gray-200', 'animate-pulse', 'rounded');
  });

  it('should render text variant', () => {
    const { container } = render(<Skeleton variant="text" />);

    expect(container.firstChild).toHaveClass('rounded', 'h-4');
  });

  it('should render circular variant', () => {
    const { container } = render(<Skeleton variant="circular" />);

    expect(container.firstChild).toHaveClass('rounded-full');
  });

  it('should render rounded variant', () => {
    const { container } = render(<Skeleton variant="rounded" />);

    expect(container.firstChild).toHaveClass('rounded-lg');
  });

  it('should render rectangular variant', () => {
    const { container } = render(<Skeleton variant="rectangular" />);

    expect(container.firstChild).toHaveClass('rounded');
  });

  it('should apply custom width', () => {
    const { container } = render(<Skeleton width={200} />);

    expect(container.firstChild).toHaveStyle({ width: '200px' });
  });

  it('should apply custom height', () => {
    const { container } = render(<Skeleton height={50} />);

    expect(container.firstChild).toHaveStyle({ height: '50px' });
  });

  it('should apply percentage width', () => {
    const { container } = render(<Skeleton width="50%" />);

    expect(container.firstChild).toHaveStyle({ width: '50%' });
  });

  it('should not animate when animated is false', () => {
    const { container } = render(<Skeleton animated={false} />);

    expect(container.firstChild).not.toHaveClass('animate-pulse');
  });

  it('should apply custom className', () => {
    const { container } = render(<Skeleton className="custom-skeleton" />);

    expect(container.firstChild).toHaveClass('custom-skeleton');
  });
});

// ============================================================================
// KPI CARD SKELETON TESTS
// ============================================================================

describe('KPICardSkeleton', () => {
  it('should render skeleton structure', () => {
    const { container } = render(<KPICardSkeleton />);

    // Should have multiple skeleton elements
    const skeletons = container.querySelectorAll('.bg-gray-200');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should apply custom className', () => {
    const { container } = render(<KPICardSkeleton className="custom-kpi" />);

    expect(container.firstChild).toHaveClass('custom-kpi');
  });

  it('should have rounded corners', () => {
    const { container } = render(<KPICardSkeleton />);

    expect(container.firstChild).toHaveClass('rounded-xl');
  });
});

// ============================================================================
// METRICS GRID SKELETON TESTS
// ============================================================================

describe('MetricsGridSkeleton', () => {
  it('should render default number of skeletons (8)', () => {
    const { container } = render(<MetricsGridSkeleton />);

    // 4 columns * 2 rows = 8 KPI card skeletons
    const cards = container.querySelectorAll('.p-6');
    expect(cards.length).toBe(8);
  });

  it('should render custom number of columns and rows', () => {
    const { container } = render(<MetricsGridSkeleton columns={3} rows={3} />);

    const cards = container.querySelectorAll('.p-6');
    expect(cards.length).toBe(9); // 3 * 3
  });

  it('should apply custom className', () => {
    const { container } = render(<MetricsGridSkeleton className="custom-grid" />);

    expect(container.firstChild).toHaveClass('custom-grid');
  });

  it('should be a grid container', () => {
    const { container } = render(<MetricsGridSkeleton />);

    expect(container.firstChild).toHaveClass('grid');
  });
});

// ============================================================================
// CHART SKELETON TESTS
// ============================================================================

describe('ChartSkeleton', () => {
  it('should render with default height', () => {
    const { container } = render(<ChartSkeleton />);

    const chartArea = container.querySelector('[style*="height: 300px"]');
    expect(chartArea).toBeInTheDocument();
  });

  it('should render with custom height', () => {
    const { container } = render(<ChartSkeleton height={500} />);

    const chartArea = container.querySelector('[style*="height: 500px"]');
    expect(chartArea).toBeInTheDocument();
  });

  it('should show header by default', () => {
    const { container } = render(<ChartSkeleton />);

    // Header has margin-bottom of mb-6
    const header = container.querySelector('.mb-6');
    expect(header).toBeInTheDocument();
  });

  it('should hide header when showHeader is false', () => {
    const { container } = render(<ChartSkeleton showHeader={false} />);

    // Without header, mb-6 should not be at the start
    const header = container.firstChild?.firstChild;
    expect(header).not.toHaveClass('mb-6');
  });

  it('should apply custom className', () => {
    const { container } = render(<ChartSkeleton className="custom-chart" />);

    expect(container.firstChild).toHaveClass('custom-chart');
  });

  it('should render simulated chart bars', () => {
    const { container } = render(<ChartSkeleton />);

    // Should have bar skeletons inside
    const bars = container.querySelectorAll('.opacity-50');
    expect(bars.length).toBe(8); // 8 simulated bars
  });
});

// ============================================================================
// ACTIVITY FEED SKELETON TESTS
// ============================================================================

describe('ActivityFeedSkeleton', () => {
  it('should render default number of items (5)', () => {
    const { container } = render(<ActivityFeedSkeleton />);

    const items = container.querySelectorAll('.p-4');
    expect(items.length).toBeGreaterThanOrEqual(5);
  });

  it('should render custom number of items', () => {
    const { container } = render(<ActivityFeedSkeleton items={3} />);

    // Each item has p-4 class
    const spaceDiv = container.querySelector('.space-y-3');
    const items = spaceDiv?.querySelectorAll('.p-4');
    expect(items?.length).toBe(3);
  });

  it('should apply custom className', () => {
    const { container } = render(<ActivityFeedSkeleton className="custom-feed" />);

    expect(container.firstChild).toHaveClass('custom-feed');
  });

  it('should have header section', () => {
    const { container } = render(<ActivityFeedSkeleton />);

    const header = container.querySelector('.border-b');
    expect(header).toBeInTheDocument();
  });
});

// ============================================================================
// TABLE SKELETON TESTS
// ============================================================================

describe('TableSkeleton', () => {
  it('should render default rows and columns', () => {
    const { container } = render(<TableSkeleton />);

    // 5 rows by default, each with grid structure
    const rows = container.querySelectorAll('.divide-y > div');
    expect(rows.length).toBe(5);
  });

  it('should render custom number of rows', () => {
    const { container } = render(<TableSkeleton rows={3} />);

    const rows = container.querySelectorAll('.divide-y > div');
    expect(rows.length).toBe(3);
  });

  it('should show header by default', () => {
    const { container } = render(<TableSkeleton />);

    const header = container.querySelector('.bg-gray-50');
    expect(header).toBeInTheDocument();
  });

  it('should hide header when showHeader is false', () => {
    const { container } = render(<TableSkeleton showHeader={false} />);

    const header = container.querySelector('.bg-gray-50');
    expect(header).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<TableSkeleton className="custom-table" />);

    expect(container.firstChild).toHaveClass('custom-table');
  });
});

// ============================================================================
// DASHBOARD SKELETON TESTS
// ============================================================================

describe('DashboardSkeleton', () => {
  it('should render complete dashboard skeleton', () => {
    const { container } = render(<DashboardSkeleton />);

    // Should have space-y-6 for spacing
    expect(container.firstChild).toHaveClass('space-y-6');
  });

  it('should render header skeleton', () => {
    const { container } = render(<DashboardSkeleton />);

    // Header has flex items-center justify-between
    const header = container.querySelector('.flex.items-center.justify-between');
    expect(header).toBeInTheDocument();
  });

  it('should render KPI cards', () => {
    const { container } = render(<DashboardSkeleton />);

    // Should have 8 KPI cards
    const kpiGrid = container.querySelector('.grid-cols-1');
    expect(kpiGrid).toBeInTheDocument();
  });

  it('should render chart skeletons', () => {
    const { container } = render(<DashboardSkeleton />);

    // Should have 2 chart areas in a grid
    const chartGrid = container.querySelector('.lg\\:grid-cols-2');
    expect(chartGrid).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<DashboardSkeleton className="custom-dashboard" />);

    expect(container.firstChild).toHaveClass('custom-dashboard');
  });
});

// ============================================================================
// WIDGET SKELETON TESTS
// ============================================================================

describe('WidgetSkeleton', () => {
  it('should render with default props', () => {
    const { container } = render(<WidgetSkeleton />);

    expect(container.firstChild).toHaveClass('rounded-xl');
  });

  it('should apply custom height', () => {
    const { container } = render(<WidgetSkeleton height={400} />);

    expect(container.firstChild).toHaveStyle({ minHeight: '400px' });
  });

  it('should show header by default', () => {
    const { container } = render(<WidgetSkeleton />);

    const header = container.querySelector('.mb-6');
    expect(header).toBeInTheDocument();
  });

  it('should hide header when showHeader is false', () => {
    const { container } = render(<WidgetSkeleton showHeader={false} />);

    const header = container.querySelector('.mb-6');
    expect(header).not.toBeInTheDocument();
  });

  it('should render custom number of header lines', () => {
    const { container } = render(<WidgetSkeleton headerLines={3} />);

    const headerSection = container.querySelector('.mb-6');
    const skeletons = headerSection?.querySelectorAll('.bg-gray-200');
    expect(skeletons?.length).toBe(3);
  });

  it('should render custom number of body lines', () => {
    const { container } = render(<WidgetSkeleton bodyLines={7} />);

    const bodySection = container.querySelector('.space-y-3');
    const skeletons = bodySection?.querySelectorAll('.bg-gray-200');
    expect(skeletons?.length).toBe(7);
  });

  it('should apply custom className', () => {
    const { container } = render(<WidgetSkeleton className="custom-widget" />);

    expect(container.firstChild).toHaveClass('custom-widget');
  });
});
