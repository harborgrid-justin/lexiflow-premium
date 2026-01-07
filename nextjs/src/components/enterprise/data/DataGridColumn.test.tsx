/**
 * @module components/enterprise/data/DataGridColumn.test
 * @description Unit tests for DataGridColumn helper functions and column presets.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  createColumn,
  createColumns,
  textColumn,
  numberColumn,
  currencyColumn,
  dateColumn,
  booleanColumn,
  statusColumn,
  selectColumn,
  actionColumn,
  indexColumn,
  validateColumns,
  isEditableColumn,
  isSortableColumn,
  isFilterableColumn,
  type ColumnDefinition,
  type EditorOption,
} from './DataGridColumn';

// ============================================================================
// TEST SETUP
// ============================================================================

interface TestRow {
  id: string;
  name: string;
  age: number;
  salary: number;
  hireDate: string;
  isActive: boolean;
  status: string;
  department: string;
}

const mockRow: TestRow = {
  id: '1',
  name: 'John Doe',
  age: 30,
  salary: 75000,
  hireDate: '2023-01-15',
  isActive: true,
  status: 'active',
  department: 'engineering',
};

// ============================================================================
// createColumn TESTS
// ============================================================================

describe('createColumn', () => {
  it('should create a column with default values', () => {
    const column = createColumn<TestRow>({
      id: 'name',
      header: 'Name',
    });

    expect(column.id).toBe('name');
    expect(column.header).toBe('Name');
    expect(column.sortable).toBe(true);
    expect(column.filterable).toBe(true);
    expect(column.editable).toBe(false);
    expect(column.align).toBe('left');
    expect(column.width).toBe(150);
  });

  it('should allow overriding default values', () => {
    const column = createColumn<TestRow>({
      id: 'custom',
      header: 'Custom Column',
      sortable: false,
      filterable: false,
      editable: true,
      align: 'center',
      width: 200,
    });

    expect(column.sortable).toBe(false);
    expect(column.filterable).toBe(false);
    expect(column.editable).toBe(true);
    expect(column.align).toBe('center');
    expect(column.width).toBe(200);
  });

  it('should preserve custom cell renderer', () => {
    const customCell = jest.fn(() => <span>Custom</span>);
    const column = createColumn<TestRow>({
      id: 'custom',
      header: 'Custom',
      cell: customCell,
    });

    expect(column.cell).toBe(customCell);
  });

  it('should preserve accessorKey', () => {
    const column = createColumn<TestRow>({
      id: 'fullName',
      header: 'Full Name',
      accessorKey: 'name',
    });

    expect(column.accessorKey).toBe('name');
  });
});

// ============================================================================
// createColumns TESTS
// ============================================================================

describe('createColumns', () => {
  it('should create multiple columns with defaults', () => {
    const columns = createColumns<TestRow>([
      { id: 'name', header: 'Name' },
      { id: 'age', header: 'Age' },
    ]);

    expect(columns).toHaveLength(2);
    expect(columns[0].sortable).toBe(true);
    expect(columns[1].sortable).toBe(true);
  });

  it('should preserve individual column settings', () => {
    const columns = createColumns<TestRow>([
      { id: 'name', header: 'Name', sortable: false },
      { id: 'age', header: 'Age', filterable: false },
    ]);

    expect(columns[0].sortable).toBe(false);
    expect(columns[0].filterable).toBe(true);
    expect(columns[1].sortable).toBe(true);
    expect(columns[1].filterable).toBe(false);
  });
});

// ============================================================================
// textColumn TESTS
// ============================================================================

describe('textColumn', () => {
  it('should create a text column with defaults', () => {
    const column = textColumn<TestRow>('name', 'Name');

    expect(column.id).toBe('name');
    expect(column.header).toBe('Name');
    expect(column.accessorKey).toBe('name');
    expect(column.editorType).toBe('text');
  });

  it('should use custom accessorKey when provided', () => {
    const column = textColumn<TestRow>('fullName', 'Full Name', 'name');

    expect(column.id).toBe('fullName');
    expect(column.accessorKey).toBe('name');
  });

  it('should merge additional options', () => {
    const column = textColumn<TestRow>('name', 'Name', undefined, {
      width: 300,
      sortable: false,
    });

    expect(column.width).toBe(300);
    expect(column.sortable).toBe(false);
  });
});

// ============================================================================
// numberColumn TESTS
// ============================================================================

describe('numberColumn', () => {
  it('should create a number column with right alignment', () => {
    const column = numberColumn<TestRow>('age', 'Age');

    expect(column.id).toBe('age');
    expect(column.align).toBe('right');
    expect(column.editorType).toBe('number');
  });

  it('should format numbers with locale formatting', () => {
    const column = numberColumn<TestRow>('count', 'Count');
    const cell = column.cell!;

    const result = cell({ value: 1234567, row: mockRow });
    expect(result).toBe('1,234,567');
  });

  it('should handle null values', () => {
    const column = numberColumn<TestRow>('count', 'Count');
    const cell = column.cell!;

    expect(cell({ value: null, row: mockRow })).toBe('');
    expect(cell({ value: undefined, row: mockRow })).toBe('');
  });

  it('should convert non-number values to string', () => {
    const column = numberColumn<TestRow>('count', 'Count');
    const cell = column.cell!;

    expect(cell({ value: 'test', row: mockRow })).toBe('test');
  });
});

// ============================================================================
// currencyColumn TESTS
// ============================================================================

describe('currencyColumn', () => {
  it('should format value as USD currency by default', () => {
    const column = currencyColumn<TestRow>('salary', 'Salary');
    const cell = column.cell!;

    const result = cell({ value: 75000, row: mockRow });
    expect(result).toBe('$75,000.00');
  });

  it('should support different currencies', () => {
    const column = currencyColumn<TestRow>('salary', 'Salary', undefined, 'EUR');
    const cell = column.cell!;

    const result = cell({ value: 1000, row: mockRow });
    expect(result).toContain('1,000.00');
  });

  it('should handle null values', () => {
    const column = currencyColumn<TestRow>('salary', 'Salary');
    const cell = column.cell!;

    expect(cell({ value: null, row: mockRow })).toBe('');
  });

  it('should parse string values', () => {
    const column = currencyColumn<TestRow>('salary', 'Salary');
    const cell = column.cell!;

    const result = cell({ value: '50000', row: mockRow });
    expect(result).toBe('$50,000.00');
  });
});

// ============================================================================
// dateColumn TESTS
// ============================================================================

describe('dateColumn', () => {
  it('should format date in short format by default', () => {
    const column = dateColumn<TestRow>('hireDate', 'Hire Date');
    const cell = column.cell!;

    const result = cell({ value: '2023-01-15', row: mockRow });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should format date in long format', () => {
    const column = dateColumn<TestRow>('hireDate', 'Hire Date', undefined, 'long');
    const cell = column.cell!;

    const result = cell({ value: '2023-01-15', row: mockRow });
    expect(result).toContain('January');
    expect(result).toContain('15');
    expect(result).toContain('2023');
  });

  it('should format date in full format with time', () => {
    const column = dateColumn<TestRow>('hireDate', 'Hire Date', undefined, 'full');
    const cell = column.cell!;

    const result = cell({ value: '2023-01-15T10:30:00', row: mockRow });
    expect(result).toBeTruthy();
  });

  it('should handle empty values', () => {
    const column = dateColumn<TestRow>('hireDate', 'Hire Date');
    const cell = column.cell!;

    expect(cell({ value: '', row: mockRow })).toBe('');
    expect(cell({ value: null, row: mockRow })).toBe('');
  });

  it('should handle Date objects', () => {
    const column = dateColumn<TestRow>('hireDate', 'Hire Date');
    const cell = column.cell!;

    const date = new Date('2023-01-15');
    const result = cell({ value: date, row: mockRow });
    expect(result).toBeTruthy();
  });
});

// ============================================================================
// booleanColumn TESTS
// ============================================================================

describe('booleanColumn', () => {
  it('should render a checkbox for boolean values', () => {
    const column = booleanColumn<TestRow>('isActive', 'Active');
    const cell = column.cell!;

    const { container } = render(cell({ value: true, row: mockRow }) as React.ReactElement);
    const checkbox = container.querySelector('input[type="checkbox"]');

    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();
  });

  it('should render unchecked for false values', () => {
    const column = booleanColumn<TestRow>('isActive', 'Active');
    const cell = column.cell!;

    const { container } = render(cell({ value: false, row: mockRow }) as React.ReactElement);
    const checkbox = container.querySelector('input[type="checkbox"]');

    expect(checkbox).not.toBeChecked();
  });

  it('should be center aligned', () => {
    const column = booleanColumn<TestRow>('isActive', 'Active');
    expect(column.align).toBe('center');
  });

  it('should have checkbox editor type', () => {
    const column = booleanColumn<TestRow>('isActive', 'Active');
    expect(column.editorType).toBe('checkbox');
  });
});

// ============================================================================
// statusColumn TESTS
// ============================================================================

describe('statusColumn', () => {
  it('should render status badge with default config', () => {
    const column = statusColumn<TestRow>('status', 'Status');
    const cell = column.cell!;

    const { container } = render(cell({ value: 'active', row: mockRow }) as React.ReactElement);
    expect(container.textContent).toBe('Active');
    expect(container.querySelector('span')).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('should render pending status', () => {
    const column = statusColumn<TestRow>('status', 'Status');
    const cell = column.cell!;

    const { container } = render(cell({ value: 'pending', row: mockRow }) as React.ReactElement);
    expect(container.textContent).toBe('Pending');
    expect(container.querySelector('span')).toHaveClass('bg-yellow-100');
  });

  it('should render error status', () => {
    const column = statusColumn<TestRow>('status', 'Status');
    const cell = column.cell!;

    const { container } = render(cell({ value: 'error', row: mockRow }) as React.ReactElement);
    expect(container.textContent).toBe('Error');
    expect(container.querySelector('span')).toHaveClass('bg-red-100');
  });

  it('should handle custom status config', () => {
    const customConfig = {
      approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800' },
      rejected: { label: 'Rejected', color: 'bg-pink-100 text-pink-800' },
    };

    const column = statusColumn<TestRow>('status', 'Status', undefined, customConfig);
    const cell = column.cell!;

    const { container } = render(cell({ value: 'approved', row: mockRow }) as React.ReactElement);
    expect(container.textContent).toBe('Approved');
    expect(container.querySelector('span')).toHaveClass('bg-blue-100');
  });

  it('should handle unknown status with default styling', () => {
    const column = statusColumn<TestRow>('status', 'Status');
    const cell = column.cell!;

    const { container } = render(cell({ value: 'unknown', row: mockRow }) as React.ReactElement);
    expect(container.textContent).toBe('unknown');
    expect(container.querySelector('span')).toHaveClass('bg-gray-100');
  });

  it('should generate editor options from config', () => {
    const column = statusColumn<TestRow>('status', 'Status');

    expect(column.editorOptions).toEqual([
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Pending', value: 'pending' },
      { label: 'Error', value: 'error' },
    ]);
  });
});

// ============================================================================
// selectColumn TESTS
// ============================================================================

describe('selectColumn', () => {
  const departmentOptions: EditorOption[] = [
    { label: 'Engineering', value: 'engineering' },
    { label: 'Sales', value: 'sales' },
    { label: 'Marketing', value: 'marketing' },
  ];

  it('should render selected option label', () => {
    const column = selectColumn<TestRow>('department', 'Department', departmentOptions);
    const cell = column.cell!;

    const result = cell({ value: 'engineering', row: mockRow });
    expect(result).toBe('Engineering');
  });

  it('should fallback to value if option not found', () => {
    const column = selectColumn<TestRow>('department', 'Department', departmentOptions);
    const cell = column.cell!;

    const result = cell({ value: 'unknown', row: mockRow });
    expect(result).toBe('unknown');
  });

  it('should have select editor type', () => {
    const column = selectColumn<TestRow>('department', 'Department', departmentOptions);
    expect(column.editorType).toBe('select');
    expect(column.editorOptions).toEqual(departmentOptions);
  });
});

// ============================================================================
// actionColumn TESTS
// ============================================================================

describe('actionColumn', () => {
  it('should render custom action content', () => {
    const renderAction = (row: TestRow) => (
      <button data-testid="edit-btn">Edit {row.name}</button>
    );

    const column = actionColumn<TestRow>('actions', 'Actions', renderAction);
    const cell = column.cell!;

    render(cell({ value: undefined, row: mockRow }) as React.ReactElement);
    expect(screen.getByTestId('edit-btn')).toHaveTextContent('Edit John Doe');
  });

  it('should not be sortable or filterable', () => {
    const column = actionColumn<TestRow>('actions', 'Actions', () => null);

    expect(column.sortable).toBe(false);
    expect(column.filterable).toBe(false);
    expect(column.editable).toBe(false);
  });

  it('should be center aligned by default', () => {
    const column = actionColumn<TestRow>('actions', 'Actions', () => null);
    expect(column.align).toBe('center');
  });

  it('should have default width of 100', () => {
    const column = actionColumn<TestRow>('actions', 'Actions', () => null);
    expect(column.width).toBe(100);
  });
});

// ============================================================================
// indexColumn TESTS
// ============================================================================

describe('indexColumn', () => {
  it('should use default header', () => {
    const column = indexColumn<TestRow>();
    expect(column.header).toBe('#');
  });

  it('should use custom header', () => {
    const column = indexColumn<TestRow>('Row');
    expect(column.header).toBe('Row');
  });

  it('should have special id', () => {
    const column = indexColumn<TestRow>();
    expect(column.id).toBe('__index__');
  });

  it('should not be sortable or filterable', () => {
    const column = indexColumn<TestRow>();
    expect(column.sortable).toBe(false);
    expect(column.filterable).toBe(false);
    expect(column.editable).toBe(false);
  });
});

// ============================================================================
// validateColumns TESTS
// ============================================================================

describe('validateColumns', () => {
  it('should return valid for correct columns', () => {
    const columns: ColumnDefinition<TestRow>[] = [
      { id: 'name', header: 'Name' },
      { id: 'age', header: 'Age' },
    ];

    const result = validateColumns(columns);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect duplicate IDs', () => {
    const columns: ColumnDefinition<TestRow>[] = [
      { id: 'name', header: 'Name' },
      { id: 'name', header: 'Full Name' },
    ];

    const result = validateColumns(columns);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Duplicate column IDs found: name');
  });

  it('should detect missing id field', () => {
    const columns = [
      { id: '', header: 'Name' },
    ] as ColumnDefinition<TestRow>[];

    const result = validateColumns(columns);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('missing required \'id\' field'))).toBe(true);
  });

  it('should detect missing header field', () => {
    const columns = [
      { id: 'name', header: '' },
    ] as ColumnDefinition<TestRow>[];

    const result = validateColumns(columns);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('missing required \'header\' field'))).toBe(true);
  });
});

// ============================================================================
// TYPE GUARD TESTS
// ============================================================================

describe('isEditableColumn', () => {
  it('should return true for editable columns', () => {
    const column = createColumn<TestRow>({
      id: 'name',
      header: 'Name',
      editable: true,
    });

    expect(isEditableColumn(column)).toBe(true);
  });

  it('should return false for non-editable columns', () => {
    const column = createColumn<TestRow>({
      id: 'name',
      header: 'Name',
    });

    expect(isEditableColumn(column)).toBe(false);
  });
});

describe('isSortableColumn', () => {
  it('should return true for sortable columns', () => {
    const column = createColumn<TestRow>({
      id: 'name',
      header: 'Name',
    });

    expect(isSortableColumn(column)).toBe(true);
  });

  it('should return false when sortable is explicitly false', () => {
    const column = createColumn<TestRow>({
      id: 'name',
      header: 'Name',
      sortable: false,
    });

    expect(isSortableColumn(column)).toBe(false);
  });
});

describe('isFilterableColumn', () => {
  it('should return true for filterable columns', () => {
    const column = createColumn<TestRow>({
      id: 'name',
      header: 'Name',
    });

    expect(isFilterableColumn(column)).toBe(true);
  });

  it('should return false when filterable is explicitly false', () => {
    const column = createColumn<TestRow>({
      id: 'name',
      header: 'Name',
      filterable: false,
    });

    expect(isFilterableColumn(column)).toBe(false);
  });
});
