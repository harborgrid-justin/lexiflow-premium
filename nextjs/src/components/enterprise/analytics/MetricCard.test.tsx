/**
 * @fileoverview Enterprise-grade tests for MetricCard component
 * Tests metric display, trend indicators, value formatting, and styling
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MetricCard, type MetricCardProps } from './MetricCard';
import type { MetricCardData } from '@/types/analytics-enterprise';

expect.extend(toHaveNoViolations);

describe('MetricCard', () => {
  const defaultData: MetricCardData = {
    label: 'Total Revenue',
    value: 125000,
    format: 'currency'
  };

  const defaultProps: MetricCardProps = {
    data: defaultData
  };

  describe('Rendering', () => {
    it('renders with required props', () => {
      render(<MetricCard {...defaultProps} />);

      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    });

    it('displays label correctly', () => {
      render(<MetricCard {...defaultProps} />);

      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    });

    it('displays value correctly', () => {
      render(<MetricCard {...defaultProps} />);

      expect(screen.getByText('$125,000')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <MetricCard {...defaultProps} className="custom-metric-class" />
      );

      expect(container.firstChild).toHaveClass('custom-metric-class');
    });
  });

  describe('Value Formatting', () => {
    it('formats currency values correctly', () => {
      render(<MetricCard data={{ ...defaultData, value: 12345.67, format: 'currency' }} />);

      expect(screen.getByText('$12,346')).toBeInTheDocument();
    });

    it('formats percentage values correctly', () => {
      render(<MetricCard data={{ ...defaultData, value: 75.5, format: 'percentage' }} />);

      expect(screen.getByText('75.5%')).toBeInTheDocument();
    });

    it('formats duration values correctly', () => {
      render(<MetricCard data={{ ...defaultData, value: 14, format: 'duration' }} />);

      expect(screen.getByText('14 days')).toBeInTheDocument();
    });

    it('formats number values with locale string', () => {
      render(<MetricCard data={{ ...defaultData, value: 1234567, format: 'number' }} />);

      expect(screen.getByText('1,234,567')).toBeInTheDocument();
    });

    it('displays string values as-is', () => {
      render(<MetricCard data={{ ...defaultData, value: 'Custom Value' }} />);

      expect(screen.getByText('Custom Value')).toBeInTheDocument();
    });

    it('displays unit when provided', () => {
      render(<MetricCard data={{ ...defaultData, unit: 'hrs' }} />);

      expect(screen.getByText('hrs')).toBeInTheDocument();
    });
  });

  describe('Trend Indicator', () => {
    it('displays trend when provided', () => {
      const dataWithTrend: MetricCardData = {
        ...defaultData,
        trend: {
          direction: 'up',
          value: 12.5,
          period: 'last month'
        }
      };

      render(<MetricCard data={dataWithTrend} />);

      expect(screen.getByText('+12.5%')).toBeInTheDocument();
      expect(screen.getByText('vs last month')).toBeInTheDocument();
    });

    it('displays upward trend icon for up direction', () => {
      const dataWithTrend: MetricCardData = {
        ...defaultData,
        trend: {
          direction: 'up',
          value: 10,
          period: 'last week'
        }
      };

      const { container } = render(<MetricCard data={dataWithTrend} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('displays downward trend icon for down direction', () => {
      const dataWithTrend: MetricCardData = {
        ...defaultData,
        trend: {
          direction: 'down',
          value: -8.5,
          period: 'last week'
        }
      };

      render(<MetricCard data={dataWithTrend} />);

      expect(screen.getByText('-8.5%')).toBeInTheDocument();
    });

    it('displays neutral trend icon for neutral direction', () => {
      const dataWithTrend: MetricCardData = {
        ...defaultData,
        trend: {
          direction: 'neutral',
          value: 0,
          period: 'last week'
        }
      };

      const { container } = render(<MetricCard data={dataWithTrend} />);

      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('applies green color for positive trend (default)', () => {
      const dataWithTrend: MetricCardData = {
        ...defaultData,
        trend: {
          direction: 'up',
          value: 15,
          period: 'last month'
        }
      };

      render(<MetricCard data={dataWithTrend} />);

      const trendElement = screen.getByText('+15.0%').closest('div');
      expect(trendElement).toHaveClass('text-green-600');
    });

    it('applies red color for negative trend (default)', () => {
      const dataWithTrend: MetricCardData = {
        ...defaultData,
        trend: {
          direction: 'down',
          value: -10,
          period: 'last month'
        }
      };

      render(<MetricCard data={dataWithTrend} />);

      const trendElement = screen.getByText('-10.0%').closest('div');
      expect(trendElement).toHaveClass('text-red-600');
    });

    it('reverses trend colors when card color is red', () => {
      const dataWithTrend: MetricCardData = {
        ...defaultData,
        color: 'red',
        trend: {
          direction: 'up',
          value: 15,
          period: 'last month'
        }
      };

      render(<MetricCard data={dataWithTrend} />);

      // For red cards, up is bad (red), down is good (green)
      const trendElement = screen.getByText('+15.0%').closest('div');
      expect(trendElement).toHaveClass('text-red-600');
    });
  });

  describe('Color Variants', () => {
    it('applies blue border color', () => {
      const { container } = render(
        <MetricCard data={{ ...defaultData, color: 'blue' }} />
      );

      expect(container.firstChild).toHaveClass('border-blue-200');
    });

    it('applies green border color', () => {
      const { container } = render(
        <MetricCard data={{ ...defaultData, color: 'green' }} />
      );

      expect(container.firstChild).toHaveClass('border-green-200');
    });

    it('applies red border color', () => {
      const { container } = render(
        <MetricCard data={{ ...defaultData, color: 'red' }} />
      );

      expect(container.firstChild).toHaveClass('border-red-200');
    });

    it('applies yellow border color', () => {
      const { container } = render(
        <MetricCard data={{ ...defaultData, color: 'yellow' }} />
      );

      expect(container.firstChild).toHaveClass('border-yellow-200');
    });

    it('applies purple border color', () => {
      const { container } = render(
        <MetricCard data={{ ...defaultData, color: 'purple' }} />
      );

      expect(container.firstChild).toHaveClass('border-purple-200');
    });

    it('defaults to gray border color', () => {
      const { container } = render(<MetricCard data={defaultData} />);

      expect(container.firstChild).toHaveClass('border-gray-200');
    });
  });

  describe('Icon Display', () => {
    it('displays icon when provided', () => {
      const dataWithIcon: MetricCardData = {
        ...defaultData,
        icon: '💰'
      };

      render(<MetricCard data={dataWithIcon} />);

      expect(screen.getByText('💰')).toBeInTheDocument();
    });

    it('applies correct icon background based on color', () => {
      const dataWithIcon: MetricCardData = {
        ...defaultData,
        icon: '💰',
        color: 'blue'
      };

      render(<MetricCard data={dataWithIcon} />);

      const iconContainer = screen.getByText('💰').closest('div');
      expect(iconContainer).toHaveClass('bg-blue-50');
    });

    it('does not render icon container when no icon provided', () => {
      const { container } = render(<MetricCard data={defaultData} />);

      const iconContainers = container.querySelectorAll('.text-2xl');
      expect(iconContainers.length).toBe(0);
    });
  });

  describe('Loading State', () => {
    it('displays loading skeleton when loading is true', () => {
      render(<MetricCard {...defaultProps} loading={true} />);

      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('hides content when loading', () => {
      render(<MetricCard {...defaultProps} loading={true} />);

      expect(screen.queryByText('Total Revenue')).not.toBeInTheDocument();
      expect(screen.queryByText('$125,000')).not.toBeInTheDocument();
    });

    it('shows content when not loading', () => {
      render(<MetricCard {...defaultProps} loading={false} />);

      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('$125,000')).toBeInTheDocument();
    });

    it('renders skeleton with correct structure', () => {
      const { container } = render(<MetricCard {...defaultProps} loading={true} />);

      const skeletonElements = container.querySelectorAll('.bg-gray-200');
      expect(skeletonElements.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Styling', () => {
    it('has rounded corners', () => {
      const { container } = render(<MetricCard {...defaultProps} />);

      expect(container.firstChild).toHaveClass('rounded-lg');
    });

    it('has border styling', () => {
      const { container } = render(<MetricCard {...defaultProps} />);

      expect(container.firstChild).toHaveClass('border');
    });

    it('has proper padding', () => {
      const { container } = render(<MetricCard {...defaultProps} />);

      expect(container.firstChild).toHaveClass('p-6');
    });

    it('has white background', () => {
      const { container } = render(<MetricCard {...defaultProps} />);

      expect(container.firstChild).toHaveClass('bg-white');
    });

    it('has hover shadow effect', () => {
      const { container } = render(<MetricCard {...defaultProps} />);

      expect(container.firstChild).toHaveClass('hover:shadow-md');
    });

    it('applies dark mode styles', () => {
      const { container } = render(<MetricCard {...defaultProps} />);

      expect(container.firstChild).toHaveClass('dark:bg-gray-800');
    });
  });

  describe('Typography', () => {
    it('displays label with correct text style', () => {
      render(<MetricCard {...defaultProps} />);

      const label = screen.getByText('Total Revenue');
      expect(label).toHaveClass('text-sm');
      expect(label).toHaveClass('font-medium');
    });

    it('displays value with correct text style', () => {
      render(<MetricCard {...defaultProps} />);

      const value = screen.getByText('$125,000');
      expect(value).toHaveClass('text-3xl');
      expect(value).toHaveClass('font-bold');
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<MetricCard {...defaultProps} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations with trend', async () => {
      const dataWithTrend: MetricCardData = {
        ...defaultData,
        trend: {
          direction: 'up',
          value: 12.5,
          period: 'last month'
        }
      };

      const { container } = render(<MetricCard data={dataWithTrend} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Edge Cases', () => {
    it('handles zero value', () => {
      render(<MetricCard data={{ ...defaultData, value: 0 }} />);

      expect(screen.getByText('$0')).toBeInTheDocument();
    });

    it('handles negative values', () => {
      render(<MetricCard data={{ ...defaultData, value: -5000, format: 'currency' }} />);

      expect(screen.getByText('$-5,000')).toBeInTheDocument();
    });

    it('handles very large values', () => {
      render(<MetricCard data={{ ...defaultData, value: 1000000000, format: 'number' }} />);

      expect(screen.getByText('1,000,000,000')).toBeInTheDocument();
    });

    it('handles decimal percentage values', () => {
      render(<MetricCard data={{ ...defaultData, value: 33.333, format: 'percentage' }} />);

      expect(screen.getByText('33.3%')).toBeInTheDocument();
    });

    it('handles empty label', () => {
      render(<MetricCard data={{ ...defaultData, label: '' }} />);

      expect(screen.getByText('$125,000')).toBeInTheDocument();
    });

    it('handles zero trend value', () => {
      const dataWithZeroTrend: MetricCardData = {
        ...defaultData,
        trend: {
          direction: 'neutral',
          value: 0,
          period: 'last month'
        }
      };

      render(<MetricCard data={dataWithZeroTrend} />);

      expect(screen.getByText('+0.0%')).toBeInTheDocument();
    });
  });
});
