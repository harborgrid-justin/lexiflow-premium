'use client';

/**
 * Document Filters Component
 * Search and filter controls for documents
 */

import { useState, useCallback, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input, Select, Button } from '@/components/ui';
import { Search, Filter, X, Loader2 } from 'lucide-react';
import { ReviewStatus } from '../../../_types';
import { getCustodians } from '../../../_actions';

interface DocumentFiltersProps {
  discoveryRequestId: string;
  resultCount?: number;
}

interface CustodianOption {
  value: string;
  label: string;
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

const responsiveOptions = [
  { value: '', label: 'Any' },
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'not_coded', label: 'Not Coded' },
];

const privilegedOptions = [
  { value: '', label: 'Any' },
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not_coded', label: 'Not Coded' },
];

const hasAttachmentsOptions = [
  { value: '', label: 'Any' },
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
];

export function DocumentFilters({ discoveryRequestId, resultCount }: DocumentFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Basic filters
  const [keywords, setKeywords] = useState(searchParams.get('keywords') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [fileType, setFileType] = useState(searchParams.get('fileType') || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced filters
  const [custodian, setCustodian] = useState(searchParams.get('custodian') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  const [responsive, setResponsive] = useState(searchParams.get('responsive') || '');
  const [privileged, setPrivileged] = useState(searchParams.get('privileged') || '');
  const [hasAttachments, setHasAttachments] = useState(searchParams.get('hasAttachments') || '');

  // Custodians from backend
  const [custodianOptions, setCustodianOptions] = useState<CustodianOption[]>([
    { value: '', label: 'All Custodians' },
  ]);
  const [isLoadingCustodians, setIsLoadingCustodians] = useState(false);

  // Fetch custodians from backend
  useEffect(() => {
    async function fetchCustodians() {
      setIsLoadingCustodians(true);
      try {
        const result = await getCustodians();
        if (result.success && result.data) {
          const options: CustodianOption[] = [
            { value: '', label: 'All Custodians' },
            ...result.data.items.map((c) => ({
              value: c.id,
              label: c.name,
            })),
          ];
          setCustodianOptions(options);
        }
      } catch (error) {
        console.error('Failed to fetch custodians:', error);
      } finally {
        setIsLoadingCustodians(false);
      }
    }

    fetchCustodians();
  }, []);

  // Auto-expand advanced filters if any advanced filter is active
  useEffect(() => {
    const hasAdvancedFilter = custodian || dateFrom || dateTo || responsive || privileged || hasAttachments;
    if (hasAdvancedFilter) {
      setShowAdvanced(true);
    }
  }, [custodian, dateFrom, dateTo, responsive, privileged, hasAttachments]);

  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      startTransition(() => {
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
      });
    },
    [router, discoveryRequestId, searchParams]
  );

  const getAllCurrentFilters = useCallback(() => {
    return {
      keywords,
      status,
      fileType,
      custodian,
      dateFrom,
      dateTo,
      responsive,
      privileged,
      hasAttachments,
    };
  }, [keywords, status, fileType, custodian, dateFrom, dateTo, responsive, privileged, hasAttachments]);

  const handleSearch = () => {
    updateFilters(getAllCurrentFilters());
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
    setCustodian('');
    setDateFrom('');
    setDateTo('');
    setResponsive('');
    setPrivileged('');
    setHasAttachments('');
    router.push(`/discovery/${discoveryRequestId}/documents`);
  };

  // Calculate active filters for display
  const activeFilters = [
    keywords && { key: 'keywords', label: `Keywords: ${keywords}` },
    status && { key: 'status', label: `Status: ${reviewStatusOptions.find((o) => o.value === status)?.label}` },
    fileType && { key: 'fileType', label: `Type: ${fileTypeOptions.find((o) => o.value === fileType)?.label}` },
    custodian && { key: 'custodian', label: `Custodian: ${custodianOptions.find((o) => o.value === custodian)?.label}` },
    dateFrom && { key: 'dateFrom', label: `From: ${dateFrom}` },
    dateTo && { key: 'dateTo', label: `To: ${dateTo}` },
    responsive && { key: 'responsive', label: `Responsive: ${responsiveOptions.find((o) => o.value === responsive)?.label}` },
    privileged && { key: 'privileged', label: `Privileged: ${privilegedOptions.find((o) => o.value === privileged)?.label}` },
    hasAttachments && { key: 'hasAttachments', label: `Attachments: ${hasAttachmentsOptions.find((o) => o.value === hasAttachments)?.label}` },
  ].filter(Boolean) as { key: string; label: string }[];

  const hasActiveFilters = activeFilters.length > 0;

  const removeFilter = (key: string) => {
    const updates = getAllCurrentFilters();
    updates[key as keyof typeof updates] = '';

    // Update local state
    switch (key) {
      case 'keywords':
        setKeywords('');
        break;
      case 'status':
        setStatus('');
        break;
      case 'fileType':
        setFileType('');
        break;
      case 'custodian':
        setCustodian('');
        break;
      case 'dateFrom':
        setDateFrom('');
        break;
      case 'dateTo':
        setDateTo('');
        break;
      case 'responsive':
        setResponsive('');
        break;
      case 'privileged':
        setPrivileged('');
        break;
      case 'hasAttachments':
        setHasAttachments('');
        break;
    }

    updateFilters(updates);
  };

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
            updateFilters({ ...getAllCurrentFilters(), status: e.target.value });
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
            updateFilters({ ...getAllCurrentFilters(), fileType: e.target.value });
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
        <Button onClick={handleSearch} disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
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
              <Select
                value={custodian}
                onChange={(e) => {
                  setCustodian(e.target.value);
                  updateFilters({ ...getAllCurrentFilters(), custodian: e.target.value });
                }}
                disabled={isLoadingCustodians}
              >
                {isLoadingCustodians ? (
                  <option value="">Loading custodians...</option>
                ) : (
                  custodianOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))
                )}
              </Select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date From
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  updateFilters({ ...getAllCurrentFilters(), dateFrom: e.target.value });
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date To
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  updateFilters({ ...getAllCurrentFilters(), dateTo: e.target.value });
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Responsive */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Responsive
              </label>
              <Select
                value={responsive}
                onChange={(e) => {
                  setResponsive(e.target.value);
                  updateFilters({ ...getAllCurrentFilters(), responsive: e.target.value });
                }}
              >
                {responsiveOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Privileged */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Privileged
              </label>
              <Select
                value={privileged}
                onChange={(e) => {
                  setPrivileged(e.target.value);
                  updateFilters({ ...getAllCurrentFilters(), privileged: e.target.value });
                }}
              >
                {privilegedOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Has Attachments */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Has Attachments
              </label>
              <Select
                value={hasAttachments}
                onChange={(e) => {
                  setHasAttachments(e.target.value);
                  updateFilters({ ...getAllCurrentFilters(), hasAttachments: e.target.value });
                }}
              >
                {hasAttachmentsOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters & Result Count */}
      {(hasActiveFilters || resultCount !== undefined) && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {hasActiveFilters && (
              <>
                <span className="text-sm text-slate-500 dark:text-slate-400">Active filters:</span>
                {activeFilters.map((filter) => (
                  <FilterTag
                    key={filter.key}
                    label={filter.label}
                    onRemove={() => removeFilter(filter.key)}
                  />
                ))}
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear all
                </button>
              </>
            )}
          </div>
          {resultCount !== undefined && (
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {resultCount.toLocaleString()} {resultCount === 1 ? 'document' : 'documents'} found
            </span>
          )}
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
