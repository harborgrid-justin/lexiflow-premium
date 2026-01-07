/**
 * @jest-environment jsdom
 * ChartCard Component Tests
 * Enterprise-grade tests for chart wrapper with actions
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChartCard, ChartCardProps } from './ChartCard';
import { BarChart2 } from 'lucide-react';

// Mock dependencies
jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: '', highlight: '' },
      text: { primary: '', secondary: '', muted: '' },
      border: { default: '' },
    },
  }),
}));

const defaultProps: ChartCardProps = {
  title: 'Test Chart',
  children: <div data-testid="chart-content">Chart Content</div>,
};

describe('ChartCard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders title', () => {
      render(<ChartCard {...defaultProps} />);

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Chart');
    });

    it('renders subtitle when provided', () => {
      render(<ChartCard {...defaultProps} subtitle="Last 30 days" />);

      expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    });

    it('renders children (chart content)', () => {
      render(<ChartCard {...defaultProps} />);

      expect(screen.getByTestId('chart-content')).toBeInTheDocument();
    });

    it('renders icon when provided', () => {
      const { container } = render(<ChartCard {...defaultProps} icon={BarChart2} />);

      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when isLoading is true', () => {
      const { container } = render(<ChartCard {...defaultProps} isLoading={true} />);

      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('shows loading message', () => {
      render(<ChartCard {...defaultProps} isLoading={true} />);

      expect(screen.getByText('Loading chart data...')).toBeInTheDocument();
    });

    it('hides children when loading', () => {
      render(<ChartCard {...defaultProps} isLoading={true} />);

      expect(screen.queryByTestId('chart-content')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when error is provided', () => {
      render(<ChartCard {...defaultProps} error="Failed to load data" />);

      expect(screen.getByText('Failed to load chart')).toBeInTheDocument();
      expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    });

    it('hides children when error', () => {
      render(<ChartCard {...defaultProps} error="Error" />);

      expect(screen.queryByTestId('chart-content')).not.toBeInTheDocument();
    });

    it('shows Try Again button when error and onRefresh provided', () => {
      render(
        <ChartCard
          {...defaultProps}
          error="Error"
          onRefresh={jest.fn()}
        />
      );

      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('shows refresh button when onRefresh provided', () => {
      render(<ChartCard {...defaultProps} onRefresh={jest.fn()} />);

      expect(screen.getByTitle('Refresh data')).toBeInTheDocument();
    });

    it('shows expand button when onExpand provided', () => {
      render(<ChartCard {...defaultProps} onExpand={jest.fn()} />);

      expect(screen.getByTitle('Expand chart')).toBeInTheDocument();
    });

    it('shows export button when onExport provided', () => {
      render(<ChartCard {...defaultProps} onExport={jest.fn()} />);

      expect(screen.getByTitle('Export data')).toBeInTheDocument();
    });

    it('hides action buttons when showActions is false', () => {
      render(
        <ChartCard
          {...defaultProps}
          onRefresh={jest.fn()}
          onExpand={jest.fn()}
          onExport={jest.fn()}
          showActions={false}
        />
      );

      expect(screen.queryByTitle('Refresh data')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Expand chart')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Export data')).not.toBeInTheDocument();
    });

    it('renders custom actions', () => {
      render(
        <ChartCard
          {...defaultProps}
          actions={<button data-testid="custom-action">Custom</button>}
        />
      );

      expect(screen.getByTestId('custom-action')).toBeInTheDocument();
    });
  });

  describe('Refresh Functionality', () => {
    it('calls onRefresh when refresh button clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onRefresh = jest.fn();

      render(<ChartCard {...defaultProps} onRefresh={onRefresh} />);

      await user.click(screen.getByTitle('Refresh data'));

      expect(onRefresh).toHaveBeenCalled();
    });

    it('shows spinning animation during refresh', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onRefresh = jest.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));

      const { container } = render(<ChartCard {...defaultProps} onRefresh={onRefresh} />);

      await user.click(screen.getByTitle('Refresh data'));

      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('disables refresh button during refresh', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onRefresh = jest.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));

      render(<ChartCard {...defaultProps} onRefresh={onRefresh} />);

      await user.click(screen.getByTitle('Refresh data'));

      expect(screen.getByTitle('Refresh data')).toBeDisabled();
    });

    it('disables refresh button when loading', () => {
      render(<ChartCard {...defaultProps} onRefresh={jest.fn()} isLoading={true} />);

      expect(screen.getByTitle('Refresh data')).toBeDisabled();
    });

    it('handles Try Again click in error state', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onRefresh = jest.fn();

      render(
        <ChartCard
          {...defaultProps}
          error="Error"
          onRefresh={onRefresh}
        />
      );

      await user.click(screen.getByText('Try Again'));

      expect(onRefresh).toHaveBeenCalled();
    });
  });

  describe('Expand Functionality', () => {
    it('calls onExpand when expand button clicked', async () => {
      const user = userEvent.setup();
      const onExpand = jest.fn();

      render(<ChartCard {...defaultProps} onExpand={onExpand} />);

      await user.click(screen.getByTitle('Expand chart'));

      expect(onExpand).toHaveBeenCalled();
    });
  });

  describe('Export Functionality', () => {
    it('calls onExport when export button clicked', async () => {
      const user = userEvent.setup();
      const onExport = jest.fn();

      render(<ChartCard {...defaultProps} onExport={onExport} />);

      await user.click(screen.getByTitle('Export data'));

      expect(onExport).toHaveBeenCalled();
    });
  });

  describe('Height', () => {
    it('applies default height', () => {
      render(<ChartCard {...defaultProps} />);

      const contentDiv = screen.getByTestId('chart-content').parentElement;
      expect(contentDiv).toHaveStyle({ height: '300px' });
    });

    it('applies custom numeric height', () => {
      render(<ChartCard {...defaultProps} height={400} />);

      const contentDiv = screen.getByTestId('chart-content').parentElement;
      expect(contentDiv).toHaveStyle({ height: '400px' });
    });

    it('applies custom string height', () => {
      render(<ChartCard {...defaultProps} height="50vh" />);

      const contentDiv = screen.getByTestId('chart-content').parentElement;
      expect(contentDiv).toHaveStyle({ height: '50vh' });
    });
  });

  describe('Styling', () => {
    it('applies rounded border', () => {
      const { container } = render(<ChartCard {...defaultProps} />);

      expect(container.firstChild).toHaveClass('rounded-xl');
    });

    it('applies hover shadow', () => {
      const { container } = render(<ChartCard {...defaultProps} />);

      expect(container.firstChild).toHaveClass('hover:shadow-md');
    });
  });

  describe('Custom ClassName', () => {
    it('applies custom className', () => {
      const { container } = render(
        <ChartCard {...defaultProps} className="custom-chart" />
      );

      expect(container.firstChild).toHaveClass('custom-chart');
    });
  });

  describe('Display Name', () => {
    it('has displayName set', () => {
      expect(ChartCard.displayName).toBe('ChartCard');
    });
  });
});
