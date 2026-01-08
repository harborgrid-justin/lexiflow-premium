'use client';

/**
 * Document Filters Component
 * Search and filter controls for documents
 */

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input, Select, Button } from '@/components/ui';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { ReviewStatus, type ReviewStatusValue } from '../../../_types';

interface DocumentFiltersProps {
  discoveryRequestId: string;
}

const reviewStatusOptions = [
  { value: '', label: 'All Statuses' },
  { value: ReviewStatus.NOT_REVIEWED, label: 'Not Reviewed' },
  { value: ReviewStatus.IN_REVIEW, label: 'In Review' },
  { value: ReviewStatus.REVIEWED, label: 'Reviewed' },
  { value: ReviewStatus.FLAGGED, label: 'Flagged' },
];

const fileTypeOptions = [
  { value: '', label: 'All File Types' },
  { value: 'email', label: 'Emails' },
  { value: 'pdf', label: 'PDFs' },
  { value: 'doc', label: 'Documents' },
  { value: 'spreadsheet', label: 'Spreadsheets' },
  { value: 'image', label: 'Images' },
  { value: 'other', label: 'Other' },
];

export function DocumentFilters({ discoveryRequestId }: DocumentFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [keywords, setKeywords] = useState(searchParams.get('keywords') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [fileType, setFileType] = useState(searchParams.get('fileType') || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Reset to page 1 when filters change
      params.delete('page');

      router.push(`/discovery/${discoveryRequestId}/documents?${params.toString()}`);
    },
    [router, discoveryRequestId, searchParams]
  );

  const handleSearch = () => {
    updateFilters({ keywords, status, fileType });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setKeywords('');
    setStatus('');
    setFileType('');
    router.push(`/discovery/${discoveryRequestId}/documents`);
  };

  const hasActiveFilters = keywords || status || fileType;

  return (
    <div className="space-y-4">
      {/* Main Search Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search documents by content, filename, or metadata..."
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            updateFilters({ keywords, status: e.target.value, fileType });
          }}
          className="w-full sm:w-40"
        >
          {reviewStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        {/* File Type Filter */}
        <Select
          value={fileType}
          onChange={(e) => {
            setFileType(e.target.value);
            updateFilters({ keywords, status, fileType: e.target.value });
          }}
          className="w-full sm:w-40"
        >
          {fileTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        {/* Search Button */}
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4" />
        </Button>

        {/* Advanced Toggle */}
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Custodian */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Custodian
              </label>
              <Select>
                <option value="">All Custodians</option>
                <option value="john.smith">John Smith</option>
                <option value="jane.doe">Jane Doe</option>
                <option value="bob.wilson">Bob Wilson</option>
              </Select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date From
              </label>
              <Input type="date" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date To
              </label>
              <Input type="date" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Responsive */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Responsive
              </label>
              <Select>
                <option value="">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="maybe">Maybe</option>
                <option value="not_coded">Not Coded</option>
              </Select>
            </div>

            {/* Privileged */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Privileged
              </label>
              <Select>
                <option value="">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="not_coded">Not Coded</option>
              </Select>
            </div>

            {/* Has Attachments */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Has Attachments
              </label>
              <Select>
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-slate-500 dark:text-slate-400">Active filters:</span>
          {keywords && (
            <FilterTag
              label={`Keywords: ${keywords}`}
              onRemove={() => {
                setKeywords('');
                updateFilters({ keywords: '', status, fileType });
              }}
            />
          )}
          {status && (
            <FilterTag
              label={`Status: ${reviewStatusOptions.find((o) => o.value === status)?.label}`}
              onRemove={() => {
                setStatus('');
                updateFilters({ keywords, status: '', fileType });
              }}
            />
          )}
          {fileType && (
            <FilterTag
              label={`Type: ${fileTypeOptions.find((o) => o.value === fileType)?.label}`}
              onRemove={() => {
                setFileType('');
                updateFilters({ keywords, status, fileType: '' });
              }}
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
