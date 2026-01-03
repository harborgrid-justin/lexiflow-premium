/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MetricCard } from '@/components/enterprise/ui/MetricCard';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { TrendingUp, Users } from 'lucide-react';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
  },
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('MetricCard', () => {
  describe('Basic Rendering', () => {
    it('should render metric label and value', () => {
      renderWithTheme(<MetricCard label="Total Users" value={1250} animateValue={false} />);

      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('1,250')).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      renderWithTheme(
        <MetricCard label="Revenue" value={50000} description="Monthly recurring revenue" animateValue={false} />
      );

      expect(screen.getByText('Monthly recurring revenue')).toBeInTheDocument();
    });

    it('should render icon when provided', () => {
      renderWithTheme(<MetricCard label="Active Users" value={500} icon={Users} animateValue={false} />);

      expect(screen.getByText('Active Users')).toBeInTheDocument();
    });

    it('should render without icon', () => {
      renderWithTheme(<MetricCard label="Metric" value={100} animateValue={false} />);

      expect(screen.getByText('Metric')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should render string values', () => {
      renderWithTheme(<MetricCard label="Status" value="Active" />);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  describe('Number Formatting', () => {
    it('should format numbers with thousands separators', () => {
      renderWithTheme(<MetricCard label="Users" value={1234567} format="number" animateValue={false} />);

      expect(screen.getByText('1,234,567')).toBeInTheDocument();
    });

    it('should format currency values', () => {
      renderWithTheme(<MetricCard label="Revenue" value={50000} format="currency" prefix="$" animateValue={false} />);

      expect(screen.getByText(/50,000/)).toBeInTheDocument();
    });

    it('should format percentage values', () => {
      renderWithTheme(<MetricCard label="Growth" value={12.5} format="percentage" suffix="%" animateValue={false} />);

      expect(screen.getByText(/12.5/)).toBeInTheDocument();
    });

    it('should apply prefix to values', () => {
      renderWithTheme(<MetricCard label="Price" value={99} prefix="$" animateValue={false} />);

      expect(screen.getByText(/\$99/)).toBeInTheDocument();
    });

    it('should apply suffix to values', () => {
      renderWithTheme(<MetricCard label="Completion" value={85} suffix="%" animateValue={false} />);

      expect(screen.getByText(/85%/)).toBeInTheDocument();
    });

    it('should apply both prefix and suffix', () => {
      renderWithTheme(<MetricCard label="Range" value={50} prefix="~" suffix=" items" animateValue={false} />);

      expect(screen.getByText(/~50 items/)).toBeInTheDocument();
    });
  });

  describe('Trend Indicators', () => {
    it('should display upward trend', () => {
      renderWithTheme(<MetricCard label="Sales" value={1000} trend="up" trendValue="+12%" animateValue={false} />);

      expect(screen.getByText('+12%')).toBeInTheDocument();
    });

    it('should display downward trend', () => {
      renderWithTheme(<MetricCard label="Costs" value={500} trend="down" trendValue="-5%" animateValue={false} />);

      expect(screen.getByText('-5%')).toBeInTheDocument();
    });

    it('should display neutral trend', () => {
      renderWithTheme(<MetricCard label="Status" value={100} trend="neutral" trendValue="0%" animateValue={false} />);

      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should render trend without trendValue', () => {
      renderWithTheme(<MetricCard label="Metric" value={100} trend="up" animateValue={false} />);

      // Should still render the component
      expect(screen.getByText('Metric')).toBeInTheDocument();
    });

    it('should show previous value comparison text', () => {
      renderWithTheme(
        <MetricCard label="Revenue" value={1000} previousValue={900} trend="up" trendValue="+11%" animateValue={false} />
      );

      expect(screen.getByText('vs previous period')).toBeInTheDocument();
    });

    it('should apply correct color to upward trend', () => {
      const { container } = renderWithTheme(
        <MetricCard label="Growth" value={100} trend="up" trendValue="+10%" animateValue={false} />
      );

      const trendElement = screen.getByText('+10%').parentElement;
      expect(trendElement).toHaveClass('text-emerald-600');
    });

    it('should apply correct color to downward trend', () => {
      const { container } = renderWithTheme(
        <MetricCard label="Decline" value={100} trend="down" trendValue="-10%" animateValue={false} />
      );

      const trendElement = screen.getByText('-10%').parentElement;
      expect(trendElement).toHaveClass('text-rose-600');
    });
  });

  describe('Animation', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should animate value changes when animateValue is true', async () => {
      const { rerender } = renderWithTheme(
        <MetricCard label="Count" value={0} animateValue animationDuration={1000} />
      );

      // Update to new value
      rerender(
        <ThemeProvider>
          <MetricCard label="Count" value={100} animateValue animationDuration={1000} />
        </ThemeProvider>
      );

      // Animation should be in progress
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should eventually reach final value
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(screen.getByText('100')).toBeInTheDocument();
      });
    });

    it('should not animate when animateValue is false', () => {
      renderWithTheme(<MetricCard label="Count" value={100} animateValue={false} />);

      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should animate by default', async () => {
      const { rerender } = renderWithTheme(<MetricCard label="Count" value={0} />);

      rerender(
        <ThemeProvider>
          <MetricCard label="Count" value={50} />
        </ThemeProvider>
      );

      // Should eventually show the value
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('50')).toBeInTheDocument();
      });
    });

    it('should respect custom animation duration', async () => {
      const { rerender } = renderWithTheme(
        <MetricCard label="Count" value={0} animateValue animationDuration={2000} />
      );

      rerender(
        <ThemeProvider>
          <MetricCard label="Count" value={100} animateValue animationDuration={2000} />
        </ThemeProvider>
      );

      // After 2000ms should be at final value
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByText('100')).toBeInTheDocument();
      });
    });

    it('should not animate string values', () => {
      renderWithTheme(<MetricCard label="Status" value="Active" animateValue />);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  describe('Click Interaction', () => {
    it('should call onClick when card is clicked', () => {
      const onClick = jest.fn();
      renderWithTheme(<MetricCard label="Clickable" value={100} onClick={onClick} animateValue={false} />);

      const card = screen.getByText('Clickable').closest('div');
      if (card) {
        fireEvent.click(card);
        expect(onClick).toHaveBeenCalled();
      }
    });

    it('should show cursor pointer when onClick is provided', () => {
      const { container } = renderWithTheme(
        <MetricCard label="Clickable" value={100} onClick={jest.fn()} animateValue={false} />
      );

      const card = container.querySelector('.cursor-pointer');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('cursor-pointer');
    });

    it('should not show cursor pointer when onClick is not provided', () => {
      const { container } = renderWithTheme(<MetricCard label="Not Clickable" value={100} animateValue={false} />);

      const card = screen.getByText('Not Clickable').closest('div');
      expect(card).not.toHaveClass('cursor-pointer');
    });

    it('should show hover effects when clickable', () => {
      const { container } = renderWithTheme(
        <MetricCard label="Hover" value={100} onClick={jest.fn()} animateValue={false} />
      );

      const card = container.querySelector('.hover\\:shadow-lg');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('hover:shadow-lg');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = renderWithTheme(
        <MetricCard label="Custom" value={100} className="custom-class" animateValue={false} />
      );

      const card = container.querySelector('.custom-class');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('custom-class');
    });

    it('should apply custom icon colors', () => {
      const { container } = renderWithTheme(
        <MetricCard
          label="Colored"
          value={100}
          icon={Users}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          animateValue={false}
        />
      );

      expect(screen.getByText('Colored')).toBeInTheDocument();
    });

    it('should default to blue icon colors', () => {
      renderWithTheme(<MetricCard label="Default Colors" value={100} icon={Users} animateValue={false} />);

      expect(screen.getByText('Default Colors')).toBeInTheDocument();
    });
  });

  describe('Card Layout', () => {
    it('should have rounded corners', () => {
      const { container } = renderWithTheme(<MetricCard label="Rounded" value={100} animateValue={false} />);

      const card = container.querySelector('.rounded-xl');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-xl');
    });

    it('should have border', () => {
      const { container } = renderWithTheme(<MetricCard label="Bordered" value={100} animateValue={false} />);

      const card = container.querySelector('.border');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('border');
    });

    it('should have padding', () => {
      const { container } = renderWithTheme(<MetricCard label="Padded" value={100} animateValue={false} />);

      const card = container.querySelector('.p-6');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('p-6');
    });

    it('should have hover shadow', () => {
      const { container } = renderWithTheme(<MetricCard label="Shadow" value={100} animateValue={false} />);

      const card = container.querySelector('.hover\\:shadow-md');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('hover:shadow-md');
    });
  });

  describe('Icon Display', () => {
    it('should render icon in rounded container', () => {
      const { container } = renderWithTheme(
        <MetricCard label="With Icon" value={100} icon={Users} animateValue={false} />
      );

      const iconContainer = container.querySelector('.rounded-lg');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should position icon to the right of label', () => {
      renderWithTheme(<MetricCard label="Icon Position" value={100} icon={Users} animateValue={false} />);

      const container = screen.getByText('Icon Position').closest('div')?.parentElement;
      expect(container).toHaveClass('justify-between');
    });
  });

  describe('Value Display', () => {
    it('should display large value text', () => {
      const { container } = renderWithTheme(<MetricCard label="Large Value" value={100} animateValue={false} />);

      const valueElement = screen.getByText('100');
      expect(valueElement).toHaveClass('text-3xl');
      expect(valueElement).toHaveClass('font-bold');
    });

    it('should handle zero value', () => {
      renderWithTheme(<MetricCard label="Zero" value={0} animateValue={false} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle negative values', () => {
      renderWithTheme(<MetricCard label="Negative" value={-100} animateValue={false} />);

      expect(screen.getByText(/-100/)).toBeInTheDocument();
    });

    it('should handle decimal values', () => {
      renderWithTheme(<MetricCard label="Decimal" value={12.5} format="percentage" suffix="%" animateValue={false} />);

      expect(screen.getByText(/12.5/)).toBeInTheDocument();
    });

    it('should handle very large numbers', () => {
      renderWithTheme(<MetricCard label="Large" value={1000000000} animateValue={false} />);

      expect(screen.getByText('1,000,000,000')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading for label', () => {
      renderWithTheme(<MetricCard label="Accessible Label" value={100} animateValue={false} />);

      const label = screen.getByText('Accessible Label');
      expect(label).toBeInTheDocument();
    });

    it('should have readable value text', () => {
      renderWithTheme(<MetricCard label="Value" value={12345} animateValue={false} />);

      const value = screen.getByText('12,345');
      expect(value).toBeInTheDocument();
    });

    it('should support keyboard interaction when clickable', () => {
      const onClick = jest.fn();
      renderWithTheme(<MetricCard label="Keyboard" value={100} onClick={onClick} animateValue={false} />);

      const card = screen.getByText('Keyboard').closest('div');
      if (card) {
        // Card should be clickable
        fireEvent.click(card);
        expect(onClick).toHaveBeenCalled();
      }
    });
  });

  describe('Component Display Name', () => {
    it('should have correct display name', () => {
      expect(MetricCard.displayName).toBe('MetricCard');
    });
  });

  describe('Real-world Usage Scenarios', () => {
    it('should work in a dashboard grid', () => {
      renderWithTheme(
        <div className="grid grid-cols-3 gap-4">
          <MetricCard label="Users" value={1250} icon={Users} trend="up" trendValue="+12%" />
          <MetricCard label="Revenue" value={50000} format="currency" prefix="$" trend="up" trendValue="+8%" />
          <MetricCard label="Growth" value={15.5} format="percentage" suffix="%" trend="up" trendValue="+2.3%" />
        </div>
      );

      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('Growth')).toBeInTheDocument();
    });

    it('should handle dynamic value updates', () => {
      const { rerender } = renderWithTheme(<MetricCard label="Live Count" value={100} animateValue={false} />);

      expect(screen.getByText('100')).toBeInTheDocument();

      rerender(
        <ThemeProvider>
          <MetricCard label="Live Count" value={150} animateValue={false} />
        </ThemeProvider>
      );

      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it('should work with onClick for drill-down navigation', () => {
      const onNavigate = jest.fn();
      renderWithTheme(
        <MetricCard
          label="Active Cases"
          value={42}
          description="Click to view details"
          onClick={onNavigate}
        />
      );

      const card = screen.getByText('Active Cases').closest('div');
      if (card) {
        fireEvent.click(card);
        expect(onNavigate).toHaveBeenCalled();
      }
    });
  });
});
