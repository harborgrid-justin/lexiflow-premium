/**
 * Enterprise Case List Component
 *
 * Advanced case management interface with:
 * - Multi-column filtering and saved filter views
 * - Bulk operations (status updates, assignments, exports)
 * - Advanced search across case fields
 * - Customizable column display
 * - Sorting and pagination
 * - Quick actions menu
 *
 * @module components/enterprise/CaseManagement/EnterpriseCaseList
 */

import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/shared/lib/utils';
import { Case, CaseStatus } from '@/types';
import {
  Archive,
  Download,
  Edit,
  Filter,
  MoreVertical,
  Save,
  Search,
  Settings,
  Trash2,
  Upload,
  UserPlus
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface FilterCriteria {
  status?: CaseStatus[];
  practiceArea?: string[];
  assignedTo?: string[];
  client?: string[];
  dateRange?: { start: string; end: string };
  budgetRange?: { min: number; max: number };
  searchQuery?: string;
}

export interface SavedView {
  id: string;
  name: string;
  filters: FilterCriteria;
  columns: ColumnConfig[];
  sortBy?: { field: string; direction: 'asc' | 'desc' };
  isDefault?: boolean;
}

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  width?: number;
}

export interface BulkOperation {
  type: 'status' | 'assign' | 'archive' | 'delete' | 'export' | 'tag';
  label: string;
  icon: React.ElementType;
  action: (caseIds: string[]) => void;
  requiresConfirmation?: boolean;
}

export interface EnterpriseCaseListProps {
  cases: Case[];
  onCaseSelect?: (caseId: string) => void;
  onBulkOperation?: (operation: string, caseIds: string[]) => void;
  onFilterChange?: (filters: FilterCriteria) => void;
  savedViews?: SavedView[];
  onSaveView?: (view: SavedView) => void;
  className?: string;
}

// ============================================================================
// Default Configurations
// ============================================================================

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'caseNumber', label: 'Case Number', visible: true, width: 150 },
  { id: 'title', label: 'Title', visible: true, width: 300 },
  { id: 'client', label: 'Client', visible: true, width: 200 },
  { id: 'status', label: 'Status', visible: true, width: 120 },
  { id: 'practiceArea', label: 'Practice Area', visible: true, width: 150 },
  { id: 'leadAttorney', label: 'Lead Attorney', visible: false, width: 180 },
  { id: 'filingDate', label: 'Filing Date', visible: true, width: 120 },
  { id: 'trialDate', label: 'Trial Date', visible: false, width: 120 },
  { id: 'budget', label: 'Budget', visible: true, width: 120 },
  { id: 'actions', label: 'Actions', visible: true, width: 100 },
];

const STATUS_COLORS: Record<CaseStatus, string> = {
  [CaseStatus.Open]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  [CaseStatus.Active]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  [CaseStatus.PreFiling]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  [CaseStatus.OnHold]: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  [CaseStatus.Closed]: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
  [CaseStatus.Archived]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  [CaseStatus.Discovery]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  [CaseStatus.Trial]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  [CaseStatus.Settled]: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  [CaseStatus.Appeal]: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  [CaseStatus.Transferred]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
};

// ============================================================================
// Component
// ============================================================================

export const EnterpriseCaseList: React.FC<EnterpriseCaseListProps> = ({
  cases,
  onCaseSelect,
  onBulkOperation,
  onFilterChange,
  savedViews = [],
  onSaveView,
  className,
}) => {
  const { theme } = useTheme();
  // State Management
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<SavedView | null>(null);
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);

  // Filtered & Sorted Cases
  const filteredCases = useMemo(() => {
    let result = [...cases];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.title?.toLowerCase().includes(query) ||
        c.caseNumber?.toLowerCase().includes(query) ||
        c.client?.toLowerCase().includes(query) ||
        c.practiceArea?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      result = result.filter(c => filters.status!.includes(c.status));
    }

    // Apply practice area filter
    if (filters.practiceArea && filters.practiceArea.length > 0) {
      result = result.filter(c => c.practiceArea && filters.practiceArea!.includes(c.practiceArea));
    }

    // Apply date range filter
    if (filters.dateRange) {
      result = result.filter(c => {
        const filingDate = new Date(c.filingDate);
        const start = new Date(filters.dateRange!.start);
        const end = new Date(filters.dateRange!.end);
        return filingDate >= start && filingDate <= end;
      });
    }

    // Apply budget range filter
    if (filters.budgetRange) {
      result = result.filter(c => {
        const budget = c.budget?.amount || 0;
        return budget >= filters.budgetRange!.min && budget <= filters.budgetRange!.max;
      });
    }

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = (a as unknown as Record<string, unknown>)[sortConfig.field];
        const bValue = (b as unknown as Record<string, unknown>)[sortConfig.field];

        if (aValue === bValue) return 0;
        const comparison = (aValue as string | number) > (bValue as string | number) ? 1 : -1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [cases, searchQuery, filters, sortConfig]);

  // Selection Handlers
  const toggleCaseSelection = useCallback((caseId: string) => {
    setSelectedCases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(caseId)) {
        newSet.delete(caseId);
      } else {
        newSet.add(caseId);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedCases.size === filteredCases.length) {
      setSelectedCases(new Set());
    } else {
      setSelectedCases(new Set(filteredCases.map(c => c.id)));
    }
  }, [filteredCases, selectedCases.size]);

  const clearSelection = useCallback(() => {
    setSelectedCases(new Set());
  }, []);

  // Filter Handlers
  const handleFilterChange = useCallback((newFilters: FilterCriteria) => {
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  }, [onFilterChange]);

  const handleSaveView = useCallback(() => {
    const viewName = prompt('Enter a name for this view:');
    if (!viewName) return;

    const newView: SavedView = {
      id: Date.now().toString(),
      name: viewName,
      filters,
      columns,
      sortBy: sortConfig || undefined,
    };

    onSaveView?.(newView);
    setActiveView(newView);
  }, [filters, columns, sortConfig, onSaveView]);

  const handleLoadView = useCallback((view: SavedView) => {
    setFilters(view.filters);
    setColumns(view.columns);
    setSortConfig(view.sortBy || null);
    setActiveView(view);
  }, []);

  // Bulk Operations
  const bulkOperations: BulkOperation[] = useMemo(() => [
    {
      type: 'status',
      label: 'Update Status',
      icon: Edit,
      action: (ids) => onBulkOperation?.('status', ids),
    },
    {
      type: 'assign',
      label: 'Bulk Assign',
      icon: UserPlus,
      action: (ids) => onBulkOperation?.('assign', ids),
    },
    {
      type: 'export',
      label: 'Export Selected',
      icon: Download,
      action: (ids) => onBulkOperation?.('export', ids),
    },
    {
      type: 'archive',
      label: 'Archive Cases',
      icon: Archive,
      action: (ids) => onBulkOperation?.('archive', ids),
      requiresConfirmation: true,
    },
    {
      type: 'delete',
      label: 'Delete Cases',
      icon: Trash2,
      action: (ids) => onBulkOperation?.('delete', ids),
      requiresConfirmation: true,
    },
  ], [onBulkOperation]);

  const handleBulkOperation = useCallback((operation: BulkOperation) => {
    if (selectedCases.size === 0) return;

    if (operation.requiresConfirmation) {
      const confirmed = confirm(`Are you sure you want to ${operation.label.toLowerCase()} ${selectedCases.size} case(s)?`);
      if (!confirmed) return;
    }

    operation.action(Array.from(selectedCases));
    clearSelection();
  }, [selectedCases, clearSelection]);

  // Column Visibility Toggle
  const toggleColumnVisibility = useCallback((columnId: string) => {
    setColumns(prev => prev.map(col =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  }, []);

  // Sorting Handler
  const handleSort = useCallback((field: string) => {
    setSortConfig(prev => {
      if (prev?.field === field) {
        return { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { field, direction: 'asc' };
    });
  }, []);

  // Format currency
  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // Format date
  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className={cn('flex flex-col h-full space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Left: Search & Filters */}
        <div className="flex-1 flex gap-2 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", theme.text.muted)} />
            <input
              type="text"
              placeholder="Search cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn("w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500", theme.surface.input, theme.border.default, theme.text.primary)}
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors',
              showFilters
                ? cn(theme.surface.active, theme.border.primary, theme.text.primary)
                : cn(theme.surface.default, theme.border.default, theme.text.primary, `hover:${theme.surface.highlight}`)
            )}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>

          {/* Column Config */}
          <button
            onClick={() => setShowColumnConfig(!showColumnConfig)}
            className={cn("flex items-center gap-2 px-4 py-2 border rounded-lg", theme.surface.default, theme.border.default, theme.text.primary, `hover:${theme.surface.highlight}`)}
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex gap-2">
          {/* Saved Views */}
          {savedViews.length > 0 && (
            <div className="relative">
              <select
                value={activeView?.id || ''}
                onChange={(e) => {
                  const view = savedViews.find(v => v.id === e.target.value);
                  if (view) handleLoadView(view);
                }}
                className={cn("px-4 py-2 border rounded-lg", theme.surface.default, theme.border.default, theme.text.primary)}
              >
                <option value="">Select View</option>
                {savedViews.map(view => (
                  <option key={view.id} value={view.id}>{view.name}</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleSaveView}
            className={cn("flex items-center gap-2 px-4 py-2 border rounded-lg", theme.surface.default, theme.border.default, theme.text.primary, `hover:${theme.surface.highlight}`)}
          >
            <Save className="h-4 w-4" />
            Save View
          </button>

          <button
            className={cn("flex items-center gap-2 px-4 py-2 text-white rounded-lg", theme.interactive.primary)}
          >
            <Upload className="h-4 w-4" />
            Import
          </button>

          <button
            onClick={() => onBulkOperation?.('export', filteredCases.map(c => c.id))}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-white", theme.interactive.primary)}
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className={cn("p-4 border rounded-lg", theme.surface.subtle, theme.border.default)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className={cn("block text-sm font-medium mb-2", theme.text.secondary)}>
                Status
              </label>
              <select
                multiple
                value={filters.status || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value as CaseStatus);
                  handleFilterChange({ ...filters, status: selected });
                }}
                className={cn("w-full px-3 py-2 border rounded-lg", theme.surface.input, theme.border.default, theme.text.primary)}
              >
                {Object.values(CaseStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className={cn("block text-sm font-medium mb-2", theme.text.secondary)}>
                Filing Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) => handleFilterChange({
                    ...filters,
                    dateRange: { ...filters.dateRange!, start: e.target.value }
                  })}
                  className={cn("flex-1 px-3 py-2 border rounded-lg", theme.surface.input, theme.border.default, theme.text.primary)}
                />
                <input
                  type="date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) => handleFilterChange({
                    ...filters,
                    dateRange: { ...filters.dateRange!, end: e.target.value }
                  })}
                  className={cn("flex-1 px-3 py-2 border rounded-lg", theme.surface.input, theme.border.default, theme.text.primary)}
                />
              </div>
            </div>

            {/* Budget Range */}
            <div>
              <label className={cn("block text-sm font-medium mb-2", theme.text.secondary)}>
                Budget Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.budgetRange?.min || ''}
                  onChange={(e) => handleFilterChange({
                    ...filters,
                    budgetRange: { ...filters.budgetRange!, min: Number(e.target.value) }
                  })}
                  className={cn("flex-1 px-3 py-2 border rounded-lg", theme.surface.input, theme.border.default, theme.text.primary)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.budgetRange?.max || ''}
                  onChange={(e) => handleFilterChange({
                    ...filters,
                    budgetRange: { ...filters.budgetRange!, max: Number(e.target.value) }
                  })}
                  className={cn("flex-1 px-3 py-2 border rounded-lg", theme.surface.input, theme.border.default, theme.text.primary)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => handleFilterChange({})}
              className={cn("px-4 py-2 text-sm", theme.text.secondary, `hover:${theme.text.primary}`)}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Column Configuration Panel */}
      {showColumnConfig && (
        <div className={cn("p-4 border rounded-lg", theme.surface.subtle, theme.border.default)}>
          <h3 className={cn("text-sm font-semibold mb-3", theme.text.primary)}>Configure Columns</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {columns.map(col => (
              <label key={col.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={col.visible}
                  onChange={() => toggleColumnVisibility(col.id)}
                  className={cn("rounded", theme.border.default)}
                />
                <span className={cn("text-sm", theme.text.secondary)}>{col.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedCases.size > 0 && (
        <div className={cn("flex items-center justify-between p-4 rounded-lg", theme.surface.highlight)}>
          <div className="flex items-center gap-4">
            <span className={cn("text-sm font-medium", theme.text.accent)}>
              {selectedCases.size} case(s) selected
            </span>
            <button
              onClick={clearSelection}
              className={cn("text-sm", theme.text.accent, "hover:underline")}
            >
              Clear Selection
            </button>
          </div>
          <div className="flex gap-2">
            {bulkOperations.map(op => (
              <button
                key={op.type}
                onClick={() => handleBulkOperation(op)}
                className={cn("flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg", theme.surface.default, theme.border.default, theme.text.primary, `hover:${theme.surface.subtle}`)}
              >
                <op.icon className="h-4 w-4" />
                {op.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className={cn("flex-1 overflow-auto border rounded-lg", theme.border.default)}>
        <table className="w-full">
          <thead className={cn("sticky top-0 z-10", theme.surface.subtle)}>
            <tr>
              {/* Select All Checkbox */}
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedCases.size === filteredCases.length && filteredCases.length > 0}
                  onChange={toggleSelectAll}
                  className={cn("rounded", theme.border.default)}
                />
              </th>

              {/* Dynamic Columns */}
              {columns.filter(col => col.visible).map(col => (
                <th
                  key={col.id}
                  className={cn("px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer", theme.text.secondary, `hover:${theme.surface.highlight}`)}
                  style={{ width: col.width }}
                  onClick={() => col.id !== 'actions' && handleSort(col.id)}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {sortConfig?.field === col.id && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={cn("divide-y", theme.surface.default, theme.border.default)}>
            {filteredCases.length === 0 ? (
              <tr>
                <td colSpan={columns.filter(c => c.visible).length + 1} className={cn("px-4 py-8 text-center", theme.text.muted)}>
                  No cases found matching your criteria
                </td>
              </tr>
            ) : (
              filteredCases.map(caseItem => (
                <tr
                  key={caseItem.id}
                  className={cn(
                    'transition-colors',
                    `hover:${theme.surface.subtle}`,
                    selectedCases.has(caseItem.id) && theme.surface.highlight
                  )}
                >
                  {/* Checkbox */}
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedCases.has(caseItem.id)}
                      onChange={() => toggleCaseSelection(caseItem.id)}
                      className={cn("rounded", theme.border.default)}
                    />
                  </td>

                  {/* Dynamic Cells */}
                  {columns.find(c => c.id === 'caseNumber')?.visible && (
                    <td className={cn("px-4 py-3 text-sm font-medium", theme.text.primary)}>
                      {caseItem.caseNumber || '-'}
                    </td>
                  )}
                  {columns.find(c => c.id === 'title')?.visible && (
                    <td className={cn("px-4 py-3 text-sm", theme.text.primary)}>
                      <button
                        onClick={() => onCaseSelect?.(caseItem.id)}
                        className={cn("hover:underline text-left", theme.text.accent)}
                      >
                        {caseItem.title}
                      </button>
                    </td>
                  )}
                  {columns.find(c => c.id === 'client')?.visible && (
                    <td className={cn("px-4 py-3 text-sm", theme.text.secondary)}>
                      {caseItem.client}
                    </td>
                  )}
                  {columns.find(c => c.id === 'status')?.visible && (
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-1 text-xs font-medium rounded-full', STATUS_COLORS[caseItem.status])}>
                        {caseItem.status}
                      </span>
                    </td>
                  )}
                  {columns.find(c => c.id === 'practiceArea')?.visible && (
                    <td className={cn("px-4 py-3 text-sm", theme.text.secondary)}>
                      {caseItem.practiceArea || '-'}
                    </td>
                  )}
                  {columns.find(c => c.id === 'leadAttorney')?.visible && (
                    <td className={cn("px-4 py-3 text-sm", theme.text.secondary)}>
                      {caseItem.leadAttorneyId || '-'}
                    </td>
                  )}
                  {columns.find(c => c.id === 'filingDate')?.visible && (
                    <td className={cn("px-4 py-3 text-sm", theme.text.secondary)}>
                      {formatDate(caseItem.filingDate)}
                    </td>
                  )}
                  {columns.find(c => c.id === 'trialDate')?.visible && (
                    <td className={cn("px-4 py-3 text-sm", theme.text.secondary)}>
                      {formatDate(caseItem.trialDate)}
                    </td>
                  )}
                  {columns.find(c => c.id === 'budget')?.visible && (
                    <td className={cn("px-4 py-3 text-sm", theme.text.secondary)}>
                      {formatCurrency(caseItem.budget?.amount)}
                    </td>
                  )}
                  {columns.find(c => c.id === 'actions')?.visible && (
                    <td className="px-4 py-3">
                      <button className={cn(theme.text.muted, `hover:${theme.text.primary}`)}>
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer: Results Count */}
      <div className={cn("flex justify-between items-center text-sm", theme.text.secondary)}>
        <span>
          Showing {filteredCases.length} of {cases.length} cases
        </span>
        {selectedCases.size > 0 && (
          <span className={cn("font-medium", theme.text.accent)}>
            {selectedCases.size} selected
          </span>
        )}
      </div>
    </div>
  );
};
