/**
 * @module components/enterprise/dashboard/KPICard.test
 * @description Unit tests for KPICard component.
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { KPICard, KPICardProps } from './KPICard';
import { DollarSign, Users } from 'lucide-react';

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
    h3: ({ children, className, ...props }: React.ComponentProps<'h3'>) => (
      <h3 className={className} {...props}>
        {children}
      </h3>
    ),
  },
}));

// Mock lucide-react with actual icon components
jest.mock('lucide-react', () => ({
  TrendingUp: ({ className }: { className?: string }) => (
    <svg data-testid="trending-up-icon" className={className} />
  ),
  TrendingDown: ({ className }: { className?: string }) => (
    <svg data-testid="trending-down-icon" className={className} />
  ),
  DollarSign: ({ className }: { className?: string }) => (
    <svg data-testid="dollar-icon" className={className} />
  ),
  Users: ({ className }: { className?: string }) => (
    <svg data-testid="users-icon" className={className} />
  ),
}));

// ============================================================================
// TEST SETUP
// ============================================================================

const defaultProps: KPICardProps = {
  title: 'Total Revenue',
  value: 125000,
};

const renderKPICard = (props: Partial<KPICardProps> = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<KPICard {...mergedProps} />);
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

describe('KPICard rendering', () => {
  it('should render title', () => {
    renderKPICard();

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
  });

  it('should render animated value', async () => {
    renderKPICard({ value: 100 });

    // Value should animate from 0 to 100
    // After animation completes, should show formatted value
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  it('should render icon when provided', () => {
    renderKPICard({ icon: DollarSign });

    expect(screen.getByTestId('dollar-icon')).toBeInTheDocument();
  });

  it('should not render icon when not provided', () => {
    renderKPICard();

    expect(screen.queryByTestId('dollar-icon')).not.toBeInTheDocument();
  });
});

// ============================================================================
// FORMAT TESTS
// ============================================================================

describe('KPICard formatting', () => {
  it('should format number values', async () => {
    renderKPICard({ value: 1234567, format: 'number' });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      // Should have locale formatting with commas
      expect(screen.getByText(/1,234,567/)).toBeInTheDocument();
    });
  });

  it('should format currency values', async () => {
    renderKPICard({ value: 50000, format: 'currency', prefix: '$' });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.getByText(/\$50,000/)).toBeInTheDocument();
    });
  });

  it('should format percentage values', async () => {
    renderKPICard({ value: 85.5, format: 'percentage', suffix: '%' });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.getByText(/85\.5%/)).toBeInTheDocument();
    });
  });

  it('should display prefix', async () => {
    renderKPICard({ value: 100, prefix: '$' });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.getByText(/\$/)).toBeInTheDocument();
    });
  });

  it('should display suffix', async () => {
    renderKPICard({ value: 100, suffix: ' units' });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.getByText(/units/)).toBeInTheDocument();
    });
  });
});

// ============================================================================
// TREND TESTS
// ============================================================================

describe('KPICard trend indicator', () => {
  it('should show upward trend icon', () => {
    renderKPICard({ trend: 'up', trendValue: '+15%' });

    expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
    expect(screen.getByText('+15%')).toBeInTheDocument();
  });

  it('should show downward trend icon', () => {
    renderKPICard({ trend: 'down', trendValue: '-10%' });

    expect(screen.getByTestId('trending-down-icon')).toBeInTheDocument();
    expect(screen.getByText('-10%')).toBeInTheDocument();
  });

  it('should show neutral trend (no icon)', () => {
    renderKPICard({ trend: 'neutral', trendValue: '0%' });

    expect(screen.queryByTestId('trending-up-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('trending-down-icon')).not.toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should show trend value without trend direction', () => {
    renderKPICard({ trendValue: 'vs last month' });

    expect(screen.getByText('vs last month')).toBeInTheDocument();
  });

  it('should not show trend section when neither trend nor trendValue provided', () => {
    renderKPICard();

    expect(screen.queryByTestId('trending-up-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('trending-down-icon')).not.toBeInTheDocument();
  });
});

// ============================================================================
// STYLING TESTS
// ============================================================================

describe('KPICard styling', () => {
  it('should apply custom className', () => {
    const { container } = renderKPICard({ className: 'custom-kpi-card' });

    expect(container.firstChild).toHaveClass('custom-kpi-card');
  });

  it('should apply custom icon color', () => {
    renderKPICard({ icon: DollarSign, iconColor: 'text-green-600' });

    const icon = screen.getByTestId('dollar-icon');
    expect(icon).toHaveClass('text-green-600');
  });

  it('should apply custom icon background color', () => {
    const { container } = renderKPICard({ icon: DollarSign, iconBgColor: 'bg-green-100' });

    const iconContainer = container.querySelector('.bg-green-100');
    expect(iconContainer).toBeInTheDocument();
  });
});

// ============================================================================
// ANIMATION TESTS
// ============================================================================

describe('KPICard animation', () => {
  it('should animate value from 0 to target', async () => {
    renderKPICard({ value: 1000, animationDuration: 500 });

    // Initially should start from 0
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // After animation duration, should reach target
    act(() => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(screen.getByText(/1,000/)).toBeInTheDocument();
    });
  });

  it('should respect custom animation duration', async () => {
    renderKPICard({ value: 500, animationDuration: 2000 });

    // Halfway through animation
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Complete animation
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    await waitFor(() => {
      expect(screen.getByText('500')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// MEMO TESTS
// ============================================================================

describe('KPICard memo', () => {
  it('should have correct displayName', () => {
    expect(KPICard.displayName).toBe('KPICard');
  });
});

// ============================================================================
// VALUE UPDATE TESTS
// ============================================================================

describe('KPICard value updates', () => {
  it('should animate when value changes', async () => {
    const { rerender } = renderKPICard({ value: 100 });

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    // Update value
    rerender(<KPICard {...defaultProps} value={200} />);

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    await waitFor(() => {
      expect(screen.getByText('200')).toBeInTheDocument();
    });
  });
});
