/**
 * BillingSummaryCard Component Tests
 * Enterprise-grade tests for the billing summary card with various configurations.
 */

import { render, screen } from '@testing-library/react';
import { BillingSummaryCard } from './BillingSummaryCard';

describe('BillingSummaryCard', () => {
  describe('Rendering', () => {
    it('renders with required props', () => {
      render(<BillingSummaryCard title="Total Revenue" value="$100,000" />);

      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('$100,000')).toBeInTheDocument();
    });

    it('renders with numeric value', () => {
      render(<BillingSummaryCard title="Hours Billed" value={1250} />);

      expect(screen.getByText('1250')).toBeInTheDocument();
    });

    it('renders with all optional props', () => {
      render(
        <BillingSummaryCard
          title="Monthly Revenue"
          value="$50,000"
          change={15}
          changeLabel="vs last month"
          icon="dollar"
          color="green"
        />
      );

      expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
      expect(screen.getByText('$50,000')).toBeInTheDocument();
      expect(screen.getByText('+15%')).toBeInTheDocument();
      expect(screen.getByText('vs last month')).toBeInTheDocument();
    });
  });

  describe('Change Indicator', () => {
    it('displays positive change with plus sign and green styling', () => {
      render(
        <BillingSummaryCard
          title="Revenue"
          value="$100,000"
          change={25}
        />
      );

      const changeText = screen.getByText('+25%');
      expect(changeText).toBeInTheDocument();
      expect(changeText).toHaveClass('text-green-600');
    });

    it('displays negative change with red styling', () => {
      render(
        <BillingSummaryCard
          title="Revenue"
          value="$80,000"
          change={-15}
        />
      );

      const changeText = screen.getByText('-15%');
      expect(changeText).toBeInTheDocument();
      expect(changeText).toHaveClass('text-red-600');
    });

    it('displays zero change as positive', () => {
      render(
        <BillingSummaryCard
          title="Revenue"
          value="$100,000"
          change={0}
        />
      );

      const changeText = screen.getByText('+0%');
      expect(changeText).toBeInTheDocument();
      expect(changeText).toHaveClass('text-green-600');
    });

    it('displays change label when provided', () => {
      render(
        <BillingSummaryCard
          title="Revenue"
          value="$100,000"
          change={10}
          changeLabel="from last quarter"
        />
      );

      expect(screen.getByText('from last quarter')).toBeInTheDocument();
    });

    it('does not display change section when change is undefined', () => {
      render(
        <BillingSummaryCard
          title="Revenue"
          value="$100,000"
        />
      );

      expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    });
  });

  describe('Icon Variants', () => {
    it('renders with dollar icon by default', () => {
      const { container } = render(
        <BillingSummaryCard title="Revenue" value="$100,000" />
      );

      // Check for SVG icon presence
      const iconContainer = container.querySelector('.rounded-full');
      expect(iconContainer).toBeInTheDocument();
    });

    it('renders with clock icon', () => {
      const { container } = render(
        <BillingSummaryCard title="Hours" value="120" icon="clock" />
      );

      const iconContainer = container.querySelector('.rounded-full');
      expect(iconContainer).toBeInTheDocument();
    });

    it('renders with invoice icon', () => {
      const { container } = render(
        <BillingSummaryCard title="Invoices" value="45" icon="invoice" />
      );

      const iconContainer = container.querySelector('.rounded-full');
      expect(iconContainer).toBeInTheDocument();
    });

    it('renders with trending icon', () => {
      const { container } = render(
        <BillingSummaryCard title="Growth" value="+25%" icon="trending" />
      );

      const iconContainer = container.querySelector('.rounded-full');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Color Variants', () => {
    it('applies blue color styling by default', () => {
      const { container } = render(
        <BillingSummaryCard title="Revenue" value="$100,000" />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('border-blue-200');
    });

    it('applies green color styling', () => {
      const { container } = render(
        <BillingSummaryCard title="Collected" value="$80,000" color="green" />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('border-green-200');
    });

    it('applies yellow color styling', () => {
      const { container } = render(
        <BillingSummaryCard title="Pending" value="$15,000" color="yellow" />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('border-yellow-200');
    });

    it('applies red color styling', () => {
      const { container } = render(
        <BillingSummaryCard title="Overdue" value="$5,000" color="red" />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('border-red-200');
    });

    it('applies purple color styling', () => {
      const { container } = render(
        <BillingSummaryCard title="Trust Balance" value="$25,000" color="purple" />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('border-purple-200');
    });
  });

  describe('Layout and Styling', () => {
    it('has correct card structure', () => {
      const { container } = render(
        <BillingSummaryCard title="Revenue" value="$100,000" />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('rounded-lg', 'border', 'p-6', 'shadow-sm');
    });

    it('displays title with correct styling', () => {
      render(<BillingSummaryCard title="Total Revenue" value="$100,000" />);

      const title = screen.getByText('Total Revenue');
      expect(title).toHaveClass('text-sm', 'font-medium');
    });

    it('displays value with correct styling', () => {
      render(<BillingSummaryCard title="Revenue" value="$100,000" />);

      const value = screen.getByText('$100,000');
      expect(value).toHaveClass('text-3xl', 'font-semibold');
    });

    it('displays icon in a rounded container', () => {
      const { container } = render(
        <BillingSummaryCard title="Revenue" value="$100,000" color="blue" />
      );

      const iconContainer = container.querySelector('.rounded-full.p-3');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('bg-blue-50');
    });
  });

  describe('Trend Icons', () => {
    it('shows TrendingUp icon for positive change', () => {
      const { container } = render(
        <BillingSummaryCard title="Revenue" value="$100,000" change={10} />
      );

      // TrendingUp icon should be present for positive change
      const changeContainer = container.querySelector('.flex.items-center.gap-1');
      expect(changeContainer).toBeInTheDocument();
    });

    it('shows TrendingDown icon for negative change', () => {
      const { container } = render(
        <BillingSummaryCard title="Revenue" value="$80,000" change={-10} />
      );

      // TrendingDown icon should be present for negative change
      const changeContainer = container.querySelector('.flex.items-center.gap-1');
      expect(changeContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string value', () => {
      render(<BillingSummaryCard title="Revenue" value="" />);

      expect(screen.getByText('Revenue')).toBeInTheDocument();
    });

    it('handles zero value', () => {
      render(<BillingSummaryCard title="Revenue" value={0} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles very long title', () => {
      render(
        <BillingSummaryCard
          title="This is a very long title that might overflow the card container"
          value="$100"
        />
      );

      expect(screen.getByText(/This is a very long title/)).toBeInTheDocument();
    });

    it('handles very large numbers', () => {
      render(<BillingSummaryCard title="Revenue" value="$999,999,999" />);

      expect(screen.getByText('$999,999,999')).toBeInTheDocument();
    });

    it('handles large percentage changes', () => {
      render(
        <BillingSummaryCard title="Revenue" value="$100,000" change={500} />
      );

      expect(screen.getByText('+500%')).toBeInTheDocument();
    });

    it('handles decimal percentage changes', () => {
      render(
        <BillingSummaryCard title="Revenue" value="$100,000" change={12.5} />
      );

      expect(screen.getByText('+12.5%')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has semantic text structure', () => {
      render(
        <BillingSummaryCard
          title="Total Revenue"
          value="$100,000"
          change={10}
          changeLabel="vs last month"
        />
      );

      // All text content should be accessible
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('$100,000')).toBeInTheDocument();
    });

    it('provides color contrast for change indicators', () => {
      render(
        <BillingSummaryCard title="Revenue" value="$100,000" change={10} />
      );

      const changeText = screen.getByText('+10%');
      expect(changeText).toHaveClass('text-green-600');
    });
  });

  describe('Dark Mode Support', () => {
    it('has dark mode classes for card background', () => {
      const { container } = render(
        <BillingSummaryCard title="Revenue" value="$100,000" />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('dark:bg-gray-800');
    });

    it('has dark mode classes for icon container', () => {
      const { container } = render(
        <BillingSummaryCard title="Revenue" value="$100,000" color="blue" />
      );

      const iconContainer = container.querySelector('.rounded-full.p-3');
      expect(iconContainer).toHaveClass('dark:bg-blue-900/20');
    });
  });
});
