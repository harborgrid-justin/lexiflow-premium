/**
 * DocumentFilters Component
 * Advanced filtering for document search and management
 */

import { useState } from 'react';

export interface DocumentFilterOptions {
  search?: string;
  type?: string;
  status?: string;
  caseId?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  ocrProcessed?: boolean;
  isRedacted?: boolean;
  author?: string;
}

interface DocumentFiltersProps {
  filters: DocumentFilterOptions;
  onChange: (filters: DocumentFilterOptions) => void;
  onClear: () => void;
  cases?: Array<{ id: string; name: string }>;
}

export function DocumentFilters({ filters, onChange, onClear, cases = [] }: DocumentFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof DocumentFilterOptions, value: unknown) => {
    onChange({ ...filters, [key]: value });
  };

  const activeFilterCount = Object.values(filters).filter(v =>
    v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  const documentTypes = [
    'Contract',
    'Pleading',
    'Motion',
    'Order',
    'Evidence',
    'Correspondence',
    'Form',
    'Brief',
    'Exhibit'
  ];

  const statuses = [
    'Draft',
    'Review',
    'Final',
    'Filed',
    'Signed',
    'Sent'
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </span>
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={onClear}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Document Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Document Type
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) => updateFilter('type', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
              >
                <option value="">All Types</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => updateFilter('status', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Case */}
            {cases.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Case
                </label>
                <select
                  value={filters.caseId || ''}
                  onChange={(e) => updateFilter('caseId', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
                >
                  <option value="">All Cases</option>
                  {cases.map(caseItem => (
                    <option key={caseItem.id} value={caseItem.id}>{caseItem.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => updateFilter('dateFrom', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => updateFilter('dateTo', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Author
              </label>
              <input
                type="text"
                value={filters.author || ''}
                onChange={(e) => updateFilter('author', e.target.value || undefined)}
                placeholder="Filter by author..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Special Filters */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.ocrProcessed || false}
                onChange={(e) => updateFilter('ocrProcessed', e.target.checked || undefined)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">OCR Processed Only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.isRedacted || false}
                onChange={(e) => updateFilter('isRedacted', e.target.checked || undefined)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Privileged Documents Only</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
