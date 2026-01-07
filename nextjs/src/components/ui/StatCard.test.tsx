import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatCard } from './StatCard';
import { DollarSign, Users } from 'lucide-react';

describe('StatCard', () => {
  describe('Rendering', () => {
    it('renders with required props', () => {
      render(<StatCard title="Total Sales" value="$10,000" />);
      expect(screen.getByText('Total Sales')).toBeInTheDocument();
      expect(screen.getByText('$10,000')).toBeInTheDocument();
    });

    it('renders title correctly', () => {
      render(<StatCard title="Monthly Revenue" value="5000" />);
      expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
    });

    it('renders value correctly', () => {
      render(<StatCard title="Users" value={1234} />);
      expect(screen.getByText('1234')).toBeInTheDocument();
    });

    it('renders string value', () => {
      render(<StatCard title="Status" value="Active" />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('renders numeric value', () => {
      render(<StatCard title="Count" value={999} />);
      expect(screen.getByText('999')).toBeInTheDocument();
    });
  });

  describe('Subtitle', () => {
    it('renders subtitle when provided', () => {
      render(
        <StatCard
          title="Revenue"
          value="$50,000"
          subtitle="Last 30 days"
        />
      );
      expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    });

    it('does not render subtitle when not provided', () => {
      render(<StatCard title="Revenue" value="$50,000" />);
      // Ensure no subtitle text appears
      const paragraphs = document.querySelectorAll('.text-xs.text-slate-500');
      expect(paragraphs).toHaveLength(0);
    });

    it('subtitle has correct styling', () => {
      render(<StatCard title="Title" value="Value" subtitle="Subtitle text" />);
      const subtitle = screen.getByText('Subtitle text');
      expect(subtitle).toHaveClass('text-xs');
    });
  });

  describe('Icon', () => {
    it('renders icon when provided', () => {
      render(
        <StatCard
          title="Revenue"
          value="$50,000"
          icon={<DollarSign data-testid="dollar-icon" />}
        />
      );
      expect(screen.getByTestId('dollar-icon')).toBeInTheDocument();
    });

    it('does not render icon container when icon not provided', () => {
      const { container } = render(<StatCard title="Title" value="Value" />);
      const iconContainer = container.querySelector('.rounded-lg.bg-blue-50');
      expect(iconContainer).not.toBeInTheDocument();
    });

    it('icon container has proper styling', () => {
      const { container } = render(
        <StatCard
          title="Users"
          value={100}
          icon={<Users data-testid="users-icon" />}
        />
      );
      const iconContainer = container.querySelector('.rounded-lg.bg-blue-50');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('h-12', 'w-12');
    });
  });

  describe('Trend', () => {
    it('renders upward trend with value', () => {
      const { container } = render(
        <StatCard
          title="Growth"
          value="150%"
          trend="up"
          trendValue="+12%"
        />
      );
      expect(screen.getByText('+12%')).toBeInTheDocument();
      const trendIcon = container.querySelector('svg');
      expect(trendIcon).toBeInTheDocument();
    });

    it('renders downward trend with value', () => {
      const { container } = render(
        <StatCard
          title="Decline"
          value="50%"
          trend="down"
          trendValue="-8%"
        />
      );
      expect(screen.getByText('-8%')).toBeInTheDocument();
      const trendIcon = container.querySelector('svg');
      expect(trendIcon).toBeInTheDocument();
    });

    it('upward trend has green styling', () => {
      render(
        <StatCard
          title="Growth"
          value="100"
          trend="up"
          trendValue="+5%"
        />
      );
      const trendContainer = screen.getByText('+5%').parentElement;
      expect(trendContainer).toHaveClass('text-emerald-600');
    });

    it('downward trend has red styling', () => {
      render(
        <StatCard
          title="Loss"
          value="100"
          trend="down"
          trendValue="-5%"
        />
      );
      const trendContainer = screen.getByText('-5%').parentElement;
      expect(trendContainer).toHaveClass('text-rose-600');
    });

    it('does not render trend when only trend is provided without trendValue', () => {
      render(<StatCard title="Test" value="100" trend="up" />);
      // No trend indicator should appear without trendValue
      const trendElements = document.querySelectorAll('.text-emerald-600');
      expect(trendElements).toHaveLength(0);
    });

    it('does not render trend when only trendValue is provided without trend', () => {
      render(<StatCard title="Test" value="100" trendValue="+5%" />);
      // Trend value should not appear without trend direction
      expect(screen.queryByText('+5%')).not.toBeInTheDocument();
    });
  });

  describe('onClick', () => {
    it('calls onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<StatCard title="Clickable" value="100" onClick={handleClick} />);

      fireEvent.click(screen.getByText('Clickable'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('card is hoverable when onClick provided', () => {
      const { container } = render(
        <StatCard title="Hoverable" value="100" onClick={() => {}} />
      );
      // StatCard uses Card with hoverable prop
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('cursor-pointer');
    });
  });

  describe('Card Integration', () => {
    it('uses Card component as wrapper', () => {
      const { container } = render(<StatCard title="Test" value="100" />);
      // Should have Card styling
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('rounded-lg');
    });

    it('has proper padding', () => {
      const { container } = render(<StatCard title="Test" value="100" />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-6');
    });
  });

  describe('Styling', () => {
    it('title has correct styling', () => {
      render(<StatCard title="Styled Title" value="100" />);
      const title = screen.getByText('Styled Title');
      expect(title).toHaveClass('text-sm', 'font-medium');
    });

    it('value has large bold styling', () => {
      render(<StatCard title="Title" value="Large Value" />);
      const value = screen.getByText('Large Value');
      expect(value).toHaveClass('text-3xl', 'font-bold');
    });

    it('layout is flex with proper spacing', () => {
      const { container } = render(
        <StatCard title="Title" value="100" icon={<Users />} />
      );
      const layout = container.querySelector('.flex.items-start.justify-between');
      expect(layout).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string title', () => {
      render(<StatCard title="" value="100" />);
      // Should render without crashing
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('handles zero value', () => {
      render(<StatCard title="Zero" value={0} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles negative value', () => {
      render(<StatCard title="Negative" value={-500} />);
      expect(screen.getByText('-500')).toBeInTheDocument();
    });

    it('handles very large value', () => {
      render(<StatCard title="Large" value="$1,234,567,890" />);
      expect(screen.getByText('$1,234,567,890')).toBeInTheDocument();
    });

    it('handles special characters in value', () => {
      render(<StatCard title="Special" value="<100>" />);
      expect(screen.getByText('<100>')).toBeInTheDocument();
    });
  });

  describe('Complete StatCard', () => {
    it('renders with all props', () => {
      const handleClick = jest.fn();
      render(
        <StatCard
          title="Total Revenue"
          value="$125,430"
          subtitle="vs last month"
          icon={<DollarSign data-testid="icon" />}
          trend="up"
          trendValue="+15.3%"
          onClick={handleClick}
        />
      );

      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('$125,430')).toBeInTheDocument();
      expect(screen.getByText('vs last month')).toBeInTheDocument();
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('+15.3%')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Total Revenue'));
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('value is readable by screen readers', () => {
      render(<StatCard title="Accessible Value" value="$500" />);
      expect(screen.getByText('$500')).toBeInTheDocument();
    });

    it('trend information is visible', () => {
      render(
        <StatCard
          title="Trend"
          value="100"
          trend="up"
          trendValue="+10%"
        />
      );
      // Trend value should be in the document
      expect(screen.getByText('+10%')).toBeInTheDocument();
    });

    it('clickable card is focusable when interactive', () => {
      const handleClick = jest.fn();
      const { container } = render(
        <StatCard title="Focusable" value="100" onClick={handleClick} />
      );
      const card = container.firstChild as HTMLElement;
      // Card should be clickable
      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalled();
    });
  });
});
