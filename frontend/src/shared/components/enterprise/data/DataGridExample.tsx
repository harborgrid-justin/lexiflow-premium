/**
 * @module components/enterprise/data/DataGridExample
 * @category Enterprise
 * @description Example component demonstrating all DataGrid features.
 *
 * This example showcases:
 * - Advanced sorting and filtering
 * - Virtual scrolling for performance
 * - Column resizing
 * - Export to CSV, Excel, and PDF
 * - Enterprise search with fuzzy matching
 * - Row selection
 * - Inline editing
 * - Pagination
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useMemo, useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { DataGrid } from './DataGrid';
import {
  actionColumn,
  booleanColumn,
  createColumns,
  currencyColumn,
  dateColumn,
  numberColumn,
  statusColumn,
  textColumn,
} from './DataGridColumn';
import { DataGridSearch } from './DataGridSearch';

// ============================================================================
// TYPES
// ============================================================================

interface User extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
  age: number;
  salary: number;
  department: string;
  active: boolean;
  joinDate: Date;
  status: 'active' | 'inactive' | 'pending';
}

// ============================================================================
// MOCK DATA
// ============================================================================

function generateMockUsers(count: number): User[] {
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
  const statuses: Array<'active' | 'inactive' | 'pending'> = ['active', 'inactive', 'pending'];
  const users: User[] = [];

  // Note: Math.random() is intentional here for demo data generation (not used in render)
  for (let i = 1; i <= count; i++) {
    users.push({
      id: i,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      age: 20 + Math.floor(Math.random() * 40),
      salary: 40000 + Math.floor(Math.random() * 100000),
      department: departments[Math.floor(Math.random() * departments.length)] || 'Engineering',
      active: Math.random() > 0.3,
      joinDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
      status: statuses[Math.floor(Math.random() * statuses.length)] as 'active' | 'inactive' | 'pending',
    });
  }

  return users;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DataGridExample() {
  // State
  const [allUsers] = useState<User[]>(() => generateMockUsers(1000));
  const [filteredUsers, setFilteredUsers] = useState<User[]>(allUsers);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  // Define columns
  const columns = useMemo(() => createColumns<User>([
    textColumn('name', 'Name', 'name', { width: 200, editable: true }),
    textColumn('email', 'Email', 'email', { width: 250, editable: true }),
    numberColumn('age', 'Age', 'age', { width: 100, editable: true }),
    currencyColumn('salary', 'Salary', 'salary', 'USD', { width: 150 }),
    textColumn('department', 'Department', 'department', { width: 150 }),
    booleanColumn('active', 'Active', 'active', { width: 100, editable: true }),
    dateColumn('joinDate', 'Join Date', 'joinDate', 'short', { width: 150 }),
    statusColumn('status', 'Status', 'status', {
      active: { label: 'Active', color: 'bg-green-100 text-green-800' },
      inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    }, { width: 120 }),
    actionColumn('actions', 'Actions', (row) => (
      <div className="flex gap-2">
        <button
          onClick={() => console.log('Edit', row)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Edit
        </button>
        <button
          onClick={() => console.log('Delete', row)}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Delete
        </button>
      </div>
    ), { width: 150 }),
  ]), []);

  // Handle search
  const handleSearchResults = (results: User[]) => {
    setFilteredUsers(results);
  };

  // Handle cell edit
  const handleCellEdit = (rowId: string | number, columnId: string, value: unknown) => {
    console.log('Cell edited:', { rowId, columnId, value });
    // In a real application, you would update the data here
  };

  return (
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Enterprise DataGrid Demo</h1>
        <p className="text-gray-600">
          Demonstrating advanced features: sorting, filtering, virtual scrolling,
          column resizing, export (CSV/Excel/PDF), fuzzy search, and more.
        </p>
      </div>

      {/* Search */}
      <DataGridSearch
        data={allUsers}
        columns={columns}
        onSearchResults={handleSearchResults}
        placeholder="Search users (try fuzzy matching)..."
        enableHistory
        showAdvancedOptions
      />

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Features Demonstrated:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Virtual scrolling for 1,000 rows</li>
          <li>✓ Multi-column sorting (click headers)</li>
          <li>✓ Advanced filtering (expand filter panel)</li>
          <li>✓ Column resizing (drag column edges)</li>
          <li>✓ Export to CSV, Excel, and PDF</li>
          <li>✓ Enterprise fuzzy search with multiple algorithms</li>
          <li>✓ Row selection (single/multi)</li>
          <li>✓ Inline editing (click cells)</li>
          <li>✓ Pagination with jump-to-page</li>
        </ul>
      </div>

      {/* Selection Info */}
      {selectedRows.size > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            <strong>{selectedRows.size}</strong> row(s) selected.
            You can export only selected rows using the export menu.
          </p>
        </div>
      )}

      {/* DataGrid */}
      <DataGrid
        data={filteredUsers}
        columns={columns}
        rowIdKey="id"
        enableSorting
        enableFiltering
        enableSelection
        enableInlineEditing
        enablePagination
        enableColumnResizing
        enableExport
        selectionMode="multiple"
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onCellEdit={handleCellEdit}
        height={600}
        rowHeight={48}
        pageSize={50}
        emptyMessage="No users found. Try adjusting your search or filters."
      />

      {/* Usage Code Example */}
      <div style={{ backgroundColor: 'var(--color-surfaceHover)', borderColor: 'var(--color-border)' }} className="mt-8 border rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Usage Example:</h3>
        <pre style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }} className="text-xs p-4 rounded overflow-x-auto">
          {`import { DataGrid, createColumns, textColumn, numberColumn } from '@/shared/components/enterprise/data';

const columns = createColumns<User>([
  textColumn('name', 'Name', 'name', { editable: true }),
  numberColumn('age', 'Age', 'age'),
]);

<DataGrid
  data={users}
  columns={columns}
  enableVirtualization
  enableSorting
  enableFiltering
  enableExport
  height={600}
/>`}
        </pre>
      </div>
    </div>
  );
}

DataGridExample.displayName = 'DataGridExample';

export default DataGridExample;
