/**
 * @fileoverview Enterprise-grade tests for FilterPanel component
 * Tests filter types, collapsible groups, and state management
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FilterPanel, type FilterGroup } from './FilterPanel';

expect.extend(toHaveNoViolations);

describe('FilterPanel', () => {
  const mockOnChange = jest.fn();
  const mockOnReset = jest.fn();

  const defaultFilters: FilterGroup[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active', count: 45 },
        { value: 'pending', label: 'Pending', count: 12 },
        { value: 'closed', label: 'Closed', count: 30 }
      ]
    },
    {
      id: 'category',
      label: 'Category',
      type: 'multiselect',
      options: [
        { value: 'civil', label: 'Civil Litigation' },
        { value: 'corporate', label: 'Corporate' },
        { value: 'family', label: 'Family Law' }
      ]
    },
    {
      id: 'search',
      label: 'Search',
      type: 'search'
    },
    {
      id: 'amount',
      label: 'Amount Range',
      type: 'range'
    }
  ];

  const defaultProps = {
    filters: defaultFilters,
    values: {},
    onChange: mockOnChange
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with required props', () => {
      render(<FilterPanel {...defaultProps} />);

      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('renders all filter groups', () => {
      render(<FilterPanel {...defaultProps} />);

      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByText('Amount Range')).toBeInTheDocument();
    });

    it('renders filter icon in header', () => {
      render(<FilterPanel {...defaultProps} />);

      const header = screen.getByText('Filters').closest('div');
      const svg = header?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <FilterPanel {...defaultProps} className="custom-filter-panel" />
      );

      expect(container.firstChild).toHaveClass('custom-filter-panel');
    });

    it('applies dark mode styles', () => {
      const { container } = render(<FilterPanel {...defaultProps} />);

      expect(container.firstChild).toHaveClass('dark:border-gray-700');
      expect(container.firstChild).toHaveClass('dark:bg-gray-800');
    });
  });

  describe('Select Filter Type', () => {
    it('renders select dropdown for select type', () => {
      render(<FilterPanel {...defaultProps} />);

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('displays options with counts', () => {
      render(<FilterPanel {...defaultProps} />);

      const select = screen.getByRole('combobox');
      expect(select).toContainHTML('Active (45)');
      expect(select).toContainHTML('Pending (12)');
      expect(select).toContainHTML('Closed (30)');
    });

    it('displays All option as default', () => {
      render(<FilterPanel {...defaultProps} />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('');
    });

    it('calls onChange when select value changes', async () => {
      const user = userEvent.setup();
      render(<FilterPanel {...defaultProps} />);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'active');

      expect(mockOnChange).toHaveBeenCalledWith('status', 'active');
    });

    it('displays current value from values prop', () => {
      render(<FilterPanel {...defaultProps} values={{ status: 'pending' }} />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('pending');
    });
  });

  describe('Multiselect Filter Type', () => {
    it('renders checkboxes for multiselect type', () => {
      render(<FilterPanel {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBe(3);
    });

    it('displays all multiselect options', () => {
      render(<FilterPanel {...defaultProps} />);

      expect(screen.getByLabelText('Civil Litigation')).toBeInTheDocument();
      expect(screen.getByLabelText('Corporate')).toBeInTheDocument();
      expect(screen.getByLabelText('Family Law')).toBeInTheDocument();
    });

    it('adds value to array on checkbox check', async () => {
      const user = userEvent.setup();
      render(<FilterPanel {...defaultProps} />);

      await user.click(screen.getByLabelText('Civil Litigation'));

      expect(mockOnChange).toHaveBeenCalledWith('category', ['civil']);
    });

    it('removes value from array on checkbox uncheck', async () => {
      const user = userEvent.setup();
      render(<FilterPanel {...defaultProps} values={{ category: ['civil', 'corporate'] }} />);

      await user.click(screen.getByLabelText('Civil Litigation'));

      expect(mockOnChange).toHaveBeenCalledWith('category', ['corporate']);
    });

    it('reflects current values in checkboxes', () => {
      render(<FilterPanel {...defaultProps} values={{ category: ['civil', 'family'] }} />);

      expect(screen.getByLabelText('Civil Litigation')).toBeChecked();
      expect(screen.getByLabelText('Corporate')).not.toBeChecked();
      expect(screen.getByLabelText('Family Law')).toBeChecked();
    });
  });

  describe('Search Filter Type', () => {
    it('renders text input for search type', () => {
      render(<FilterPanel {...defaultProps} />);

      const input = screen.getByPlaceholderText('Search search...');
      expect(input).toBeInTheDocument();
    });

    it('calls onChange on search input', async () => {
      const user = userEvent.setup();
      render(<FilterPanel {...defaultProps} />);

      const input = screen.getByPlaceholderText('Search search...');
      await user.type(input, 'test query');

      expect(mockOnChange).toHaveBeenCalledWith('search', 'test query');
    });

    it('displays current search value', () => {
      render(<FilterPanel {...defaultProps} values={{ search: 'existing query' }} />);

      const input = screen.getByPlaceholderText('Search search...');
      expect(input).toHaveValue('existing query');
    });
  });

  describe('Range Filter Type', () => {
    it('renders min and max inputs for range type', () => {
      render(<FilterPanel {...defaultProps} />);

      expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
    });

    it('calls onChange with min value', async () => {
      const user = userEvent.setup();
      render(<FilterPanel {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '100');

      expect(mockOnChange).toHaveBeenCalledWith('amount', { min: 100, max: 0 });
    });

    it('calls onChange with max value', async () => {
      const user = userEvent.setup();
      render(<FilterPanel {...defaultProps} values={{ amount: { min: 100, max: 0 } }} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.type(maxInput, '500');

      expect(mockOnChange).toHaveBeenCalledWith('amount', { min: 100, max: 500 });
    });

    it('displays current range values', () => {
      render(<FilterPanel {...defaultProps} values={{ amount: { min: 100, max: 500 } }} />);

      expect(screen.getByPlaceholderText('Min')).toHaveValue(100);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(500);
    });
  });

  describe('Collapsible Groups', () => {
    it('expands all groups by default', () => {
      render(<FilterPanel {...defaultProps} />);

      // All filter inputs should be visible
      expect(screen.getByRole('combobox')).toBeVisible();
      expect(screen.getAllByRole('checkbox').length).toBe(3);
    });

    it('collapses group on header click', async () => {
      const user = userEvent.setup();
      render(<FilterPanel {...defaultProps} />);

      const statusHeader = screen.getByText('Status').closest('button');
      await user.click(statusHeader!);

      // Select should no longer be visible
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('expands collapsed group on header click', async () => {
      const user = userEvent.setup();
      render(<FilterPanel {...defaultProps} />);

      const statusHeader = screen.getByText('Status').closest('button');

      // Collapse
      await user.click(statusHeader!);
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();

      // Expand
      await user.click(statusHeader!);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('rotates chevron icon when group is expanded', async () => {
      const user = userEvent.setup();
      render(<FilterPanel {...defaultProps} />);

      const statusHeader = screen.getByText('Status').closest('button');
      const chevron = statusHeader?.querySelector('svg');

      // Initially expanded, chevron rotated
      expect(chevron).toHaveClass('rotate-180');

      await user.click(statusHeader!);

      // Now collapsed, chevron not rotated
      expect(chevron).not.toHaveClass('rotate-180');
    });
  });

  describe('Active Filter Count', () => {
    it('shows active filter count badge when filters are set', () => {
      render(<FilterPanel {...defaultProps} values={{ status: 'active' }} />);

      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('updates count for multiple active filters', () => {
      render(
        <FilterPanel
          {...defaultProps}
          values={{
            status: 'active',
            category: ['civil'],
            search: 'test'
          }}
        />
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('counts multiselect arrays with items as one filter', () => {
      render(<FilterPanel {...defaultProps} values={{ category: ['civil', 'corporate'] }} />);

      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('does not count empty arrays', () => {
      render(<FilterPanel {...defaultProps} values={{ category: [] }} />);

      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('counts range objects as active filters', () => {
      render(<FilterPanel {...defaultProps} values={{ amount: { min: 100, max: 500 } }} />);

      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('Reset Functionality', () => {
    it('shows Clear button when onReset is provided and filters are active', () => {
      render(
        <FilterPanel
          {...defaultProps}
          values={{ status: 'active' }}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('hides Clear button when no filters are active', () => {
      render(<FilterPanel {...defaultProps} onReset={mockOnReset} />);

      expect(screen.queryByText('Clear')).not.toBeInTheDocument();
    });

    it('hides Clear button when onReset is not provided', () => {
      render(<FilterPanel {...defaultProps} values={{ status: 'active' }} />);

      expect(screen.queryByText('Clear')).not.toBeInTheDocument();
    });

    it('calls onReset when Clear button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <FilterPanel
          {...defaultProps}
          values={{ status: 'active' }}
          onReset={mockOnReset}
        />
      );

      await user.click(screen.getByText('Clear'));

      expect(mockOnReset).toHaveBeenCalled();
    });
  });

  describe('Option Counts', () => {
    it('displays count in parentheses for select options', () => {
      render(<FilterPanel {...defaultProps} />);

      const select = screen.getByRole('combobox');
      expect(select.innerHTML).toContain('(45)');
      expect(select.innerHTML).toContain('(12)');
      expect(select.innerHTML).toContain('(30)');
    });

    it('displays count in multiselect labels', () => {
      const filtersWithCounts: FilterGroup[] = [
        {
          id: 'category',
          label: 'Category',
          type: 'multiselect',
          options: [
            { value: 'civil', label: 'Civil', count: 25 },
            { value: 'corporate', label: 'Corporate', count: 15 }
          ]
        }
      ];

      render(<FilterPanel filters={filtersWithCounts} values={{}} onChange={mockOnChange} />);

      expect(screen.getByText('(25)')).toBeInTheDocument();
      expect(screen.getByText('(15)')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('has rounded corners', () => {
      const { container } = render(<FilterPanel {...defaultProps} />);

      expect(container.firstChild).toHaveClass('rounded-lg');
    });

    it('has border styling', () => {
      const { container } = render(<FilterPanel {...defaultProps} />);

      expect(container.firstChild).toHaveClass('border');
      expect(container.firstChild).toHaveClass('border-gray-200');
    });

    it('has scrollable content area', () => {
      const { container } = render(<FilterPanel {...defaultProps} />);

      const scrollContainer = container.querySelector('.overflow-y-auto');
      expect(scrollContainer).toHaveClass('max-h-96');
    });

    it('applies hover styles on group headers', () => {
      render(<FilterPanel {...defaultProps} />);

      const header = screen.getByText('Status').closest('button');
      expect(header).toHaveClass('hover:bg-gray-50');
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<FilterPanel {...defaultProps} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper label associations for checkboxes', () => {
      render(<FilterPanel {...defaultProps} />);

      const checkbox = screen.getByLabelText('Civil Litigation');
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });

    it('supports keyboard navigation for group toggle', async () => {
      const user = userEvent.setup();
      render(<FilterPanel {...defaultProps} />);

      const header = screen.getByText('Status').closest('button');
      header?.focus();

      await user.keyboard('{Enter}');

      // Group should be collapsed
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty filters array', () => {
      render(<FilterPanel filters={[]} values={{}} onChange={mockOnChange} />);

      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('handles undefined options in filter groups', () => {
      const filterWithoutOptions: FilterGroup[] = [
        {
          id: 'test',
          label: 'Test',
          type: 'select'
        }
      ];

      render(<FilterPanel filters={filterWithoutOptions} values={{}} onChange={mockOnChange} />);

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('handles null values gracefully', () => {
      render(<FilterPanel {...defaultProps} values={{ status: null as unknown as string }} />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('');
    });

    it('handles empty string values', () => {
      render(<FilterPanel {...defaultProps} values={{ status: '' }} />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('');
    });
  });
});
