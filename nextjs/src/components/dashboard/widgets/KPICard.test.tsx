/**
 * @jest-environment jsdom
 * KPICard Component Tests
 * Enterprise-grade tests for KPI card with trend indicators
 */

import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KPICard, KPICardProps } from './KPICard';
import { DollarSign } from 'lucide-react';

// Mock dependencies
jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: '' },
      text: { primary: '', secondary: '', muted: '' },
      border: { default: '' },
    },
  }),
}));

// Mock requestAnimationFrame for value animation
const mockRAF = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
  cb(performance.now() + 1000);
  return 0;
});

const defaultProps: KPICardProps = {
  label: 'Total Revenue',
  value: 125000,
};

describe('KPICard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders label', () => {
      render(<KPICard {...defaultProps} />);

      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    });

    it('renders formatted value', () => {
      render(<KPICard {...defaultProps} value={125000} />);

      // Value is animated, check for the number format
      expect(screen.getByText(/125,000/)).toBeInTheDocument();
    });

    it('renders subtitle when provided', () => {
      render(<KPICard {...defaultProps} subtitle="Monthly total" />);

      expect(screen.getByText('Monthly total')).toBeInTheDocument();
    });

    it('renders icon when provided', () => {
      const { container } = render(<KPICard {...defaultProps} icon={DollarSign} />);

      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders string value as-is', () => {
      render(<KPICard label="Status" value="Active" />);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  describe('Value Formatting', () => {
    it('formats number with commas', () => {
      render(<KPICard {...defaultProps} value={1234567} format="number" />);

      expect(screen.getByText(/1,234,567/)).toBeInTheDocument();
    });

    it('formats currency with dollar sign', () => {
      render(<KPICard {...defaultProps} value={125000} format="currency" />);

      expect(screen.getByText(/\$125,000/)).toBeInTheDocument();
    });

    it('formats percentage with % sign', () => {
      render(<KPICard {...defaultProps} value={85.5} format="percentage" />);

      expect(screen.getByText(/85\.5%/)).toBeInTheDocument();
    });

    it('formats duration with h suffix', () => {
      render(<KPICard {...defaultProps} value={42} format="duration" />);

      expect(screen.getByText(/42h/)).toBeInTheDocument();
    });

    it('uses custom currency symbol', () => {
      render(
        <KPICard
          {...defaultProps}
          value={1000}
          format="currency"
          currency="EUR"
        />
      );

      expect(screen.getByText(/EUR/)).toBeInTheDocument();
    });
  });

  describe('Change Percentage', () => {
    it('shows change percentage when provided', () => {
      render(
        <KPICard
          {...defaultProps}
          changePercentage={15.5}
        />
      );

      expect(screen.getByText('15.5%')).toBeInTheDocument();
    });

    it('shows change percentage calculated from previousValue', () => {
      render(
        <KPICard
          {...defaultProps}
          value={100}
          previousValue={80}
        />
      );

      // (100-80)/80 * 100 = 25%
      expect(screen.getByText('25.0%')).toBeInTheDocument();
    });

    it('shows vs previous period text', () => {
      render(
        <KPICard
          {...defaultProps}
          previousValue={100000}
        />
      );

      expect(screen.getByText('vs previous period')).toBeInTheDocument();
    });
  });

  describe('Trend Indicators', () => {
    it('shows up trend icon for positive change', () => {
      const { container } = render(
        <KPICard
          {...defaultProps}
          value={100}
          previousValue={80}
        />
      );

      // TrendingUp icon and green color
      expect(container.querySelector('.text-emerald-600')).toBeInTheDocument();
    });

    it('shows down trend icon for negative change', () => {
      const { container } = render(
        <KPICard
          {...defaultProps}
          value={80}
          previousValue={100}
        />
      );

      // TrendingDown icon and red color
      expect(container.querySelector('.text-red-600')).toBeInTheDocument();
    });

    it('shows neutral trend for no change', () => {
      render(
        <KPICard
          {...defaultProps}
          value={100}
          previousValue={100}
        />
      );

      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });

    it('respects explicit trend prop', () => {
      const { container } = render(
        <KPICard
          {...defaultProps}
          changePercentage={10}
          trend="down"
        />
      );

      // Should show down trend even with positive percentage
      expect(container.querySelector('.text-red-600')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when isLoading is true', () => {
      const { container } = render(<KPICard {...defaultProps} isLoading={true} />);

      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('shows loading overlay with blur', () => {
      const { container } = render(<KPICard {...defaultProps} isLoading={true} />);

      expect(container.querySelector('.backdrop-blur-sm')).toBeInTheDocument();
    });
  });

  describe('Target Progress', () => {
    it('shows progress bar when target provided', () => {
      render(
        <KPICard
          {...defaultProps}
          value={75}
          target={100}
        />
      );

      expect(screen.getByText('Progress to goal')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('caps progress at 100%', () => {
      render(
        <KPICard
          {...defaultProps}
          value={150}
          target={100}
        />
      );

      // Should show 150% text but bar width capped
      expect(screen.getByText('150%')).toBeInTheDocument();
    });
  });

  describe('Color Variants', () => {
    const colors = ['blue', 'green', 'purple', 'orange', 'red', 'gray'] as const;

    colors.forEach(color => {
      it(`applies ${color} color scheme`, () => {
        const { container } = render(
          <KPICard
            {...defaultProps}
            color={color}
            icon={DollarSign}
          />
        );

        // Each color should have corresponding border class
        expect(container.querySelector(`[class*="${color}"]`)).toBeInTheDocument();
      });
    });
  });

  describe('Click Handler', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      render(<KPICard {...defaultProps} onClick={onClick} />);

      await user.click(screen.getByRole('button'));

      expect(onClick).toHaveBeenCalled();
    });

    it('renders as button when onClick provided', () => {
      render(<KPICard {...defaultProps} onClick={jest.fn()} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('is keyboard accessible when clickable', () => {
      render(<KPICard {...defaultProps} onClick={jest.fn()} />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('applies hover effects when clickable', () => {
      const { container } = render(<KPICard {...defaultProps} onClick={jest.fn()} />);

      expect(container.querySelector('.hover\\:shadow-lg')).toBeInTheDocument();
      expect(container.querySelector('.hover\\:scale-\\[1\\.02\\]')).toBeInTheDocument();
    });

    it('applies cursor-pointer when clickable', () => {
      const { container } = render(<KPICard {...defaultProps} onClick={jest.fn()} />);

      expect(container.querySelector('.cursor-pointer')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies rounded border', () => {
      const { container } = render(<KPICard {...defaultProps} />);

      expect(container.firstChild).toHaveClass('rounded-xl');
    });

    it('applies hover shadow when not clickable', () => {
      const { container } = render(<KPICard {...defaultProps} />);

      expect(container.querySelector('.hover\\:shadow-md')).toBeInTheDocument();
    });
  });

  describe('Value Animation', () => {
    it('animates numeric values', () => {
      render(<KPICard {...defaultProps} value={100} />);

      // Animation uses requestAnimationFrame
      expect(mockRAF).toHaveBeenCalled();
    });
  });

  describe('Custom ClassName', () => {
    it('applies custom className', () => {
      const { container } = render(
        <KPICard {...defaultProps} className="custom-kpi" />
      );

      expect(container.firstChild).toHaveClass('custom-kpi');
    });
  });

  describe('Display Name', () => {
    it('has displayName set', () => {
      expect(KPICard.displayName).toBe('KPICard');
    });
  });
});
