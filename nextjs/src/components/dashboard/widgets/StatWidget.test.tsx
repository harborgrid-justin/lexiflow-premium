/**
 * @jest-environment jsdom
 * StatWidget Component Tests
 * Enterprise-grade tests for compact statistics widget
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatWidget, StatWidgetProps } from './StatWidget';
import { Activity } from 'lucide-react';

// Mock dependencies
jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: '' },
      text: { primary: '', secondary: '' },
      border: { default: '' },
    },
  }),
}));

const defaultProps: StatWidgetProps = {
  label: 'Active Cases',
  value: 42,
};

describe('StatWidget', () => {
  describe('Rendering', () => {
    it('renders label', () => {
      render(<StatWidget {...defaultProps} />);

      expect(screen.getByText('Active Cases')).toBeInTheDocument();
    });

    it('renders numeric value with formatting', () => {
      render(<StatWidget {...defaultProps} value={1234} />);

      expect(screen.getByText('1,234')).toBeInTheDocument();
    });

    it('renders string value as-is', () => {
      render(<StatWidget label="Status" value="Healthy" />);

      expect(screen.getByText('Healthy')).toBeInTheDocument();
    });

    it('renders icon when provided', () => {
      const { container } = render(<StatWidget {...defaultProps} icon={Activity} />);

      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders change text when provided', () => {
      render(<StatWidget {...defaultProps} change="+12% from last month" />);

      expect(screen.getByText('+12% from last month')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('applies default variant styling', () => {
      const { container } = render(<StatWidget {...defaultProps} variant="default" />);

      expect(container.querySelector('.border-gray-200')).toBeInTheDocument();
    });

    it('applies success variant styling', () => {
      const { container } = render(<StatWidget {...defaultProps} variant="success" />);

      expect(container.querySelector('.border-emerald-200')).toBeInTheDocument();
      expect(container.querySelector('.bg-emerald-50\\/50')).toBeInTheDocument();
    });

    it('applies warning variant styling', () => {
      const { container } = render(<StatWidget {...defaultProps} variant="warning" />);

      expect(container.querySelector('.border-orange-200')).toBeInTheDocument();
      expect(container.querySelector('.bg-orange-50\\/50')).toBeInTheDocument();
    });

    it('applies danger variant styling', () => {
      const { container } = render(<StatWidget {...defaultProps} variant="danger" />);

      expect(container.querySelector('.border-red-200')).toBeInTheDocument();
      expect(container.querySelector('.bg-red-50\\/50')).toBeInTheDocument();
    });

    it('applies info variant styling', () => {
      const { container } = render(<StatWidget {...defaultProps} variant="info" />);

      expect(container.querySelector('.border-blue-200')).toBeInTheDocument();
      expect(container.querySelector('.bg-blue-50\\/50')).toBeInTheDocument();
    });
  });

  describe('Icon Colors', () => {
    it('applies default icon color', () => {
      const { container } = render(
        <StatWidget {...defaultProps} icon={Activity} variant="default" />
      );

      expect(container.querySelector('.text-gray-600')).toBeInTheDocument();
    });

    it('applies success icon color', () => {
      const { container } = render(
        <StatWidget {...defaultProps} icon={Activity} variant="success" />
      );

      expect(container.querySelector('.text-emerald-600')).toBeInTheDocument();
    });

    it('applies warning icon color', () => {
      const { container } = render(
        <StatWidget {...defaultProps} icon={Activity} variant="warning" />
      );

      expect(container.querySelector('.text-orange-600')).toBeInTheDocument();
    });

    it('applies danger icon color', () => {
      const { container } = render(
        <StatWidget {...defaultProps} icon={Activity} variant="danger" />
      );

      expect(container.querySelector('.text-red-600')).toBeInTheDocument();
    });

    it('applies info icon color', () => {
      const { container } = render(
        <StatWidget {...defaultProps} icon={Activity} variant="info" />
      );

      expect(container.querySelector('.text-blue-600')).toBeInTheDocument();
    });
  });

  describe('Change Indicator', () => {
    it('shows positive change in green', () => {
      const { container } = render(
        <StatWidget
          {...defaultProps}
          change="+10%"
          changePositive={true}
        />
      );

      expect(container.querySelector('.text-emerald-600')).toBeInTheDocument();
    });

    it('shows negative change in red', () => {
      const { container } = render(
        <StatWidget
          {...defaultProps}
          change="-10%"
          changePositive={false}
        />
      );

      expect(container.querySelector('.text-red-600')).toBeInTheDocument();
    });

    it('defaults to positive styling', () => {
      const { container } = render(
        <StatWidget {...defaultProps} change="+5%" />
      );

      expect(container.querySelector('.text-emerald-600')).toBeInTheDocument();
    });
  });

  describe('Click Handler', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      render(<StatWidget {...defaultProps} onClick={onClick} />);

      await user.click(screen.getByRole('button'));

      expect(onClick).toHaveBeenCalled();
    });

    it('renders as button when onClick provided', () => {
      render(<StatWidget {...defaultProps} onClick={jest.fn()} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('is keyboard accessible when clickable', () => {
      render(<StatWidget {...defaultProps} onClick={jest.fn()} />);

      const widget = screen.getByRole('button');
      expect(widget).toHaveAttribute('tabIndex', '0');
    });

    it('applies cursor-pointer when clickable', () => {
      const { container } = render(<StatWidget {...defaultProps} onClick={jest.fn()} />);

      expect(container.querySelector('.cursor-pointer')).toBeInTheDocument();
    });

    it('applies hover effects when clickable', () => {
      const { container } = render(<StatWidget {...defaultProps} onClick={jest.fn()} />);

      expect(container.querySelector('.hover\\:shadow-md')).toBeInTheDocument();
      expect(container.querySelector('.hover\\:scale-\\[1\\.02\\]')).toBeInTheDocument();
    });

    it('does not render as button without onClick', () => {
      render(<StatWidget {...defaultProps} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Value Display', () => {
    it('formats large numbers with locale', () => {
      render(<StatWidget {...defaultProps} value={1000000} />);

      expect(screen.getByText('1,000,000')).toBeInTheDocument();
    });

    it('handles zero value', () => {
      render(<StatWidget {...defaultProps} value={0} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles decimal values', () => {
      render(<StatWidget {...defaultProps} value={42.5} />);

      expect(screen.getByText('42.5')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies rounded border', () => {
      const { container } = render(<StatWidget {...defaultProps} />);

      expect(container.firstChild).toHaveClass('rounded-lg');
    });

    it('applies padding', () => {
      const { container } = render(<StatWidget {...defaultProps} />);

      expect(container.firstChild).toHaveClass('p-4');
    });

    it('applies transition animation', () => {
      const { container } = render(<StatWidget {...defaultProps} />);

      expect(container.firstChild).toHaveClass('transition-all');
    });
  });

  describe('Custom ClassName', () => {
    it('applies custom className', () => {
      const { container } = render(
        <StatWidget {...defaultProps} className="custom-stat" />
      );

      expect(container.firstChild).toHaveClass('custom-stat');
    });
  });

  describe('Layout', () => {
    it('positions icon on the right', () => {
      const { container } = render(<StatWidget {...defaultProps} icon={Activity} />);

      // Icon should be in ml-3 (margin left)
      const iconContainer = container.querySelector('.ml-3');
      expect(iconContainer?.querySelector('svg')).toBeInTheDocument();
    });

    it('uses flex layout', () => {
      const { container } = render(<StatWidget {...defaultProps} />);

      expect(container.querySelector('.flex')).toBeInTheDocument();
    });
  });

  describe('Display Name', () => {
    it('has displayName set', () => {
      expect(StatWidget.displayName).toBe('StatWidget');
    });
  });
});
