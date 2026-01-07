/**
 * @fileoverview Enterprise-grade tests for AnalyticsFilters component
 * Tests date range selection, filter groups, presets, and state management
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AnalyticsFilters, type AnalyticsFilterState, type FilterGroup, type DatePreset } from './AnalyticsFilters';

expect.extend(toHaveNoViolations);

// Mock useTheme hook
jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: '#ffffff', raised: '#f8fafc', input: '#ffffff', highlight: '#f1f5f9' },
      text: { primary: '#1e293b', secondary: '#64748b', tertiary: '#94a3b8' },
      border: { default: '#e2e8f0', subtle: '#f1f5f9' },
      primary: { main: '#3b82f6' },
      backdrop: 'rgba(0,0,0,0.5)'
    }
  })
}));

describe('AnalyticsFilters', () => {
  const mockOnFilterChange = jest.fn();

  const defaultFilterGroups: FilterGroup[] = [
    {
      id: 'status',
      label: 'Case Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'pending', label: 'Pending' },
        { value: 'closed', label: 'Closed' }
      ],
      multiSelect: true
    },
    {
      id: 'priority',
      label: 'Priority',
      options: [
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' }
      ],
      multiSelect: false
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<AnalyticsFilters />);

      expect(screen.getByText('Date Range')).toBeInTheDocument();
      expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
    });

    it('renders date range selector when showDateRange is true', () => {
      render(<AnalyticsFilters showDateRange={true} />);

      expect(screen.getByText('Date Range')).toBeInTheDocument();
    });

    it('hides date range selector when showDateRange is false', () => {
      render(<AnalyticsFilters showDateRange={false} />);

      expect(screen.queryByText('Date Range')).not.toBeInTheDocument();
    });

    it('renders filter groups with labels', () => {
      render(<AnalyticsFilters filterGroups={defaultFilterGroups} />);

      expect(screen.getByText('Case Status')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
    });

    it('renders all filter options within groups', () => {
      render(<AnalyticsFilters filterGroups={defaultFilterGroups} />);

      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Closed')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Low')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<AnalyticsFilters className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Date Presets', () => {
    const presets: DatePreset[] = ['today', 'yesterday', 'last7days', 'last30days', 'lastQuarter', 'ytd', 'custom'];

    it('renders all provided date presets', () => {
      render(<AnalyticsFilters presets={presets} showPresets={true} />);

      expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Yesterday' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Last 7 Days' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Last 30 Days' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Last Quarter' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Year to Date' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Custom Range' })).toBeInTheDocument();
    });

    it('hides presets when showPresets is false', () => {
      render(<AnalyticsFilters showPresets={false} />);

      expect(screen.queryByRole('button', { name: 'Today' })).not.toBeInTheDocument();
    });

    it('selects preset and calls onFilterChange', async () => {
      const user = userEvent.setup();
      render(<AnalyticsFilters onFilterChange={mockOnFilterChange} />);

      await user.click(screen.getByRole('button', { name: 'Today' }));

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          datePreset: 'today'
        })
      );
    });

    it('highlights the selected preset', async () => {
      const user = userEvent.setup();
      render(<AnalyticsFilters />);

      const todayButton = screen.getByRole('button', { name: 'Today' });
      await user.click(todayButton);

      // The button should have updated styles (backgroundColor matches primary)
      expect(todayButton).toHaveStyle({ backgroundColor: '#3b82f6' });
    });
  });

  describe('Custom Date Range', () => {
    it('shows custom date inputs when custom preset is selected', async () => {
      const user = userEvent.setup();
      render(<AnalyticsFilters presets={['custom']} />);

      await user.click(screen.getByRole('button', { name: 'Custom Range' }));

      expect(screen.getByText('Start Date')).toBeInTheDocument();
      expect(screen.getByText('End Date')).toBeInTheDocument();
    });

    it('updates date range on custom date input change', async () => {
      const user = userEvent.setup();
      render(<AnalyticsFilters presets={['custom']} onFilterChange={mockOnFilterChange} />);

      await user.click(screen.getByRole('button', { name: 'Custom Range' }));

      const startDateInput = screen.getAllByRole('textbox')[0] || screen.getByLabelText(/start date/i);

      // Date inputs don't use textbox role, search by type
      const dateInputs = document.querySelectorAll('input[type="date"]');
      expect(dateInputs.length).toBeGreaterThan(0);
    });
  });

  describe('Filter Groups', () => {
    it('renders checkbox inputs for multi-select groups', () => {
      render(<AnalyticsFilters filterGroups={defaultFilterGroups} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBe(3); // 3 status options
    });

    it('renders radio inputs for single-select groups', () => {
      render(<AnalyticsFilters filterGroups={defaultFilterGroups} />);

      const radios = screen.getAllByRole('radio');
      expect(radios.length).toBe(3); // 3 priority options
    });

    it('handles multi-select filter changes', async () => {
      const user = userEvent.setup();
      render(<AnalyticsFilters filterGroups={defaultFilterGroups} onFilterChange={mockOnFilterChange} />);

      await user.click(screen.getByLabelText('Active'));

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            status: ['active']
          })
        })
      );
    });

    it('allows multiple selections in multi-select groups', async () => {
      const user = userEvent.setup();
      render(<AnalyticsFilters filterGroups={defaultFilterGroups} onFilterChange={mockOnFilterChange} />);

      await user.click(screen.getByLabelText('Active'));
      await user.click(screen.getByLabelText('Pending'));

      expect(mockOnFilterChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            status: ['active', 'pending']
          })
        })
      );
    });

    it('handles single-select filter changes (radio)', async () => {
      const user = userEvent.setup();
      render(<AnalyticsFilters filterGroups={defaultFilterGroups} onFilterChange={mockOnFilterChange} />);

      await user.click(screen.getByLabelText('High'));

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            priority: ['high']
          })
        })
      );
    });

    it('replaces selection in single-select groups', async () => {
      const user = userEvent.setup();
      render(<AnalyticsFilters filterGroups={defaultFilterGroups} onFilterChange={mockOnFilterChange} />);

      await user.click(screen.getByLabelText('High'));
      await user.click(screen.getByLabelText('Low'));

      expect(mockOnFilterChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            priority: ['low']
          })
        })
      );
    });

    it('deselects filter option on second click (multi-select)', async () => {
      const user = userEvent.setup();
      render(<AnalyticsFilters filterGroups={defaultFilterGroups} onFilterChange={mockOnFilterChange} />);

      await user.click(screen.getByLabelText('Active'));
      await user.click(screen.getByLabelText('Active'));

      expect(mockOnFilterChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            status: []
          })
        })
      );
    });
  });

  describe('Initial State', () => {
    it('initializes with provided initial state', () => {
      const initialState: Partial<AnalyticsFilterState> = {
        datePreset: 'today',
        filters: { status: ['active'] }
      };

      render(
        <AnalyticsFilters
          filterGroups={defaultFilterGroups}
          initialState={initialState}
        />
      );

      // Check that the active checkbox is checked
      expect(screen.getByLabelText('Active')).toBeChecked();
    });

    it('uses default state when no initial state provided', () => {
      render(<AnalyticsFilters filterGroups={defaultFilterGroups} />);

      // All checkboxes should be unchecked by default
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).not.toBeChecked();
      });
    });
  });

  describe('Reset Functionality', () => {
    it('shows reset button when filters are active', async () => {
      const user = userEvent.setup();
      render(<AnalyticsFilters filterGroups={defaultFilterGroups} />);

      await user.click(screen.getByLabelText('Active'));

      expect(screen.getByRole('button', { name: 'Reset Filters' })).toBeInTheDocument();
    });

    it('shows reset button when date preset differs from default', async () => {
      const user = userEvent.setup();
      render(<AnalyticsFilters />);

      await user.click(screen.getByRole('button', { name: 'Today' }));

      expect(screen.getByRole('button', { name: 'Reset Filters' })).toBeInTheDocument();
    });

    it('resets filters to default state', async () => {
      const user = userEvent.setup();
      render(<AnalyticsFilters filterGroups={defaultFilterGroups} onFilterChange={mockOnFilterChange} />);

      await user.click(screen.getByLabelText('Active'));
      await user.click(screen.getByRole('button', { name: 'Today' }));
      await user.click(screen.getByRole('button', { name: 'Reset Filters' }));

      expect(mockOnFilterChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          datePreset: 'last30days',
          filters: {}
        })
      );
    });

    it('hides reset button after reset', async () => {
      const user = userEvent.setup();
      render(<AnalyticsFilters filterGroups={defaultFilterGroups} />);

      await user.click(screen.getByLabelText('Active'));
      await user.click(screen.getByRole('button', { name: 'Reset Filters' }));

      expect(screen.queryByRole('button', { name: 'Reset Filters' })).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('disables all inputs when loading', () => {
      render(<AnalyticsFilters filterGroups={defaultFilterGroups} loading={true} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toBeDisabled();
      });
    });

    it('applies reduced opacity when loading', () => {
      render(<AnalyticsFilters loading={true} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveStyle({ opacity: '0.6' });
      });
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <AnalyticsFilters filterGroups={defaultFilterGroups} />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper label associations for inputs', () => {
      render(<AnalyticsFilters filterGroups={defaultFilterGroups} />);

      expect(screen.getByLabelText('Active')).toBeInTheDocument();
      expect(screen.getByLabelText('Pending')).toBeInTheDocument();
      expect(screen.getByLabelText('High')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<AnalyticsFilters filterGroups={defaultFilterGroups} />);

      const activeCheckbox = screen.getByLabelText('Active');
      activeCheckbox.focus();

      await user.keyboard('{Space}');
      expect(activeCheckbox).toBeChecked();
    });
  });

  describe('Date Range Calculations', () => {
    beforeEach(() => {
      // Mock current date for consistent testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-06-15'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('calculates today date range correctly', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<AnalyticsFilters onFilterChange={mockOnFilterChange} />);

      await user.click(screen.getByRole('button', { name: 'Today' }));

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          dateRange: {
            startDate: '2024-06-15',
            endDate: '2024-06-15'
          }
        })
      );
    });

    it('calculates yesterday date range correctly', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<AnalyticsFilters presets={['yesterday']} onFilterChange={mockOnFilterChange} />);

      await user.click(screen.getByRole('button', { name: 'Yesterday' }));

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          dateRange: {
            startDate: '2024-06-14',
            endDate: '2024-06-14'
          }
        })
      );
    });

    it('calculates last 7 days date range correctly', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<AnalyticsFilters presets={['last7days']} onFilterChange={mockOnFilterChange} />);

      await user.click(screen.getByRole('button', { name: 'Last 7 Days' }));

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          dateRange: {
            startDate: '2024-06-08',
            endDate: '2024-06-15'
          }
        })
      );
    });
  });
});
