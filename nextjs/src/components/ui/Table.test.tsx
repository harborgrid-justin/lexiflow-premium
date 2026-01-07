import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Table } from './Table';

interface TestRow {
  id: string;
  name: string;
  email: string;
  status: string;
}

describe('Table', () => {
  const defaultColumns = [
    { header: 'Name', accessor: 'name' as keyof TestRow },
    { header: 'Email', accessor: 'email' as keyof TestRow },
    { header: 'Status', accessor: 'status' as keyof TestRow },
  ];

  const defaultData: TestRow[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'Active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com', status: 'Active' },
  ];

  describe('Rendering', () => {
    it('renders with required props', () => {
      render(<Table columns={defaultColumns} data={defaultData} />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders column headers', () => {
      render(<Table columns={defaultColumns} data={defaultData} />);
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('renders data rows', () => {
      render(<Table columns={defaultColumns} data={defaultData} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('renders correct number of rows', () => {
      render(<Table columns={defaultColumns} data={defaultData} />);
      const rows = screen.getAllByRole('row');
      // 1 header row + 3 data rows
      expect(rows).toHaveLength(4);
    });
  });

  describe('Empty State', () => {
    it('shows empty message when data is empty', () => {
      render(<Table columns={defaultColumns} data={[]} />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('shows custom empty message', () => {
      render(
        <Table
          columns={defaultColumns}
          data={[]}
          emptyMessage="No users found"
        />
      );
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });

    it('empty message spans all columns', () => {
      render(<Table columns={defaultColumns} data={[]} />);
      const emptyCell = screen.getByText('No data available').closest('td');
      expect(emptyCell).toHaveAttribute('colspan', '3');
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator when isLoading is true', () => {
      const { container } = render(
        <Table columns={defaultColumns} data={defaultData} isLoading />
      );
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('does not show data when loading', () => {
      render(<Table columns={defaultColumns} data={defaultData} isLoading />);
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('loading indicator spans all columns', () => {
      const { container } = render(
        <Table columns={defaultColumns} data={defaultData} isLoading />
      );
      const loadingCell = container.querySelector('.animate-spin')?.closest('td');
      expect(loadingCell).toHaveAttribute('colspan', '3');
    });
  });

  describe('Sorting', () => {
    it('renders sort button for sortable columns', () => {
      const sortableColumns = [
        { header: 'Name', accessor: 'name' as keyof TestRow, sortable: true },
        { header: 'Email', accessor: 'email' as keyof TestRow },
      ];
      const handleSort = jest.fn();

      render(
        <Table
          columns={sortableColumns}
          data={defaultData}
          onSort={handleSort}
        />
      );

      const sortButton = screen.getAllByRole('button')[0];
      expect(sortButton).toBeInTheDocument();
    });

    it('calls onSort when sort button clicked', () => {
      const sortableColumns = [
        { header: 'Name', accessor: 'name' as keyof TestRow, sortable: true },
      ];
      const handleSort = jest.fn();

      render(
        <Table
          columns={sortableColumns}
          data={defaultData}
          onSort={handleSort}
        />
      );

      fireEvent.click(screen.getByRole('button'));
      expect(handleSort).toHaveBeenCalledWith('Name', 'asc');
    });

    it('toggles sort order on subsequent clicks', () => {
      const sortableColumns = [
        { header: 'Name', accessor: 'name' as keyof TestRow, sortable: true },
      ];
      const handleSort = jest.fn();

      render(
        <Table
          columns={sortableColumns}
          data={defaultData}
          sortBy="Name"
          sortOrder="asc"
          onSort={handleSort}
        />
      );

      fireEvent.click(screen.getByRole('button'));
      expect(handleSort).toHaveBeenCalledWith('Name', 'desc');
    });

    it('shows active sort indicator', () => {
      const sortableColumns = [
        { header: 'Name', accessor: 'name' as keyof TestRow, sortable: true },
      ];

      const { container } = render(
        <Table
          columns={sortableColumns}
          data={defaultData}
          sortBy="Name"
          sortOrder="asc"
          onSort={jest.fn()}
        />
      );

      const activeIcon = container.querySelector('.text-blue-600');
      expect(activeIcon).toBeInTheDocument();
    });
  });

  describe('Column Accessor', () => {
    it('supports string accessor', () => {
      render(<Table columns={defaultColumns} data={defaultData} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('supports function accessor', () => {
      const columnsWithFunctionAccessor = [
        {
          header: 'Full Info',
          accessor: (row: TestRow) => `${row.name} (${row.email})`,
        },
      ];

      render(<Table columns={columnsWithFunctionAccessor} data={defaultData} />);
      expect(screen.getByText('John Doe (john@example.com)')).toBeInTheDocument();
    });

    it('supports ReactNode from function accessor', () => {
      const columnsWithReactNode = [
        {
          header: 'Status Badge',
          accessor: (row: TestRow) => (
            <span data-testid={`status-${row.id}`}>{row.status}</span>
          ),
        },
      ];

      render(<Table columns={columnsWithReactNode} data={defaultData} />);
      expect(screen.getByTestId('status-1')).toBeInTheDocument();
    });
  });

  describe('Column Width', () => {
    it('applies column width when specified', () => {
      const columnsWithWidth = [
        { header: 'Name', accessor: 'name' as keyof TestRow, width: 'w-1/2' },
        { header: 'Email', accessor: 'email' as keyof TestRow },
      ];

      const { container } = render(
        <Table columns={columnsWithWidth} data={defaultData} />
      );

      const headerCell = container.querySelector('th.w-1\\/2');
      expect(headerCell).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('has proper table structure', () => {
      render(<Table columns={defaultColumns} data={defaultData} />);
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(document.querySelector('thead')).toBeInTheDocument();
      expect(document.querySelector('tbody')).toBeInTheDocument();
    });

    it('has border and rounded corners', () => {
      const { container } = render(
        <Table columns={defaultColumns} data={defaultData} />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('rounded-lg', 'border');
    });

    it('rows have alternating background colors', () => {
      render(<Table columns={defaultColumns} data={defaultData} />);
      const rows = screen.getAllByRole('row').slice(1); // Skip header
      expect(rows[0]).toHaveClass('bg-white');
      expect(rows[1]).toHaveClass('bg-slate-50/50');
    });

    it('rows have hover effect', () => {
      render(<Table columns={defaultColumns} data={defaultData} />);
      const rows = screen.getAllByRole('row').slice(1);
      expect(rows[0]).toHaveClass('hover:bg-slate-50');
    });
  });

  describe('Edge Cases', () => {
    it('handles single row', () => {
      const singleRowData = [defaultData[0]];
      render(<Table columns={defaultColumns} data={singleRowData} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('handles single column', () => {
      const singleColumn = [{ header: 'Name', accessor: 'name' as keyof TestRow }];
      render(<Table columns={singleColumn} data={defaultData} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('john@example.com')).not.toBeInTheDocument();
    });

    it('handles special characters in data', () => {
      const specialData: TestRow[] = [
        { id: '1', name: '<John> & "Doe"', email: 'john@example.com', status: 'Active' },
      ];
      render(<Table columns={defaultColumns} data={specialData} />);
      expect(screen.getByText('<John> & "Doe"')).toBeInTheDocument();
    });

    it('handles null/undefined values gracefully', () => {
      const dataWithNull = [
        { id: '1', name: 'John', email: null as unknown as string, status: 'Active' },
      ];
      render(<Table columns={defaultColumns} data={dataWithNull} />);
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    it('handles many rows', () => {
      const manyRows: TestRow[] = Array.from({ length: 100 }, (_, i) => ({
        id: String(i),
        name: `User ${i}`,
        email: `user${i}@example.com`,
        status: 'Active',
      }));
      render(<Table columns={defaultColumns} data={manyRows} />);
      expect(screen.getByText('User 0')).toBeInTheDocument();
      expect(screen.getByText('User 99')).toBeInTheDocument();
    });

    it('handles many columns', () => {
      const manyColumns = Array.from({ length: 10 }, (_, i) => ({
        header: `Column ${i}`,
        accessor: 'name' as keyof TestRow,
      }));
      render(<Table columns={manyColumns} data={defaultData} />);
      expect(screen.getByText('Column 0')).toBeInTheDocument();
      expect(screen.getByText('Column 9')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper table role', () => {
      render(<Table columns={defaultColumns} data={defaultData} />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('column headers use th elements', () => {
      render(<Table columns={defaultColumns} data={defaultData} />);
      const headers = document.querySelectorAll('th');
      expect(headers).toHaveLength(3);
    });

    it('data cells use td elements', () => {
      render(<Table columns={defaultColumns} data={defaultData} />);
      const cells = document.querySelectorAll('td');
      expect(cells).toHaveLength(9); // 3 columns * 3 rows
    });

    it('sort buttons are keyboard accessible', () => {
      const sortableColumns = [
        { header: 'Name', accessor: 'name' as keyof TestRow, sortable: true },
      ];
      const handleSort = jest.fn();

      render(
        <Table
          columns={sortableColumns}
          data={defaultData}
          onSort={handleSort}
        />
      );

      const sortButton = screen.getByRole('button');
      sortButton.focus();
      expect(sortButton).toHaveFocus();
    });
  });

  describe('Responsive', () => {
    it('has horizontal scroll wrapper', () => {
      const { container } = render(
        <Table columns={defaultColumns} data={defaultData} />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('overflow-x-auto');
    });
  });
});
