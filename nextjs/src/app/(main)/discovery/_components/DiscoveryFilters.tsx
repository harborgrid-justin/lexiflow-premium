'use client';

/**
 * Discovery Filters Component
 * Search and filter controls for discovery requests
 */

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input, Select, Button } from '@/components/ui';
import { Search, Filter, X, Calendar } from 'lucide-react';
import {
  DiscoveryRequestStatus,
  DiscoveryRequestType,
  type DiscoveryRequestStatusValue,
  type DiscoveryRequestTypeValue,
} from '../_types';

interface DiscoveryFiltersProps {
  onFilterChange?: (filters: DiscoveryFilterState) => void;
}

export interface DiscoveryFilterState {
  search: string;
  status: DiscoveryRequestStatusValue | '';
  type: DiscoveryRequestTypeValue | '';
  dateFrom: string;
  dateTo: string;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: DiscoveryRequestStatus.DRAFT, label: 'Draft' },
  { value: DiscoveryRequestStatus.PENDING, label: 'Pending' },
  { value: DiscoveryRequestStatus.SERVED, label: 'Served' },
  { value: DiscoveryRequestStatus.RESPONDED, label: 'Responded' },
  { value: DiscoveryRequestStatus.OBJECTED, label: 'Objected' },
  { value: DiscoveryRequestStatus.OVERDUE, label: 'Overdue' },
  { value: DiscoveryRequestStatus.CLOSED, label: 'Closed' },
  { value: DiscoveryRequestStatus.MOTION_FILED, label: 'Motion Filed' },
];

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: DiscoveryRequestType.INTERROGATORIES, label: 'Interrogatories' },
  { value: DiscoveryRequestType.PRODUCTION, label: 'Production' },
  { value: DiscoveryRequestType.ADMISSION, label: 'Admission' },
  { value: DiscoveryRequestType.DEPOSITION, label: 'Deposition' },
  { value: DiscoveryRequestType.SUBPOENA, label: 'Subpoena' },
];

export function DiscoveryFilters({ onFilterChange }: DiscoveryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<DiscoveryFilterState>({
    search: searchParams.get('search') || '',
    status: (searchParams.get('status') as DiscoveryRequestStatusValue) || '',
    type: (searchParams.get('type') as DiscoveryRequestTypeValue) || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilters = useCallback(
    (newFilters: Partial<DiscoveryFilterState>) => {
      const updated = { ...filters, ...newFilters };
      setFilters(updated);
      onFilterChange?.(updated);

      // Update URL params
      const params = new URLSearchParams();
      if (updated.search) params.set('search', updated.search);
      if (updated.status) params.set('status', updated.status);
      if (updated.type) params.set('type', updated.type);
      if (updated.dateFrom) params.set('dateFrom', updated.dateFrom);
      if (updated.dateTo) params.set('dateTo', updated.dateTo);

      const queryString = params.toString();
      router.push(`/discovery${queryString ? `?${queryString}` : ''}`);
    },
    [filters, onFilterChange, router]
  );

  const clearFilters = () => {
    const cleared: DiscoveryFilterState = {
      search: '',
      status: '',
      type: '',
      dateFrom: '',
      dateTo: '',
    };
    setFilters(cleared);
    onFilterChange?.(cleared);
    router.push('/discovery');
  };

  const hasActiveFilters = filters.search || filters.status || filters.type || filters.dateFrom || filters.dateTo;

  return (
    <div className="space-y-4">
      {/* Main Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search discovery requests..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status}
          onChange={(e) => updateFilters({ status: e.target.value as DiscoveryRequestStatusValue | '' })}
          className="w-full sm:w-48"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        {/* Type Filter */}
        <Select
          value={filters.type}
          onChange={(e) => updateFilters({ type: e.target.value as DiscoveryRequestTypeValue | '' })}
          className="w-full sm:w-48"
        >
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        {/* Advanced Toggle */}
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          {showAdvanced ? 'Less' : 'More'}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="flex flex-wrap gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Due Date:</span>
          </div>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => updateFilters({ dateFrom: e.target.value })}
            className="w-40"
            placeholder="From"
          />
          <span className="text-slate-400">to</span>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => updateFilters({ dateTo: e.target.value })}
            className="w-40"
            placeholder="To"
          />
        </div>
      )}

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-slate-500 dark:text-slate-400">Active filters:</span>
          {filters.search && (
            <FilterTag
              label={`Search: ${filters.search}`}
              onRemove={() => updateFilters({ search: '' })}
            />
          )}
          {filters.status && (
            <FilterTag
              label={`Status: ${statusOptions.find((o) => o.value === filters.status)?.label}`}
              onRemove={() => updateFilters({ status: '' })}
            />
          )}
          {filters.type && (
            <FilterTag
              label={`Type: ${typeOptions.find((o) => o.value === filters.type)?.label}`}
              onRemove={() => updateFilters({ type: '' })}
            />
          )}
          {(filters.dateFrom || filters.dateTo) && (
            <FilterTag
              label={`Date: ${filters.dateFrom || 'any'} - ${filters.dateTo || 'any'}`}
              onRemove={() => updateFilters({ dateFrom: '', dateTo: '' })}
            />
          )}
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

interface FilterTagProps {
  label: string;
  onRemove: () => void;
}

function FilterTag({ label, onRemove }: FilterTagProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded p-0.5"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

/**
 * Quick filter tabs for common views
 */
export function DiscoveryQuickFilters({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}) {
  const filters = [
    { id: 'all', label: 'All Requests' },
    { id: 'pending', label: 'Pending' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'incoming', label: 'Incoming' },
    { id: 'outgoing', label: 'Outgoing' },
  ];

  return (
    <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`
            px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${activeFilter === filter.id
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }
          `}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
