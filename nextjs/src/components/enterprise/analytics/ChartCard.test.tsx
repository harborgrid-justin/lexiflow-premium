/**
 * @fileoverview Enterprise-grade tests for ChartCard component
 * Tests wrapper functionality, actions, loading state, and accessibility
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ChartCard } from './ChartCard';

expect.extend(toHaveNoViolations);

describe('ChartCard', () => {
  const defaultProps = {
    title: 'Test Chart',
    children: <div data-testid="chart-content">Chart Content</div>
  };

  const mockOnRefresh = jest.fn();
  const mockOnExport = jest.fn();
  const mockOnExpand = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with required props', () => {
      render(<ChartCard {...defaultProps} />);

      expect(screen.getByText('Test Chart')).toBeInTheDocument();
      expect(screen.getByTestId('chart-content')).toBeInTheDocument();
    });

    it('renders title correctly', () => {
      render(<ChartCard {...defaultProps} title="Revenue Analysis" />);

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Revenue Analysis');
    });

    it('renders subtitle when provided', () => {
      render(<ChartCard {...defaultProps} subtitle="Last 30 days" />);

      expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    });

    it('does not render subtitle when not provided', () => {
      render(<ChartCard {...defaultProps} />);

      expect(screen.queryByText('Last 30 days')).not.toBeInTheDocument();
    });

    it('renders children content', () => {
      render(
        <ChartCard {...defaultProps}>
          <div data-testid="custom-chart">Custom Chart</div>
        </ChartCard>
      );

      expect(screen.getByTestId('custom-chart')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <ChartCard {...defaultProps} className="custom-card-class" />
      );

      expect(container.firstChild).toHaveClass('custom-card-class');
    });

    it('applies dark mode styles', () => {
      const { container } = render(<ChartCard {...defaultProps} />);

      expect(container.firstChild).toHaveClass('dark:border-gray-700');
      expect(container.firstChild).toHaveClass('dark:bg-gray-800');
    });
  });

  describe('Loading State', () => {
    it('displays loading spinner when loading is true', () => {
      render(<ChartCard {...defaultProps} loading={true} />);

      // Look for the spinner element with animate-spin class
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('hides children when loading', () => {
      render(<ChartCard {...defaultProps} loading={true} />);

      expect(screen.queryByTestId('chart-content')).not.toBeInTheDocument();
    });

    it('shows children when not loading', () => {
      render(<ChartCard {...defaultProps} loading={false} />);

      expect(screen.getByTestId('chart-content')).toBeInTheDocument();
    });

    it('maintains title visibility during loading', () => {
      render(<ChartCard {...defaultProps} loading={true} />);

      expect(screen.getByText('Test Chart')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders refresh button when onRefresh is provided', () => {
      render(<ChartCard {...defaultProps} onRefresh={mockOnRefresh} />);

      expect(screen.getByTitle('Refresh data')).toBeInTheDocument();
    });

    it('calls onRefresh when refresh button is clicked', async () => {
      const user = userEvent.setup();
      render(<ChartCard {...defaultProps} onRefresh={mockOnRefresh} />);

      await user.click(screen.getByTitle('Refresh data'));

      expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    });

    it('renders export button when onExport is provided', () => {
      render(<ChartCard {...defaultProps} onExport={mockOnExport} />);

      expect(screen.getByTitle('Export data')).toBeInTheDocument();
    });

    it('calls onExport when export button is clicked', async () => {
      const user = userEvent.setup();
      render(<ChartCard {...defaultProps} onExport={mockOnExport} />);

      await user.click(screen.getByTitle('Export data'));

      expect(mockOnExport).toHaveBeenCalledTimes(1);
    });

    it('renders expand button when onExpand is provided', () => {
      render(<ChartCard {...defaultProps} onExpand={mockOnExpand} />);

      expect(screen.getByTitle('Expand view')).toBeInTheDocument();
    });

    it('calls onExpand when expand button is clicked', async () => {
      const user = userEvent.setup();
      render(<ChartCard {...defaultProps} onExpand={mockOnExpand} />);

      await user.click(screen.getByTitle('Expand view'));

      expect(mockOnExpand).toHaveBeenCalledTimes(1);
    });

    it('does not render action buttons when handlers are not provided', () => {
      render(<ChartCard {...defaultProps} />);

      expect(screen.queryByTitle('Refresh data')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Export data')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Expand view')).not.toBeInTheDocument();
    });

    it('renders all action buttons when all handlers provided', () => {
      render(
        <ChartCard
          {...defaultProps}
          onRefresh={mockOnRefresh}
          onExport={mockOnExport}
          onExpand={mockOnExpand}
        />
      );

      expect(screen.getByTitle('Refresh data')).toBeInTheDocument();
      expect(screen.getByTitle('Export data')).toBeInTheDocument();
      expect(screen.getByTitle('Expand view')).toBeInTheDocument();
    });
  });

  describe('Custom Actions', () => {
    it('renders custom actions when provided', () => {
      const customActions = <button data-testid="custom-action">Custom</button>;

      render(<ChartCard {...defaultProps} actions={customActions} />);

      expect(screen.getByTestId('custom-action')).toBeInTheDocument();
    });

    it('renders custom actions alongside default actions', () => {
      const customActions = <button data-testid="custom-action">Custom</button>;

      render(
        <ChartCard
          {...defaultProps}
          actions={customActions}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByTestId('custom-action')).toBeInTheDocument();
      expect(screen.getByTitle('Refresh data')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('has rounded corners', () => {
      const { container } = render(<ChartCard {...defaultProps} />);

      expect(container.firstChild).toHaveClass('rounded-lg');
    });

    it('has border styling', () => {
      const { container } = render(<ChartCard {...defaultProps} />);

      expect(container.firstChild).toHaveClass('border');
      expect(container.firstChild).toHaveClass('border-gray-200');
    });

    it('has proper padding', () => {
      const { container } = render(<ChartCard {...defaultProps} />);

      expect(container.firstChild).toHaveClass('p-6');
    });

    it('has white background', () => {
      const { container } = render(<ChartCard {...defaultProps} />);

      expect(container.firstChild).toHaveClass('bg-white');
    });

    it('applies hover styles to action buttons', async () => {
      render(<ChartCard {...defaultProps} onRefresh={mockOnRefresh} />);

      const button = screen.getByTitle('Refresh data');
      expect(button).toHaveClass('hover:bg-gray-100');
    });
  });

  describe('Content Area', () => {
    it('wraps content in fixed height container', () => {
      render(<ChartCard {...defaultProps} />);

      const contentContainer = screen.getByTestId('chart-content').parentElement;
      expect(contentContainer).toHaveClass('h-80');
    });

    it('displays content in relative positioned container', () => {
      const { container } = render(<ChartCard {...defaultProps} />);

      const contentWrapper = container.querySelector('.relative');
      expect(contentWrapper).toBeInTheDocument();
    });
  });

  describe('Header Layout', () => {
    it('displays title and actions in flex container', () => {
      render(<ChartCard {...defaultProps} onRefresh={mockOnRefresh} />);

      // Check for flex layout class on header
      const header = screen.getByText('Test Chart').parentElement?.parentElement;
      expect(header).toHaveClass('flex');
      expect(header).toHaveClass('justify-between');
    });

    it('aligns items at start', () => {
      render(<ChartCard {...defaultProps} subtitle="Subtitle" />);

      const header = screen.getByText('Test Chart').parentElement?.parentElement;
      expect(header).toHaveClass('items-start');
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <ChartCard
          {...defaultProps}
          subtitle="Chart subtitle"
          onRefresh={mockOnRefresh}
          onExport={mockOnExport}
          onExpand={mockOnExpand}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper heading hierarchy', () => {
      render(<ChartCard {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Test Chart');
    });

    it('action buttons have title attributes for accessibility', () => {
      render(
        <ChartCard
          {...defaultProps}
          onRefresh={mockOnRefresh}
          onExport={mockOnExport}
          onExpand={mockOnExpand}
        />
      );

      expect(screen.getByTitle('Refresh data')).toBeInTheDocument();
      expect(screen.getByTitle('Export data')).toBeInTheDocument();
      expect(screen.getByTitle('Expand view')).toBeInTheDocument();
    });

    it('supports keyboard navigation for action buttons', async () => {
      const user = userEvent.setup();
      render(<ChartCard {...defaultProps} onRefresh={mockOnRefresh} />);

      const button = screen.getByTitle('Refresh data');
      button.focus();

      await user.keyboard('{Enter}');
      expect(mockOnRefresh).toHaveBeenCalled();
    });
  });

  describe('Icon Rendering', () => {
    it('renders RefreshCw icon for refresh button', () => {
      render(<ChartCard {...defaultProps} onRefresh={mockOnRefresh} />);

      const button = screen.getByTitle('Refresh data');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('h-4', 'w-4');
    });

    it('renders Download icon for export button', () => {
      render(<ChartCard {...defaultProps} onExport={mockOnExport} />);

      const button = screen.getByTitle('Export data');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders Maximize2 icon for expand button', () => {
      render(<ChartCard {...defaultProps} onExpand={mockOnExpand} />);

      const button = screen.getByTitle('Expand view');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty title gracefully', () => {
      render(<ChartCard title="" children={<div>Content</div>} />);

      // Should render without crashing
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('handles null children gracefully', () => {
      // @ts-expect-error Testing null children
      render(<ChartCard title="Test" children={null} />);

      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('handles multiple children', () => {
      render(
        <ChartCard title="Test">
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </ChartCard>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });

    it('handles very long title', () => {
      const longTitle = 'A'.repeat(200);
      render(<ChartCard title={longTitle} children={<div>Content</div>} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });
  });
});
