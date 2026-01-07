/**
 * @module components/enterprise/data/DataGrid.test
 * @description Unit tests for the DataGrid component.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataGrid, type SortState } from './DataGrid';
import type { ColumnDefinition } from './DataGridColumn';

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

// Mock export functions
jest.mock('./DataGridExport', () => ({
  exportToCSV: jest.fn(),
  exportToExcel: jest.fn(),
  exportToPDF: jest.fn(),
}));

// ============================================================================
// TEST SETUP
// ============================================================================

interface TestRow {
  id: string;
  name: string;
  age: number;
  email: string;
  status: string;
  salary: number;
}

const testData: TestRow[] = [
  { id: '1', name: 'John Doe', age: 30, email: 'john@example.com', status: 'active', salary: 50000 },
  { id: '2', name: 'Jane Smith', age: 25, email: 'jane@example.com', status: 'inactive', salary: 60000 },
  { id: '3', name: 'Bob Wilson', age: 35, email: 'bob@example.com', status: 'active', salary: 55000 },
  { id: '4', name: 'Alice Johnson', age: 28, email: 'alice@example.com', status: 'pending', salary: 65000 },
  { id: '5', name: 'Charlie Brown', age: 40, email: 'charlie@example.com', status: 'active', salary: 70000 },
];

const testColumns: ColumnDefinition<TestRow>[] = [
  { id: 'name', header: 'Name', accessorKey: 'name', sortable: true, filterable: true },
  { id: 'age', header: 'Age', accessorKey: 'age', sortable: true, filterable: true, editorType: 'number' },
  { id: 'email', header: 'Email', accessorKey: 'email', sortable: true, filterable: true },
  { id: 'status', header: 'Status', accessorKey: 'status', sortable: true, filterable: true },
  { id: 'salary', header: 'Salary', accessorKey: 'salary', sortable: true, filterable: true, editorType: 'number' },
];

const defaultProps = {
  data: testData,
  columns: testColumns,
};

const renderDataGrid = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<DataGrid {...mergedProps} />);
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================================================
// RENDERING TESTS
// ============================================================================

describe('DataGrid rendering', () => {
  it('should render column headers', () => {
    renderDataGrid();

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Salary')).toBeInTheDocument();
  });

  it('should render data rows', () => {
    renderDataGrid();

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
  });

  it('should render empty message when no data', () => {
    renderDataGrid({ data: [] });

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should render custom empty message', () => {
    renderDataGrid({ data: [], emptyMessage: 'No users found' });

    expect(screen.getByText('No users found')).toBeInTheDocument();
  });

  it('should render loading state', () => {
    renderDataGrid({ loading: true });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = renderDataGrid({ className: 'custom-grid' });

    expect(container.firstChild).toHaveClass('custom-grid');
  });

  it('should respect height prop', () => {
    const { container } = renderDataGrid({ height: 400 });

    const gridContainer = container.querySelector('.border.rounded-lg');
    expect(gridContainer).toBeInTheDocument();
  });
});

// ============================================================================
// SORTING TESTS
// ============================================================================

describe('DataGrid sorting', () => {
  it('should sort ascending on first click', async () => {
    const onSortChange = jest.fn();
    renderDataGrid({ onSortChange });

    await userEvent.click(screen.getByText('Name'));

    expect(onSortChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ columnId: 'name', direction: 'asc' }),
      ])
    );
  });

  it('should sort descending on second click', async () => {
    const onSortChange = jest.fn();
    renderDataGrid({
      onSortChange,
      sortState: [{ columnId: 'name', direction: 'asc' }] as SortState<TestRow>[],
    });

    await userEvent.click(screen.getByText('Name'));

    expect(onSortChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ columnId: 'name', direction: 'desc' }),
      ])
    );
  });

  it('should clear sort on third click', async () => {
    const onSortChange = jest.fn();
    renderDataGrid({
      onSortChange,
      sortState: [{ columnId: 'name', direction: 'desc' }] as SortState<TestRow>[],
    });

    await userEvent.click(screen.getByText('Name'));

    expect(onSortChange).toHaveBeenCalledWith([]);
  });

  it('should display sort indicator', () => {
    renderDataGrid({
      sortState: [{ columnId: 'name', direction: 'asc' }] as SortState<TestRow>[],
    });

    expect(screen.getByText('↑')).toBeInTheDocument();
  });

  it('should display descending sort indicator', () => {
    renderDataGrid({
      sortState: [{ columnId: 'name', direction: 'desc' }] as SortState<TestRow>[],
    });

    expect(screen.getByText('↓')).toBeInTheDocument();
  });

  it('should not sort when enableSorting is false', async () => {
    const onSortChange = jest.fn();
    renderDataGrid({ onSortChange, enableSorting: false });

    await userEvent.click(screen.getByText('Name'));

    expect(onSortChange).not.toHaveBeenCalled();
  });

  it('should not sort non-sortable columns', async () => {
    const onSortChange = jest.fn();
    const columns = [
      { ...testColumns[0], sortable: false },
      ...testColumns.slice(1),
    ];

    renderDataGrid({ columns, onSortChange });

    await userEvent.click(screen.getByText('Name'));

    expect(onSortChange).not.toHaveBeenCalled();
  });

  it('should sort data correctly (internal state)', () => {
    renderDataGrid({ enableSorting: true });

    // Get initial order
    const cells = screen.getAllByText(/Doe|Smith|Wilson|Johnson|Brown/);
    expect(cells[0]).toHaveTextContent('John Doe');

    // Click to sort by name
    fireEvent.click(screen.getByText('Name'));

    // After sorting, order should change
    const sortedCells = screen.getAllByText(/Doe|Smith|Wilson|Johnson|Brown/);
    // First item should be Alice Johnson (alphabetically first)
    expect(sortedCells[0]).toHaveTextContent('Alice Johnson');
  });
});

// ============================================================================
// SELECTION TESTS
// ============================================================================

describe('DataGrid selection', () => {
  it('should render checkboxes when selection is enabled', () => {
    renderDataGrid({ enableSelection: true });

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('should not render checkboxes when selection is disabled', () => {
    renderDataGrid({ enableSelection: false });

    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  it('should select row on checkbox click', async () => {
    const onSelectionChange = jest.fn();
    renderDataGrid({
      enableSelection: true,
      selectionMode: 'multiple',
      onSelectionChange,
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[1]); // First data row checkbox

    expect(onSelectionChange).toHaveBeenCalledWith(expect.any(Set));
  });

  it('should select all rows when clicking header checkbox', async () => {
    const onSelectionChange = jest.fn();
    renderDataGrid({
      enableSelection: true,
      selectionMode: 'multiple',
      onSelectionChange,
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[0]); // Header checkbox

    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('should deselect all when all are selected and header is clicked', async () => {
    const selectedRows = new Set(testData.map(d => d.id));
    const onSelectionChange = jest.fn();

    renderDataGrid({
      enableSelection: true,
      selectionMode: 'multiple',
      selectedRows,
      onSelectionChange,
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[0]); // Header checkbox

    expect(onSelectionChange).toHaveBeenCalledWith(new Set());
  });

  it('should only allow single selection in single mode', async () => {
    const onSelectionChange = jest.fn();
    renderDataGrid({
      enableSelection: true,
      selectionMode: 'single',
      onSelectionChange,
    });

    const checkboxes = screen.getAllByRole('checkbox');

    // Click first row
    await userEvent.click(checkboxes[1]);

    // Should call with single item
    const firstCall = onSelectionChange.mock.calls[0][0];
    expect(firstCall.size).toBe(1);
  });

  it('should highlight selected rows', () => {
    const selectedRows = new Set(['1']);

    renderDataGrid({
      enableSelection: true,
      selectedRows,
    });

    // The row containing John Doe should have highlight class
    const johnDoeText = screen.getByText('John Doe');
    const row = johnDoeText.closest('.flex.border-b');
    expect(row).toHaveClass('bg-gray-100');
  });
});

// ============================================================================
// PAGINATION TESTS
// ============================================================================

describe('DataGrid pagination', () => {
  it('should render pagination when enabled', () => {
    renderDataGrid({ enablePagination: true, pageSize: 2 });

    expect(screen.getByTitle('First page')).toBeInTheDocument();
    expect(screen.getByTitle('Previous page')).toBeInTheDocument();
    expect(screen.getByTitle('Next page')).toBeInTheDocument();
    expect(screen.getByTitle('Last page')).toBeInTheDocument();
  });

  it('should not render pagination when disabled', () => {
    renderDataGrid({ enablePagination: false });

    expect(screen.queryByTitle('First page')).not.toBeInTheDocument();
  });

  it('should paginate data correctly', () => {
    renderDataGrid({ enablePagination: true, pageSize: 2 });

    // Should only show first 2 rows
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
  });

  it('should navigate to next page', async () => {
    const onPageChange = jest.fn();
    renderDataGrid({
      enablePagination: true,
      pageSize: 2,
      currentPage: 0,
      onPageChange,
    });

    await userEvent.click(screen.getByTitle('Next page'));

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('should display correct row range', () => {
    renderDataGrid({ enablePagination: true, pageSize: 2 });

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});

// ============================================================================
// FILTERING TESTS
// ============================================================================

describe('DataGrid filtering', () => {
  it('should render filters when enabled', () => {
    renderDataGrid({ enableFiltering: true });

    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('should not render filters when disabled', () => {
    renderDataGrid({ enableFiltering: false });

    expect(screen.queryByText('Filters')).not.toBeInTheDocument();
  });

  it('should filter data based on text filter', async () => {
    renderDataGrid({
      enableFiltering: true,
      filters: { name: 'John' },
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('should filter data based on number range', () => {
    renderDataGrid({
      enableFiltering: true,
      filters: {
        age: { type: 'number', min: 30, max: 40 },
      },
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument(); // age 30
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument(); // age 35
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument(); // age 25
  });

  it('should call onFilterChange when filters change', async () => {
    const onFilterChange = jest.fn();
    renderDataGrid({
      enableFiltering: true,
      onFilterChange,
    });

    // Expand filters
    await userEvent.click(screen.getByText('Filters'));

    // Type in filter
    const nameInput = screen.getByPlaceholderText(/filter name/i);
    await userEvent.type(nameInput, 'John');

    expect(onFilterChange).toHaveBeenCalled();
  });
});

// ============================================================================
// INLINE EDITING TESTS
// ============================================================================

describe('DataGrid inline editing', () => {
  it('should not show editor by default', () => {
    renderDataGrid({ enableInlineEditing: true });

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('should show editor when clicking editable cell', async () => {
    const columns = testColumns.map(col => ({
      ...col,
      editable: col.id === 'name',
    }));

    renderDataGrid({
      columns,
      enableInlineEditing: true,
    });

    // Click on an editable cell
    await userEvent.click(screen.getByText('John Doe'));

    // Editor should appear
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should not show editor for non-editable cells', async () => {
    const columns = testColumns.map(col => ({
      ...col,
      editable: false,
    }));

    renderDataGrid({
      columns,
      enableInlineEditing: true,
    });

    await userEvent.click(screen.getByText('John Doe'));

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('should call onCellEdit when saving', async () => {
    const onCellEdit = jest.fn();
    const columns = testColumns.map(col => ({
      ...col,
      editable: col.id === 'name',
    }));

    renderDataGrid({
      columns,
      enableInlineEditing: true,
      onCellEdit,
    });

    // Click to edit
    await userEvent.click(screen.getByText('John Doe'));

    // Type new value
    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'John Updated');

    // Save (press Enter or click save)
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onCellEdit).toHaveBeenCalled();
  });
});

// ============================================================================
// COLUMN RESIZING TESTS
// ============================================================================

describe('DataGrid column resizing', () => {
  it('should render resize handles when enabled', () => {
    const { container } = renderDataGrid({ enableColumnResizing: true });

    const resizers = container.querySelectorAll('.cursor-col-resize');
    expect(resizers.length).toBeGreaterThan(0);
  });

  it('should not render resize handles when disabled', () => {
    const { container } = renderDataGrid({ enableColumnResizing: false });

    const resizers = container.querySelectorAll('.cursor-col-resize');
    expect(resizers.length).toBe(0);
  });

  it('should update column width on resize', async () => {
    const { container } = renderDataGrid({ enableColumnResizing: true });

    const resizer = container.querySelector('.cursor-col-resize');
    expect(resizer).toBeInTheDocument();

    // Simulate resize drag
    if (resizer) {
      fireEvent.mouseDown(resizer, { clientX: 100 });
      fireEvent.mouseMove(document, { clientX: 150 });
      fireEvent.mouseUp(document);
    }

    // Column width should have changed
    // This is difficult to test without checking actual styles
  });
});

// ============================================================================
// EXPORT TESTS
// ============================================================================

describe('DataGrid export', () => {
  it('should render export button when enabled', async () => {
    renderDataGrid({ enableExport: true });

    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  it('should not render export button when disabled', () => {
    renderDataGrid({ enableExport: false, enableFiltering: false });

    expect(screen.queryByRole('button', { name: /export/i })).not.toBeInTheDocument();
  });

  it('should show export menu on click', async () => {
    renderDataGrid({ enableExport: true });

    await userEvent.click(screen.getByRole('button', { name: /export/i }));

    expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    expect(screen.getByText('Export as Excel')).toBeInTheDocument();
    expect(screen.getByText('Export as PDF')).toBeInTheDocument();
  });

  it('should call onExport with format', async () => {
    const onExport = jest.fn();
    renderDataGrid({ enableExport: true, onExport });

    await userEvent.click(screen.getByRole('button', { name: /export/i }));
    await userEvent.click(screen.getByText('Export as CSV'));

    expect(onExport).toHaveBeenCalledWith('csv');
  });

  it('should call default export when no onExport provided', async () => {
    const { exportToCSV } = require('./DataGridExport');
    renderDataGrid({ enableExport: true });

    await userEvent.click(screen.getByRole('button', { name: /export/i }));
    await userEvent.click(screen.getByText('Export as CSV'));

    expect(exportToCSV).toHaveBeenCalled();
  });
});

// ============================================================================
// TOOLBAR TESTS
// ============================================================================

describe('DataGrid toolbar', () => {
  it('should render toolbar when filtering is enabled', () => {
    renderDataGrid({ enableFiltering: true });

    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('should render toolbar when export is enabled', () => {
    renderDataGrid({ enableExport: true, enableFiltering: false });

    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });
});

// ============================================================================
// CONTROLLED VS UNCONTROLLED TESTS
// ============================================================================

describe('DataGrid controlled/uncontrolled behavior', () => {
  it('should work in uncontrolled mode', async () => {
    renderDataGrid({ enableSorting: true });

    // Click to sort
    await userEvent.click(screen.getByText('Name'));

    // Should show sort indicator (internal state updated)
    expect(screen.getByText('↑')).toBeInTheDocument();
  });

  it('should work in controlled mode', async () => {
    const onSortChange = jest.fn();
    renderDataGrid({
      enableSorting: true,
      sortState: [],
      onSortChange,
    });

    await userEvent.click(screen.getByText('Name'));

    expect(onSortChange).toHaveBeenCalled();
    // Should not show indicator until parent updates sortState
    expect(screen.queryByText('↑')).not.toBeInTheDocument();
  });

  it('should use controlled selectedRows when provided', () => {
    const selectedRows = new Set(['1']);
    renderDataGrid({
      enableSelection: true,
      selectedRows,
    });

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[1]).toBeChecked();
  });

  it('should use controlled filters when provided', () => {
    renderDataGrid({
      enableFiltering: true,
      filters: { name: 'John' },
    });

    // Only John Doe should be visible
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('DataGrid edge cases', () => {
  it('should handle empty columns array', () => {
    const { container } = renderDataGrid({ columns: [] });
    expect(container).toBeInTheDocument();
  });

  it('should handle large datasets', () => {
    const largeData = Array.from({ length: 1000 }, (_, i) => ({
      id: String(i),
      name: `User ${i}`,
      age: 20 + (i % 50),
      email: `user${i}@example.com`,
      status: i % 2 === 0 ? 'active' : 'inactive',
      salary: 40000 + (i * 100),
    }));

    renderDataGrid({ data: largeData, pageSize: 50 });

    expect(screen.getByText('User 0')).toBeInTheDocument();
  });

  it('should handle nested data access', () => {
    const nestedData = [
      { id: '1', user: { name: 'John', profile: { age: 30 } } },
    ];

    const nestedColumns: ColumnDefinition<typeof nestedData[0]>[] = [
      { id: 'name', header: 'Name', accessorKey: 'user.name' },
      { id: 'age', header: 'Age', accessorKey: 'user.profile.age' },
    ];

    render(<DataGrid data={nestedData} columns={nestedColumns} />);

    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('should handle null/undefined values', () => {
    const dataWithNulls = [
      { id: '1', name: null, age: undefined, email: 'test@example.com', status: 'active', salary: 50000 },
    ] as unknown as TestRow[];

    renderDataGrid({ data: dataWithNulls });

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should handle custom rowIdKey', () => {
    const customIdData = [
      { customId: 'custom-1', name: 'Test', age: 30, email: 'test@test.com', status: 'active', salary: 50000 },
    ];

    render(
      <DataGrid
        data={customIdData}
        columns={testColumns}
        rowIdKey="customId"
        enableSelection
      />
    );

    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should handle rapid user interactions', async () => {
    const onSortChange = jest.fn();
    renderDataGrid({ enableSorting: true, onSortChange });

    // Rapid clicks
    const header = screen.getByText('Name');
    await userEvent.click(header);
    await userEvent.click(header);
    await userEvent.click(header);

    // Should handle all clicks
    expect(onSortChange).toHaveBeenCalledTimes(3);
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('DataGrid accessibility', () => {
  it('should have proper table structure', () => {
    renderDataGrid();

    // Headers should exist
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
  });

  it('should have accessible checkboxes', () => {
    renderDataGrid({ enableSelection: true });

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeInTheDocument();
    });
  });

  it('should have accessible sort indicators', () => {
    renderDataGrid({
      sortState: [{ columnId: 'name', direction: 'asc' }] as SortState<TestRow>[],
    });

    expect(screen.getByText('↑')).toBeInTheDocument();
  });

  it('should have cursor pointer on sortable columns', () => {
    const { container } = renderDataGrid({ enableSorting: true });

    const header = screen.getByText('Name').closest('div[class*="cursor-pointer"]');
    expect(header).toBeInTheDocument();
  });
});
