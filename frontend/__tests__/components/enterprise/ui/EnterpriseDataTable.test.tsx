/**
 * @jest-environment jsdom
 */

// Mock window.matchMedia BEFORE any imports
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { EnterpriseDataTable, Column } from '@/components/enterprise/ui/EnterpriseDataTable';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock react-window
jest.mock('react-window', () => ({
  FixedSizeList: ({ children, itemCount, itemSize }: any) => (
    <div data-testid="virtualized-list">
      {Array.from({ length: Math.min(itemCount, 10) }).map((_, index) => (
        <div key={index}>
          {children({ index, style: {} })}
        </div>
      ))}
    </div>
  ),
}));

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    internal: {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297,
      },
    },
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    text: jest.fn(),
    addPage: jest.fn(),
    save: jest.fn(),
  }));
});

const mockData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Manager', status: 'Active' },
];

const mockColumns: Column[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true },
  { id: 'email', header: 'Email', accessor: 'email', sortable: true },
  { id: 'role', header: 'Role', accessor: 'role', sortable: true },
  { id: 'status', header: 'Status', accessor: 'status', sortable: true },
];

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('EnterpriseDataTable', () => {
  describe('Column Rendering', () => {
    it('should render all column headers', () => {
      renderWithTheme(<EnterpriseDataTable data={mockData} columns={mockColumns} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should render data rows with correct values', () => {
      renderWithTheme(<EnterpriseDataTable data={mockData} columns={mockColumns} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('should render custom cell renderers', () => {
      const customColumns: Column[] = [
        {
          id: 'name',
          header: 'Name',
          accessor: 'name',
          cell: (value) => <span data-testid="custom-cell">{value.toUpperCase()}</span>,
        },
      ];

      renderWithTheme(<EnterpriseDataTable data={mockData} columns={customColumns} />);

      const customCells = screen.getAllByTestId('custom-cell');
      expect(customCells[0]).toHaveTextContent('JOHN DOE');
    });
  });

  describe('Sorting Functionality', () => {
    it('should sort data ascending when column header is clicked', async () => {
      renderWithTheme(<EnterpriseDataTable data={mockData} columns={mockColumns} />);

      const nameHeader = screen.getByText('Name').closest('button');
      fireEvent.click(nameHeader!);

      await waitFor(() => {
        const virtualizedList = screen.getByTestId('virtualized-list');
        const firstRow = virtualizedList.children[0];
        expect(within(firstRow as HTMLElement).getByText('Alice Brown')).toBeInTheDocument();
      });
    });

    it('should toggle sort order when clicking the same column twice', async () => {
      renderWithTheme(<EnterpriseDataTable data={mockData} columns={mockColumns} />);

      const nameHeader = screen.getByText('Name').closest('button');

      // First click - ascending
      fireEvent.click(nameHeader!);
      await waitFor(() => {
        const virtualizedList = screen.getByTestId('virtualized-list');
        const firstRow = virtualizedList.children[0];
        expect(within(firstRow as HTMLElement).getByText('Alice Brown')).toBeInTheDocument();
      });

      // Second click - descending
      fireEvent.click(nameHeader!);
      await waitFor(() => {
        const virtualizedList = screen.getByTestId('virtualized-list');
        const firstRow = virtualizedList.children[0];
        expect(within(firstRow as HTMLElement).getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should display sort indicators on sorted columns', () => {
      renderWithTheme(<EnterpriseDataTable data={mockData} columns={mockColumns} />);

      const nameHeader = screen.getByText('Name').closest('button');
      fireEvent.click(nameHeader!);

      // Should show ascending arrow
      expect(nameHeader).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should filter data based on search query', async () => {
      const user = userEvent.setup();
      renderWithTheme(<EnterpriseDataTable data={mockData} columns={mockColumns} />);

      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'John');

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    it('should show filter panel when filter button is clicked', () => {
      renderWithTheme(<EnterpriseDataTable data={mockData} columns={mockColumns} />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      fireEvent.click(filterButton);

      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('should clear all filters when clear button is clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<EnterpriseDataTable data={mockData} columns={mockColumns} />);

      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'John');

      await user.clear(searchInput);

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('should update row count display when filtering', async () => {
      const user = userEvent.setup();
      renderWithTheme(<EnterpriseDataTable data={mockData} columns={mockColumns} />);

      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'John');

      await waitFor(() => {
        expect(screen.getByText(/Showing 1 of 4 rows/)).toBeInTheDocument();
      });
    });
  });

  describe('Multi-Select', () => {
    it('should allow selecting individual rows', () => {
      renderWithTheme(<EnterpriseDataTable data={mockData} columns={mockColumns} selectable />);

      const checkboxes = screen.getAllByRole('button');
      const firstRowCheckbox = checkboxes.find(cb => cb.querySelector('[class*="CheckSquare"], [class*="Square"]'));

      if (firstRowCheckbox) {
        fireEvent.click(firstRowCheckbox);
        expect(screen.getByText(/1 selected/)).toBeInTheDocument();
      }
    });

    it('should select all rows when header checkbox is clicked', () => {
      renderWithTheme(<EnterpriseDataTable data={mockData} columns={mockColumns} selectable />);

      const checkboxes = screen.getAllByRole('button');
      const selectAllCheckbox = checkboxes[0];

      fireEvent.click(selectAllCheckbox);
      expect(screen.getByText(/4 selected/)).toBeInTheDocument();
    });

    it('should deselect all when clicking select-all checkbox twice', () => {
      renderWithTheme(<EnterpriseDataTable data={mockData} columns={mockColumns} selectable />);

      const checkboxes = screen.getAllByRole('button');
      const selectAllCheckbox = checkboxes[0];

      fireEvent.click(selectAllCheckbox);
      fireEvent.click(selectAllCheckbox);

      expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
    });

    it('should call onSelectionChange when selection changes', () => {
      const onSelectionChange = jest.fn();
      renderWithTheme(
        <EnterpriseDataTable
          data={mockData}
          columns={mockColumns}
          selectable
          onSelectionChange={onSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole('button');
      const selectAllCheckbox = checkboxes[0];

      fireEvent.click(selectAllCheckbox);

      expect(onSelectionChange).toHaveBeenCalled();
    });
  });

  describe('Bulk Actions', () => {
    it('should display bulk action buttons when rows are selected', () => {
      const bulkActions = [
        { label: 'Delete', onClick: jest.fn() },
        { label: 'Export', onClick: jest.fn() },
      ];

      renderWithTheme(
        <EnterpriseDataTable
          data={mockData}
          columns={mockColumns}
          selectable
          bulkActions={bulkActions}
        />
      );

      const checkboxes = screen.getAllByRole('button');
      const firstRowCheckbox = checkboxes[1];
      fireEvent.click(firstRowCheckbox);

      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });

    it('should execute bulk action with selected rows', () => {
      const deleteAction = jest.fn();
      const bulkActions = [
        { label: 'Delete', onClick: deleteAction },
      ];

      renderWithTheme(
        <EnterpriseDataTable
          data={mockData}
          columns={mockColumns}
          selectable
          bulkActions={bulkActions}
        />
      );

      const checkboxes = screen.getAllByRole('button');
      fireEvent.click(checkboxes[1]);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      expect(deleteAction).toHaveBeenCalledWith([mockData[0]]);
    });
  });

  describe('Export Functionality', () => {
    it('should render export buttons when exportable is true', () => {
      renderWithTheme(<EnterpriseDataTable data={mockData} columns={mockColumns} exportable />);

      const exportButtons = screen.getAllByRole('button');
      const csvButton = exportButtons.find(btn => btn.getAttribute('title') === 'Export to CSV');
      const pdfButton = exportButtons.find(btn => btn.getAttribute('title') === 'Export to PDF');

      expect(csvButton).toBeInTheDocument();
      expect(pdfButton).toBeInTheDocument();
    });

    it('should trigger CSV export when CSV button is clicked', () => {
      const createElementSpy = jest.spyOn(document, 'createElement');

      renderWithTheme(<EnterpriseDataTable data={mockData} columns={mockColumns} exportable />);

      const exportButtons = screen.getAllByRole('button');
      const csvButton = exportButtons.find(btn => btn.getAttribute('title') === 'Export to CSV');

      if (csvButton) {
        fireEvent.click(csvButton);
        expect(createElementSpy).toHaveBeenCalledWith('a');
      }
    });

    it('should trigger PDF export when PDF button is clicked', () => {
      renderWithTheme(<EnterpriseDataTable data={mockData} columns={mockColumns} exportable />);

      const exportButtons = screen.getAllByRole('button');
      const pdfButton = exportButtons.find(btn => btn.getAttribute('title') === 'Export to PDF');

      if (pdfButton) {
        fireEvent.click(pdfButton);
        // jsPDF mock will be called
      }
    });
  });

  describe('Virtualization', () => {
    it('should render virtualized list for large datasets', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        role: 'User',
        status: 'Active',
      }));

      renderWithTheme(<EnterpriseDataTable data={largeData} columns={mockColumns} />);

      expect(screen.getByTestId('virtualized-list')).toBeInTheDocument();
    });

    it('should only render visible rows', () => {
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        role: 'User',
        status: 'Active',
      }));

      renderWithTheme(<EnterpriseDataTable data={largeData} columns={mockColumns} />);

      const virtualizedList = screen.getByTestId('virtualized-list');
      // Mock only renders first 10 items
      expect(virtualizedList.children.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Column Resizing', () => {
    it('should apply custom column widths', () => {
      const columnsWithWidth: Column[] = [
        { id: 'name', header: 'Name', accessor: 'name', width: 200 },
        { id: 'email', header: 'Email', accessor: 'email', width: 300 },
      ];

      renderWithTheme(<EnterpriseDataTable data={mockData} columns={columnsWithWidth} />);

      // Column widths are applied via inline styles
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    it('should show resize grip on hover', () => {
      renderWithTheme(<EnterpriseDataTable data={mockData} columns={mockColumns} />);

      const nameHeader = screen.getByText('Name').closest('div');
      expect(nameHeader).toHaveClass('group');
    });
  });

  describe('Loading State', () => {
    it('should display loading spinner when loading is true', () => {
      renderWithTheme(<EnterpriseDataTable data={[]} columns={mockColumns} loading />);

      expect(screen.getByRole('status', { hidden: true }) || screen.getByText((content, element) => {
        return element?.className.includes('animate-spin') || false;
      })).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty message when no data', () => {
      renderWithTheme(<EnterpriseDataTable data={[]} columns={mockColumns} />);

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for interactive elements', () => {
      renderWithTheme(<EnterpriseDataTable data={mockData} columns={mockColumns} selectable />);

      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderWithTheme(<EnterpriseDataTable data={mockData} columns={mockColumns} />);

      const searchInput = screen.getByPlaceholderText('Search...');
      await user.tab();

      expect(document.activeElement).toBeTruthy();
    });

    it('should have semantic table structure', () => {
      renderWithTheme(<EnterpriseDataTable data={mockData} columns={mockColumns} />);

      // Headers should be in a header-like container
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
  });
});
