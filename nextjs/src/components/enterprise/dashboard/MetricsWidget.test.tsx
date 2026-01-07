/**
 * @module components/enterprise/dashboard/MetricsWidget.test
 * @description Unit tests for MetricsWidget component.
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MetricsWidget, MetricsWidgetProps, MetricItem } from './MetricsWidget';

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
    div: ({ children, className, ...props }: React.ComponentProps<'div'>) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
    p: ({ children, className, ...props }: React.ComponentProps<'p'>) => (
      <p className={className} {...props}>
        {children}
      </p>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  AlertCircle: ({ className }: { className?: string }) => (
    <svg data-testid="error-icon" className={className} />
  ),
  RefreshCw: ({ className }: { className?: string }) => (
    <svg data-testid="refresh-icon" className={className} />
  ),
  TrendingUp: ({ className }: { className?: string }) => (
    <svg data-testid="trending-up-icon" className={className} />
  ),
}));

// ============================================================================
// TEST DATA
// ============================================================================

const mockMetrics: MetricItem[] = [
  { id: '1', label: 'Active Cases', value: 45, change: 12, changeType: 'increase' },
  { id: '2', label: 'Pending Tasks', value: 128, change: -5, changeType: 'decrease' },
  { id: '3', label: 'Documents', value: 1234, unit: 'files' },
  { id: '4', label: 'Team Members', value: 15 },
];

// ============================================================================
// TEST SETUP
// ============================================================================

const defaultProps: MetricsWidgetProps = {
  title: 'Key Metrics',
  metrics: mockMetrics,
};

const renderMetricsWidget = (props: Partial<MetricsWidgetProps> = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<MetricsWidget {...mergedProps} />);
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// ============================================================================
// RENDERING TESTS
// ============================================================================

describe('MetricsWidget rendering', () => {
  it('should render title', () => {
    renderMetricsWidget();

    expect(screen.getByText('Key Metrics')).toBeInTheDocument();
  });

  it('should render all metrics', () => {
    renderMetricsWidget();

    expect(screen.getByText('Active Cases')).toBeInTheDocument();
    expect(screen.getByText('Pending Tasks')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('Team Members')).toBeInTheDocument();
  });

  it('should render metric values', () => {
    renderMetricsWidget();

    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('128')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('should render units when provided', () => {
    renderMetricsWidget();

    expect(screen.getByText('files')).toBeInTheDocument();
  });

  it('should show last update time', () => {
    renderMetricsWidget();

    expect(screen.getByText(/last updated/i)).toBeInTheDocument();
  });
});

// ============================================================================
// CHANGE INDICATOR TESTS
// ============================================================================

describe('MetricsWidget change indicators', () => {
  it('should show positive change', () => {
    renderMetricsWidget();

    expect(screen.getByText('+12% from last period')).toBeInTheDocument();
  });

  it('should show negative change', () => {
    renderMetricsWidget();

    expect(screen.getByText('-5% from last period')).toBeInTheDocument();
  });

  it('should apply correct color for increase', () => {
    renderMetricsWidget();

    const increaseText = screen.getByText('+12% from last period');
    expect(increaseText).toHaveClass('text-emerald-600');
  });

  it('should apply correct color for decrease', () => {
    renderMetricsWidget();

    const decreaseText = screen.getByText('-5% from last period');
    expect(decreaseText).toHaveClass('text-rose-600');
  });
});

// ============================================================================
// REFRESH TESTS
// ============================================================================

describe('MetricsWidget refresh', () => {
  it('should render refresh button when onRefresh provided', () => {
    renderMetricsWidget({ onRefresh: jest.fn() });

    expect(screen.getByLabelText('Refresh metrics')).toBeInTheDocument();
  });

  it('should not render refresh button when onRefresh not provided', () => {
    renderMetricsWidget();

    expect(screen.queryByLabelText('Refresh metrics')).not.toBeInTheDocument();
  });

  it('should call onRefresh when refresh button clicked', async () => {
    const onRefresh = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderMetricsWidget({ onRefresh });

    await user.click(screen.getByLabelText('Refresh metrics'));

    expect(onRefresh).toHaveBeenCalled();
  });

  it('should disable refresh button when loading', () => {
    renderMetricsWidget({ onRefresh: jest.fn(), isLoading: true });

    expect(screen.getByLabelText('Refresh metrics')).toBeDisabled();
  });

  it('should show spinning icon when loading', () => {
    renderMetricsWidget({ onRefresh: jest.fn(), isLoading: true });

    const refreshIcon = screen.getByTestId('refresh-icon');
    expect(refreshIcon).toHaveClass('animate-spin');
  });
});

// ============================================================================
// AUTO REFRESH TESTS
// ============================================================================

describe('MetricsWidget auto refresh', () => {
  it('should auto refresh at specified interval', async () => {
    const onRefresh = jest.fn();
    renderMetricsWidget({ onRefresh, autoRefresh: true, refreshInterval: 5000 });

    // Advance past refresh interval
    act(() => {
      jest.advanceTimersByTime(5500);
    });

    expect(onRefresh).toHaveBeenCalled();
  });

  it('should not auto refresh when disabled', () => {
    const onRefresh = jest.fn();
    renderMetricsWidget({ onRefresh, autoRefresh: false, refreshInterval: 5000 });

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('should cleanup interval on unmount', () => {
    const onRefresh = jest.fn();
    const { unmount } = renderMetricsWidget({ onRefresh, autoRefresh: true, refreshInterval: 5000 });

    unmount();

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(onRefresh).not.toHaveBeenCalled();
  });
});

// ============================================================================
// LOADING STATE TESTS
// ============================================================================

describe('MetricsWidget loading state', () => {
  it('should show loading spinner when loading with no metrics', () => {
    renderMetricsWidget({ metrics: [], isLoading: true });

    expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
    expect(screen.getByTestId('refresh-icon')).toHaveClass('animate-spin');
  });

  it('should show metrics when loading with existing metrics', () => {
    renderMetricsWidget({ isLoading: true });

    expect(screen.getByText('Active Cases')).toBeInTheDocument();
  });
});

// ============================================================================
// ERROR STATE TESTS
// ============================================================================

describe('MetricsWidget error state', () => {
  it('should show error message when error provided', () => {
    renderMetricsWidget({ error: 'Failed to load metrics' });

    expect(screen.getByText('Failed to load metrics')).toBeInTheDocument();
    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
  });

  it('should still show metrics when error displayed', () => {
    renderMetricsWidget({ error: 'Network error' });

    expect(screen.getByText('Active Cases')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });
});

// ============================================================================
// COLUMNS TESTS
// ============================================================================

describe('MetricsWidget columns', () => {
  it('should apply 1 column layout', () => {
    const { container } = renderMetricsWidget({ columns: 1 });

    const grid = container.querySelector('.grid-cols-1');
    expect(grid).toBeInTheDocument();
  });

  it('should apply 2 column layout (default)', () => {
    const { container } = renderMetricsWidget({ columns: 2 });

    const grid = container.querySelector('.grid-cols-1');
    expect(grid).toBeInTheDocument();
    expect(container.querySelector('.md\\:grid-cols-2')).toBeInTheDocument();
  });

  it('should apply 3 column layout', () => {
    const { container } = renderMetricsWidget({ columns: 3 });

    expect(container.querySelector('.lg\\:grid-cols-3')).toBeInTheDocument();
  });

  it('should apply 4 column layout', () => {
    const { container } = renderMetricsWidget({ columns: 4 });

    expect(container.querySelector('.lg\\:grid-cols-4')).toBeInTheDocument();
  });
});

// ============================================================================
// STYLING TESTS
// ============================================================================

describe('MetricsWidget styling', () => {
  it('should apply custom className', () => {
    const { container } = renderMetricsWidget({ className: 'custom-widget' });

    expect(container.firstChild).toHaveClass('custom-widget');
  });
});

// ============================================================================
// MEMO TESTS
// ============================================================================

describe('MetricsWidget memo', () => {
  it('should have correct displayName', () => {
    expect(MetricsWidget.displayName).toBe('MetricsWidget');
  });
});

// ============================================================================
// ICON TESTS
// ============================================================================

describe('MetricsWidget icons', () => {
  it('should render metric icon when provided', () => {
    const metricsWithIcon: MetricItem[] = [
      {
        id: '1',
        label: 'Test Metric',
        value: 100,
        icon: () => <svg data-testid="custom-metric-icon" />,
      },
    ];
    renderMetricsWidget({ metrics: metricsWithIcon });

    expect(screen.getByTestId('custom-metric-icon')).toBeInTheDocument();
  });
});
