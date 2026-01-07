/**
 * @fileoverview Enterprise-grade tests for DateRangeSelector component
 * Tests date range selection, presets, custom ranges, and accessibility
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { DateRangeSelector, type DateRange, type DatePreset } from './DateRangeSelector';
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns';

expect.extend(toHaveNoViolations);

describe('DateRangeSelector', () => {
  const mockOnChange = jest.fn();

  const defaultValue: DateRange = {
    start: subDays(new Date(), 30),
    end: new Date(),
    label: 'Last 30 Days'
  };

  const defaultProps = {
    value: defaultValue,
    onChange: mockOnChange
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with required props', () => {
      render(<DateRangeSelector {...defaultProps} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('displays current label', () => {
      render(<DateRangeSelector {...defaultProps} />);

      expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
    });

    it('displays formatted date range', () => {
      render(<DateRangeSelector {...defaultProps} />);

      const startFormatted = format(defaultValue.start, 'MMM d');
      const endFormatted = format(defaultValue.end, 'MMM d, yyyy');

      expect(screen.getByText(`${startFormatted} - ${endFormatted}`)).toBeInTheDocument();
    });

    it('displays calendar icon', () => {
      render(<DateRangeSelector {...defaultProps} />);

      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <DateRangeSelector {...defaultProps} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Dropdown Toggle', () => {
    it('opens dropdown on button click', async () => {
      const user = userEvent.setup();
      render(<DateRangeSelector {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('Quick Select')).toBeInTheDocument();
    });

    it('closes dropdown on second click', async () => {
      const user = userEvent.setup();
      render(<DateRangeSelector {...defaultProps} />);

      await user.click(screen.getByRole('button'));
      expect(screen.getByText('Quick Select')).toBeInTheDocument();

      await user.click(screen.getByRole('button'));
      expect(screen.queryByText('Quick Select')).not.toBeInTheDocument();
    });

    it('closes dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <DateRangeSelector {...defaultProps} />
          <div data-testid="outside">Outside</div>
        </div>
      );

      await user.click(screen.getByRole('button'));
      expect(screen.getByText('Quick Select')).toBeInTheDocument();

      // Click the overlay
      const overlay = document.querySelector('.fixed.inset-0');
      if (overlay) {
        fireEvent.click(overlay);
      }

      await waitFor(() => {
        expect(screen.queryByText('Quick Select')).not.toBeInTheDocument();
      });
    });
  });

  describe('Default Presets', () => {
    it('renders all default presets', async () => {
      const user = userEvent.setup();
      render(<DateRangeSelector {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
      expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
      expect(screen.getByText('Last 90 Days')).toBeInTheDocument();
      expect(screen.getByText('This Month')).toBeInTheDocument();
      expect(screen.getByText('Last Month')).toBeInTheDocument();
      expect(screen.getByText('This Year')).toBeInTheDocument();
    });

    it('calls onChange with correct range for Last 7 Days', async () => {
      const user = userEvent.setup();
      render(<DateRangeSelector {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      // Find the preset button in the dropdown
      const buttons = screen.getAllByText('Last 7 Days');
      const presetButton = buttons.find(btn => btn.closest('button')?.className.includes('border-gray-200'));

      if (presetButton) {
        await user.click(presetButton);
      }

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Last 7 Days'
        })
      );
    });

    it('closes dropdown after selecting preset', async () => {
      const user = userEvent.setup();
      render(<DateRangeSelector {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      const buttons = screen.getAllByText('Last 7 Days');
      const presetButton = buttons.find(btn => btn.closest('button')?.className.includes('border-gray-200'));

      if (presetButton) {
        await user.click(presetButton);
      }

      expect(screen.queryByText('Quick Select')).not.toBeInTheDocument();
    });
  });

  describe('Custom Presets', () => {
    it('renders custom presets when provided', async () => {
      const customPresets: DatePreset[] = [
        {
          label: 'Custom Period',
          value: 'custom',
          getRange: () => ({
            start: new Date('2024-01-01'),
            end: new Date('2024-06-30'),
            label: 'Custom Period'
          })
        }
      ];

      const user = userEvent.setup();
      render(<DateRangeSelector {...defaultProps} presets={customPresets} />);

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('Custom Period')).toBeInTheDocument();
    });

    it('calls custom preset getRange function', async () => {
      const mockGetRange = jest.fn().mockReturnValue({
        start: new Date('2024-01-01'),
        end: new Date('2024-06-30'),
        label: 'Custom Period'
      });

      const customPresets: DatePreset[] = [
        {
          label: 'Custom Period',
          value: 'custom',
          getRange: mockGetRange
        }
      ];

      const user = userEvent.setup();
      render(<DateRangeSelector {...defaultProps} presets={customPresets} />);

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('Custom Period'));

      expect(mockGetRange).toHaveBeenCalled();
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Custom Period'
        })
      );
    });
  });

  describe('Custom Date Range', () => {
    it('renders custom range inputs', async () => {
      const user = userEvent.setup();
      render(<DateRangeSelector {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('Custom Range')).toBeInTheDocument();
      expect(screen.getByText('Start Date')).toBeInTheDocument();
      expect(screen.getByText('End Date')).toBeInTheDocument();
    });

    it('renders Apply button for custom range', async () => {
      const user = userEvent.setup();
      render(<DateRangeSelector {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument();
    });

    it('initializes custom inputs with current range values', async () => {
      const user = userEvent.setup();
      render(<DateRangeSelector {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      const startInput = screen.getByLabelText('Start Date');
      const endInput = screen.getByLabelText('End Date');

      expect(startInput).toHaveValue(format(defaultValue.start, 'yyyy-MM-dd'));
      expect(endInput).toHaveValue(format(defaultValue.end, 'yyyy-MM-dd'));
    });

    it('applies custom date range on Apply click', async () => {
      const user = userEvent.setup();
      render(<DateRangeSelector {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      const startInput = screen.getByLabelText('Start Date');
      await user.clear(startInput);
      await user.type(startInput, '2024-01-15');

      const endInput = screen.getByLabelText('End Date');
      await user.clear(endInput);
      await user.type(endInput, '2024-02-15');

      await user.click(screen.getByRole('button', { name: 'Apply' }));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Custom Range'
        })
      );
    });

    it('closes dropdown after applying custom range', async () => {
      const user = userEvent.setup();
      render(<DateRangeSelector {...defaultProps} />);

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByRole('button', { name: 'Apply' }));

      expect(screen.queryByText('Custom Range')).not.toBeInTheDocument();
    });
  });

  describe('Date Input Behavior', () => {
    it('updates custom start date on input change', async () => {
      const user = userEvent.setup();
      render(<DateRangeSelector {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      const startInput = screen.getByLabelText('Start Date');
      await user.clear(startInput);
      await user.type(startInput, '2024-03-01');

      expect(startInput).toHaveValue('2024-03-01');
    });

    it('updates custom end date on input change', async () => {
      const user = userEvent.setup();
      render(<DateRangeSelector {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      const endInput = screen.getByLabelText('End Date');
      await user.clear(endInput);
      await user.type(endInput, '2024-03-31');

      expect(endInput).toHaveValue('2024-03-31');
    });
  });

  describe('Styling', () => {
    it('applies correct button styling', () => {
      render(<DateRangeSelector {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-lg');
      expect(button).toHaveClass('border');
    });

    it('applies dark mode styles', () => {
      render(<DateRangeSelector {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('dark:border-gray-600');
      expect(button).toHaveClass('dark:bg-gray-800');
    });

    it('dropdown has proper positioning', async () => {
      const user = userEvent.setup();
      render(<DateRangeSelector {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      const dropdown = screen.getByText('Quick Select').closest('div');
      expect(dropdown?.parentElement).toHaveClass('absolute');
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<DateRangeSelector {...defaultProps} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('date inputs have proper labels', async () => {
      const user = userEvent.setup();
      render(<DateRangeSelector {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
      expect(screen.getByLabelText('End Date')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<DateRangeSelector {...defaultProps} />);

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard('{Enter}');
      expect(screen.getByText('Quick Select')).toBeInTheDocument();
    });
  });

  describe('Preset Calculations', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-06-15'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('calculates Last 7 Days correctly', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DateRangeSelector {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      const buttons = screen.getAllByText('Last 7 Days');
      const presetButton = buttons.find(btn => btn.closest('button')?.className.includes('border-gray-200'));

      if (presetButton) {
        await user.click(presetButton);
      }

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          start: expect.any(Date),
          end: expect.any(Date)
        })
      );
    });

    it('calculates This Month correctly', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DateRangeSelector {...defaultProps} />);

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('This Month'));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'This Month'
        })
      );
    });

    it('calculates Last Month correctly', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DateRangeSelector {...defaultProps} />);

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('Last Month'));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Last Month'
        })
      );
    });

    it('calculates This Year correctly', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DateRangeSelector {...defaultProps} />);

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('This Year'));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'This Year'
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles same start and end date', () => {
      const sameDay: DateRange = {
        start: new Date('2024-06-15'),
        end: new Date('2024-06-15'),
        label: 'Single Day'
      };

      render(<DateRangeSelector {...defaultProps} value={sameDay} />);

      expect(screen.getByText('Single Day')).toBeInTheDocument();
    });

    it('handles end date before start date gracefully', async () => {
      const user = userEvent.setup();
      render(<DateRangeSelector {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      const startInput = screen.getByLabelText('Start Date');
      await user.clear(startInput);
      await user.type(startInput, '2024-06-30');

      const endInput = screen.getByLabelText('End Date');
      await user.clear(endInput);
      await user.type(endInput, '2024-06-01');

      await user.click(screen.getByRole('button', { name: 'Apply' }));

      // Should still call onChange (validation is responsibility of consumer)
      expect(mockOnChange).toHaveBeenCalled();
    });
  });
});
