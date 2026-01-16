/**
 * Report Filters Component
 *
 * ENTERPRISE ARCHITECTURE:
 * - Pure presentation component
 * - Receives data via props only
 * - No direct data fetching
 * - Emits events upward
 *
 * @module routes/reports/components/ReportFilters
 */

import { useId } from 'react';

interface ReportFiltersProps {
  searchTerm: string;
  typeFilter: string;
  onSearchChange: (term: string) => void;
  onTypeFilterChange: (type: string) => void;
}

export function ReportFilters({
  searchTerm,
  typeFilter,
  onSearchChange,
  onTypeFilterChange
}: ReportFiltersProps) {
  const searchId = useId();

  return (
    <div className="px-4 pb-4 space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor={searchId} className="sr-only">Search reports</label>
          <input
            id={searchId}
            type="search"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          aria-label="Filter by type"
        >
          <option value="all">All Types</option>
          <option value="Financial">Financial</option>
          <option value="Performance">Performance</option>
          <option value="Cases">Cases</option>
          <option value="Time">Time Tracking</option>
        </select>
      </div>
    </div>
  );
}
