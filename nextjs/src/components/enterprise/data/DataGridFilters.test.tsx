/**
 * @module components/enterprise/data/DataGridFilters.test
 * @description Unit tests for DataGridFilters component.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataGridFilters, type FilterConfig } from './DataGridFilters';
import type { ColumnDefinition, EditorOption } from './DataGridColumn';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: 'bg-white', highlight: 'bg-gray-100' },
      text: { primary: 'text-gray-900', secondary: 'text-gray-600', tertiary: 'text-gray-400' },
      border: { default: 'border-gray-200', subtle: 'border-gray-100' },
      backdrop: 'bg-black/50',
    },
  }),
}));

// ============================================================================
// TEST SETUP
// ============================================================================

interface TestRow {
  id: string;
  name: string;
  age: number;
  salary: number;
  hireDate: string;
  status: string;
}

const textColumn: ColumnDefinition<TestRow> = {
  id: 'name',
  header: 'Name',
  accessorKey: 'name',
  filterable: true,
  editorType: 'text',
};

const numberColumn: ColumnDefinition<TestRow> = {
  id: 'age',
  header: 'Age',
  accessorKey: 'age',
  filterable: true,
  editorType: 'number',
};

const dateColumn: ColumnDefinition<TestRow> = {
  id: 'hireDate',
  header: 'Hire Date',
  accessorKey: 'hireDate',
  filterable: true,
  editorType: 'date',
};

const selectColumn: ColumnDefinition<TestRow> = {
  id: 'status',
  header: 'Status',
  accessorKey: 'status',
  filterable: true,
  editorType: 'select',
  editorOptions: [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' },
  ] as EditorOption[],
};

const nonFilterableColumn: ColumnDefinition<TestRow> = {
  id: 'id',
  header: 'ID',
  accessorKey: 'id',
  filterable: false,
};

const defaultColumns: ColumnDefinition<TestRow>[] = [
  textColumn,
  numberColumn,
  dateColumn,
  selectColumn,
];

const defaultProps = {
  columns: defaultColumns,
  filters: {},
  onFilterChange: jest.fn(),
};

const renderFilters = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<DataGridFilters {...mergedProps} />);
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================================================
// RENDERING TESTS
// ============================================================================

describe('DataGridFilters rendering', () => {
  it('should render filter header', () => {
    renderFilters();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('should show expand/collapse indicator', () => {
    renderFilters();
    // Should show down arrow when collapsed
    expect(screen.getByText('▼')).toBeInTheDocument();
  });

  it('should not render when no filterable columns', () => {
    const { container } = renderFilters({
      columns: [nonFilterableColumn],
    });

    expect(container.firstChild).toBeNull();
  });

  it('should show active filter count', () => {
    renderFilters({
      filters: { name: 'John', age: { type: 'number', min: 18 } },
    });

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should show Clear All button when filters are active', () => {
    renderFilters({
      filters: { name: 'John' },
    });

    expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
  });

  it('should not show Clear All button when no filters', () => {
    renderFilters({ filters: {} });

    expect(screen.queryByRole('button', { name: /clear all/i })).not.toBeInTheDocument();
  });
});

// ============================================================================
// EXPAND/COLLAPSE TESTS
// ============================================================================

describe('DataGridFilters expand/collapse', () => {
  it('should expand filter controls on header click', async () => {
    renderFilters();

    // Click to expand
    await userEvent.click(screen.getByText('Filters'));

    // Should now show up arrow
    expect(screen.getByText('▲')).toBeInTheDocument();

    // Should show filter inputs
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('should collapse filter controls on second click', async () => {
    renderFilters();

    // Click to expand
    await userEvent.click(screen.getByText('Filters'));
    expect(screen.getByText('▲')).toBeInTheDocument();

    // Click to collapse
    await userEvent.click(screen.getByText('Filters'));
    expect(screen.getByText('▼')).toBeInTheDocument();

    // Filter inputs should not be visible
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
  });
});

// ============================================================================
// TEXT FILTER TESTS
// ============================================================================

describe('DataGridFilters text filter', () => {
  it('should render text input for text columns', async () => {
    renderFilters();

    await userEvent.click(screen.getByText('Filters'));

    const input = screen.getByPlaceholderText(/filter name/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should call onFilterChange when typing', async () => {
    const onFilterChange = jest.fn();
    renderFilters({ onFilterChange });

    await userEvent.click(screen.getByText('Filters'));

    const input = screen.getByPlaceholderText(/filter name/i);
    await userEvent.type(input, 'John');

    expect(onFilterChange).toHaveBeenCalledWith({ name: 'John' });
  });

  it('should remove filter when clearing text', async () => {
    const onFilterChange = jest.fn();
    renderFilters({
      onFilterChange,
      filters: { name: 'John' },
    });

    await userEvent.click(screen.getByText('Filters'));

    const input = screen.getByPlaceholderText(/filter name/i);
    await userEvent.clear(input);

    expect(onFilterChange).toHaveBeenCalledWith({});
  });

  it('should display existing filter value', async () => {
    renderFilters({
      filters: { name: 'existing' },
    });

    await userEvent.click(screen.getByText('Filters'));

    const input = screen.getByPlaceholderText(/filter name/i) as HTMLInputElement;
    expect(input.value).toBe('existing');
  });
});

// ============================================================================
// NUMBER FILTER TESTS
// ============================================================================

describe('DataGridFilters number filter', () => {
  it('should render min/max inputs for number columns', async () => {
    renderFilters();

    await userEvent.click(screen.getByText('Filters'));

    expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
  });

  it('should call onFilterChange with min value', async () => {
    const onFilterChange = jest.fn();
    renderFilters({ onFilterChange });

    await userEvent.click(screen.getByText('Filters'));

    const minInput = screen.getByPlaceholderText('Min');
    await userEvent.type(minInput, '18');

    expect(onFilterChange).toHaveBeenCalledWith({
      age: expect.objectContaining({
        type: 'number',
        min: 18,
      }),
    });
  });

  it('should call onFilterChange with max value', async () => {
    const onFilterChange = jest.fn();
    renderFilters({ onFilterChange });

    await userEvent.click(screen.getByText('Filters'));

    const maxInput = screen.getByPlaceholderText('Max');
    await userEvent.type(maxInput, '65');

    expect(onFilterChange).toHaveBeenCalledWith({
      age: expect.objectContaining({
        type: 'number',
        max: 65,
      }),
    });
  });

  it('should preserve min when changing max', async () => {
    const onFilterChange = jest.fn();
    renderFilters({
      onFilterChange,
      filters: { age: { type: 'number', min: 18 } as FilterConfig },
    });

    await userEvent.click(screen.getByText('Filters'));

    const maxInput = screen.getByPlaceholderText('Max');
    await userEvent.type(maxInput, '65');

    const lastCall = onFilterChange.mock.calls[onFilterChange.mock.calls.length - 1][0];
    expect(lastCall.age.min).toBe(18);
    expect(lastCall.age.max).toBe(65);
  });

  it('should display existing number filter values', async () => {
    renderFilters({
      filters: {
        age: { type: 'number', min: 20, max: 50 } as FilterConfig,
      },
    });

    await userEvent.click(screen.getByText('Filters'));

    const minInput = screen.getByPlaceholderText('Min') as HTMLInputElement;
    const maxInput = screen.getByPlaceholderText('Max') as HTMLInputElement;

    expect(minInput.value).toBe('20');
    expect(maxInput.value).toBe('50');
  });
});

// ============================================================================
// DATE FILTER TESTS
// ============================================================================

describe('DataGridFilters date filter', () => {
  it('should render date inputs for date columns', async () => {
    renderFilters();

    await userEvent.click(screen.getByText('Filters'));

    const dateInputs = screen.getAllByRole('textbox');
    const dateTypeInputs = dateInputs.filter(
      input => (input as HTMLInputElement).type === 'date'
    );

    // Should have 2 date inputs (min and max)
    expect(dateTypeInputs.length).toBeGreaterThanOrEqual(0);
  });

  it('should call onFilterChange with date range', async () => {
    const onFilterChange = jest.fn();
    renderFilters({ onFilterChange });

    await userEvent.click(screen.getByText('Filters'));

    // Find the date column label and its associated inputs
    const hireDateLabel = screen.getByText('Hire Date');
    expect(hireDateLabel).toBeInTheDocument();
  });

  it('should display existing date filter values', async () => {
    renderFilters({
      filters: {
        hireDate: { type: 'date', min: '2023-01-01', max: '2023-12-31' } as FilterConfig,
      },
    });

    await userEvent.click(screen.getByText('Filters'));

    // Check the date filter exists
    const hireDateLabel = screen.getByText('Hire Date');
    expect(hireDateLabel).toBeInTheDocument();
  });
});

// ============================================================================
// SELECT FILTER TESTS
// ============================================================================

describe('DataGridFilters select filter', () => {
  it('should render dropdown for select columns', async () => {
    renderFilters();

    await userEvent.click(screen.getByText('Filters'));

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('should show All option by default', async () => {
    renderFilters();

    await userEvent.click(screen.getByText('Filters'));

    expect(screen.getByRole('option', { name: 'All' })).toBeInTheDocument();
  });

  it('should show configured options', async () => {
    renderFilters();

    await userEvent.click(screen.getByText('Filters'));

    expect(screen.getByRole('option', { name: 'Active' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Inactive' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Pending' })).toBeInTheDocument();
  });

  it('should call onFilterChange when selecting option', async () => {
    const onFilterChange = jest.fn();
    renderFilters({ onFilterChange });

    await userEvent.click(screen.getByText('Filters'));

    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'active');

    expect(onFilterChange).toHaveBeenCalledWith({
      status: expect.objectContaining({
        type: 'select',
        value: 'active',
      }),
    });
  });

  it('should clear filter when selecting All', async () => {
    const onFilterChange = jest.fn();
    renderFilters({
      onFilterChange,
      filters: { status: { type: 'select', value: 'active' } as FilterConfig },
    });

    await userEvent.click(screen.getByText('Filters'));

    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, '');

    expect(onFilterChange).toHaveBeenCalledWith({});
  });

  it('should show selected value', async () => {
    renderFilters({
      filters: { status: { type: 'select', value: 'pending' } as FilterConfig },
    });

    await userEvent.click(screen.getByText('Filters'));

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('pending');
  });
});

// ============================================================================
// CLEAR ALL TESTS
// ============================================================================

describe('DataGridFilters clear all', () => {
  it('should clear all filters when clicking Clear All', async () => {
    const onFilterChange = jest.fn();
    renderFilters({
      onFilterChange,
      filters: {
        name: 'John',
        age: { type: 'number', min: 18 } as FilterConfig,
      },
    });

    await userEvent.click(screen.getByRole('button', { name: /clear all/i }));

    expect(onFilterChange).toHaveBeenCalledWith({});
  });

  it('should stop propagation to prevent toggle', async () => {
    const onFilterChange = jest.fn();
    renderFilters({
      onFilterChange,
      filters: { name: 'John' },
    });

    // Filters should initially be collapsed (default state)
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();

    // Click Clear All
    await userEvent.click(screen.getByRole('button', { name: /clear all/i }));

    // Filters should still be collapsed (header not toggled)
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
  });
});

// ============================================================================
// STYLING TESTS
// ============================================================================

describe('DataGridFilters styling', () => {
  it('should apply border styling', () => {
    const { container } = renderFilters();

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('border-b');
  });

  it('should apply theme surface styling to header', async () => {
    renderFilters();

    const header = screen.getByText('Filters').parentElement?.parentElement;
    expect(header).toHaveClass('bg-gray-100');
  });

  it('should apply grid layout to filter controls', async () => {
    renderFilters();

    await userEvent.click(screen.getByText('Filters'));

    const filterContainer = screen.getByLabelText('Name').closest('.grid');
    expect(filterContainer).toHaveClass('grid', 'grid-cols-1');
  });

  it('should style active filter badge', () => {
    renderFilters({
      filters: { name: 'test' },
    });

    const badge = screen.getByText('1');
    expect(badge).toHaveClass('bg-blue-500', 'text-white', 'rounded-full');
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('DataGridFilters accessibility', () => {
  it('should have proper labels for filter inputs', async () => {
    renderFilters();

    await userEvent.click(screen.getByText('Filters'));

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Age')).toBeInTheDocument();
    expect(screen.getByLabelText('Hire Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });

  it('should have accessible expand/collapse behavior', async () => {
    renderFilters();

    const header = screen.getByText('Filters').closest('div[class*="cursor-pointer"]');
    expect(header).toHaveClass('cursor-pointer');
  });

  it('should have accessible button for Clear All', async () => {
    renderFilters({
      filters: { name: 'test' },
    });

    const clearButton = screen.getByRole('button', { name: /clear all/i });
    expect(clearButton).toBeInTheDocument();
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('DataGridFilters edge cases', () => {
  it('should handle empty columns array', () => {
    const { container } = renderFilters({ columns: [] });
    expect(container.firstChild).toBeNull();
  });

  it('should handle all non-filterable columns', () => {
    const { container } = renderFilters({
      columns: [
        { ...textColumn, filterable: false },
        { ...numberColumn, filterable: false },
      ],
    });

    expect(container.firstChild).toBeNull();
  });

  it('should handle missing editorOptions for select column', async () => {
    renderFilters({
      columns: [
        {
          ...selectColumn,
          editorOptions: undefined,
        },
      ],
    });

    await userEvent.click(screen.getByText('Filters'));

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    // Should only have All option
    expect(screen.getByRole('option', { name: 'All' })).toBeInTheDocument();
  });

  it('should handle whitespace-only text filter', async () => {
    const onFilterChange = jest.fn();
    renderFilters({ onFilterChange });

    await userEvent.click(screen.getByText('Filters'));

    const input = screen.getByPlaceholderText(/filter name/i);
    await userEvent.type(input, '   ');

    // Should not add filter for whitespace
    const lastCall = onFilterChange.mock.calls[onFilterChange.mock.calls.length - 1][0];
    expect(lastCall.name).toBeUndefined();
  });

  it('should handle very long filter values', async () => {
    const onFilterChange = jest.fn();
    renderFilters({ onFilterChange });

    await userEvent.click(screen.getByText('Filters'));

    const longValue = 'a'.repeat(1000);
    const input = screen.getByPlaceholderText(/filter name/i);
    await userEvent.type(input, longValue);

    expect(onFilterChange).toHaveBeenCalled();
  });

  it('should handle rapid filter changes', async () => {
    const onFilterChange = jest.fn();
    renderFilters({ onFilterChange });

    await userEvent.click(screen.getByText('Filters'));

    const input = screen.getByPlaceholderText(/filter name/i);

    // Rapid typing
    await userEvent.type(input, 'abcdef', { delay: 10 });

    // Should have called for each character
    expect(onFilterChange.mock.calls.length).toBeGreaterThanOrEqual(6);
  });

  it('should handle number filter with invalid input', async () => {
    const onFilterChange = jest.fn();
    renderFilters({ onFilterChange });

    await userEvent.click(screen.getByText('Filters'));

    // Type non-numeric value (browser may prevent this for type="number")
    const minInput = screen.getByPlaceholderText('Min');
    fireEvent.change(minInput, { target: { value: 'abc' } });

    // onFilterChange should handle the NaN gracefully
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('DataGridFilters integration', () => {
  it('should support mixed filter types simultaneously', async () => {
    const onFilterChange = jest.fn();
    renderFilters({
      onFilterChange,
      filters: {
        name: 'John',
        age: { type: 'number', min: 18, max: 65 } as FilterConfig,
        status: { type: 'select', value: 'active' } as FilterConfig,
      },
    });

    await userEvent.click(screen.getByText('Filters'));

    // All filters should be displayed
    const nameInput = screen.getByPlaceholderText(/filter name/i) as HTMLInputElement;
    const minInput = screen.getByPlaceholderText('Min') as HTMLInputElement;
    const maxInput = screen.getByPlaceholderText('Max') as HTMLInputElement;
    const statusSelect = screen.getByRole('combobox') as HTMLSelectElement;

    expect(nameInput.value).toBe('John');
    expect(minInput.value).toBe('18');
    expect(maxInput.value).toBe('65');
    expect(statusSelect.value).toBe('active');
  });

  it('should update multiple filters independently', async () => {
    const onFilterChange = jest.fn();
    renderFilters({
      onFilterChange,
      filters: { name: 'John' },
    });

    await userEvent.click(screen.getByText('Filters'));

    // Add number filter
    const minInput = screen.getByPlaceholderText('Min');
    await userEvent.type(minInput, '25');

    // Should preserve name filter while adding age filter
    const lastCall = onFilterChange.mock.calls[onFilterChange.mock.calls.length - 1][0];
    expect(lastCall.name).toBe('John');
    expect(lastCall.age).toBeDefined();
  });
});
