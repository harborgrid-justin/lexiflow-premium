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
import { useEffect, useMemo, useState } from 'react';

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
// PROPS
// ============================================================================

export interface DataGridExampleProps {
  users?: User[];
  onLoadUsers?: () => Promise<User[]>;
  onEditUser?: (user: User) => void;
  onDeleteUser?: (user: User) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DataGridExample({
  users = [],
  onLoadUsers,
  onEditUser,
  onDeleteUser,
}: DataGridExampleProps) {
  // State
  const [allUsers, setAllUsers] = useState<User[]>(users);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  useEffect(() => {
    setAllUsers(users);
    setFilteredUsers(users);
  }, [users]);

  useEffect(() => {
    if (!onLoadUsers) return;
    let cancelled = false;

    const loadUsers = async () => {
      const loadedUsers = await onLoadUsers();
      if (!cancelled) {
        setAllUsers(loadedUsers);
        setFilteredUsers(loadedUsers);
      }
    };

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, [onLoadUsers]);

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
          onClick={() => {
            onEditUser?.(row);
          }}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Edit
        </button>
        <button
          onClick={() => {
            setAllUsers((prev) => prev.filter((user) => user.id !== row.id));
            setFilteredUsers((prev) => prev.filter((user) => user.id !== row.id));
            setSelectedRows((prev) => {
              const next = new Set(prev);
              next.delete(row.id);
              return next;
            });
            onDeleteUser?.(row);
          }}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Delete
        </button>
      </div>
    ), { width: 150 }),
  ]), [onEditUser, onDeleteUser, setAllUsers, setFilteredUsers, setSelectedRows]);

  // Handle search
  const handleSearchResults = (results: User[]) => {
    setFilteredUsers(results);
  };

  // Handle cell edit
  const handleCellEdit = (rowId: string | number, columnId: string, value: unknown) => {
    setAllUsers((prev) =>
      prev.map((user) => (user.id === rowId ? { ...user, [columnId]: value } as User : user))
    );
    setFilteredUsers((prev) =>
      prev.map((user) => (user.id === rowId ? { ...user, [columnId]: value } as User : user))
    );

    const updatedUser = allUsers.find((user) => user.id === rowId);
    if (updatedUser) {
      onEditUser?.({ ...updatedUser, [columnId]: value } as User);
    }
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
          {`import { DataGrid, createColumns, textColumn, numberColumn } from '@/components/enterprise/data';

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
