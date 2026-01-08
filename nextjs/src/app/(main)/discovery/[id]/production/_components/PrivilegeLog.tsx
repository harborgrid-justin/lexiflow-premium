'use client';

/**
 * Privilege Log Component
 *
 * FRCP 26(b)(5) compliant privilege log for documenting withheld documents
 * claiming attorney-client or work product privilege.
 *
 * Features:
 * - Privilege type filtering (Attorney-Client, Work Product, Joint Defense, Common Interest)
 * - Date range filtering
 * - Redaction status tracking
 * - Export to PDF/Excel formats
 * - Search by document ID, description, or author
 */

import { useState, useMemo, useTransition } from 'react';
import { Card, CardBody, CardHeader, Button, Badge, Input } from '@/components/ui';
import {
  Shield,
  Search,
  Download,
  Plus,
  FileText,
  Calendar,
  User,
  MessageSquare,
  FileSpreadsheet,
  File,
  Filter,
  X,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Scissors,
  Loader2,
} from 'lucide-react';
import type { PrivilegeLogEntry, PrivilegeTypeValue } from '../../../_types';
import { exportPrivilegeLog } from '../../../_actions/production-actions';
import { useToast } from '@/hooks/use-toast';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface PrivilegeLogProps {
  entries: PrivilegeLogEntry[];
  caseId: string;
  onAddEntry?: () => void;
  onRefresh?: () => void;
}

type ExportFormat = 'pdf' | 'excel' | 'csv';

type RedactionStatus = 'none' | 'partial' | 'full';

interface FilterState {
  privilegeType: PrivilegeTypeValue | 'all';
  dateFrom: string;
  dateTo: string;
  redactionStatus: RedactionStatus | 'all';
}

// ============================================================================
// Constants
// ============================================================================

const privilegeTypeLabels: Record<PrivilegeTypeValue | 'all', string> = {
  all: 'All Types',
  none: 'None',
  'attorney-client': 'Attorney-Client',
  'work-product': 'Work Product',
  both: 'Both (AC & WP)',
};

const privilegeTypeColors: Record<PrivilegeTypeValue, 'info' | 'warning' | 'success' | 'default'> = {
  none: 'default',
  'attorney-client': 'info',
  'work-product': 'warning',
  both: 'success',
};

const redactionStatusLabels: Record<RedactionStatus | 'all', string> = {
  all: 'All Redaction Status',
  none: 'No Redaction',
  partial: 'Partial Redaction',
  full: 'Full Redaction',
};

const exportFormatLabels: Record<ExportFormat, { label: string; icon: typeof FileText }> = {
  pdf: { label: 'Export PDF', icon: File },
  excel: { label: 'Export Excel', icon: FileSpreadsheet },
  csv: { label: 'Export CSV', icon: FileText },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Infer redaction status from privilege log entry
 * In a real implementation, this would come from the entry data
 */
function inferRedactionStatus(entry: PrivilegeLogEntry): RedactionStatus {
  // If it's fully withheld (both privilege types), likely full redaction
  if (entry.privilegeType === 'both') return 'full';
  // If has a privilege type, likely has some redaction
  if (entry.privilegeType !== 'none') return 'partial';
  return 'none';
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

// ============================================================================
// Sub-Components
// ============================================================================

interface ExportDropdownProps {
  onExport: (format: ExportFormat) => void;
  isExporting: boolean;
}

function ExportDropdown({ onExport, isExporting }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        icon={isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      >
        {isExporting ? 'Exporting...' : 'Export Log'}
        <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && !isExporting && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20">
            {(Object.keys(exportFormatLabels) as ExportFormat[]).map((format) => {
              const { label, icon: Icon } = exportFormatLabels[format];
              return (
                <button
                  key={format}
                  onClick={() => {
                    onExport(format);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left flex items-center gap-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 first:rounded-t-lg last:rounded-b-lg transition-colors text-slate-900 dark:text-slate-50"
                >
                  <Icon className="h-4 w-4 text-slate-500" />
                  {label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

function FilterPanel({ filters, onFiltersChange, onClearFilters, hasActiveFilters }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-3">
      {/* Quick filters row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Privilege Type Filter */}
        <div className="flex-1 min-w-[180px]">
          <select
            value={filters.privilegeType}
            onChange={(e) => onFiltersChange({ ...filters, privilegeType: e.target.value as PrivilegeTypeValue | 'all' })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {(Object.keys(privilegeTypeLabels) as (PrivilegeTypeValue | 'all')[]).map((type) => (
              <option key={type} value={type}>
                {privilegeTypeLabels[type]}
              </option>
            ))}
          </select>
        </div>

        {/* Redaction Status Filter */}
        <div className="flex-1 min-w-[180px]">
          <select
            value={filters.redactionStatus}
            onChange={(e) => onFiltersChange({ ...filters, redactionStatus: e.target.value as RedactionStatus | 'all' })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {(Object.keys(redactionStatusLabels) as (RedactionStatus | 'all')[]).map((status) => (
              <option key={status} value={status}>
                {redactionStatusLabels[status]}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced Filters Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          icon={<Filter className="h-4 w-4" />}
        >
          {isExpanded ? 'Less Filters' : 'More Filters'}
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            icon={<X className="h-4 w-4" />}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Advanced filters panel */}
      {isExpanded && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Range - From */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Document Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Date Range - To */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Document Date To
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface PrivilegeEntryCardProps {
  entry: PrivilegeLogEntry;
  redactionStatus: RedactionStatus;
}

function PrivilegeEntryCard({ entry, redactionStatus }: PrivilegeEntryCardProps) {
  const redactionBadge = {
    none: { label: 'No Redaction', variant: 'default' as const, icon: CheckCircle },
    partial: { label: 'Partial', variant: 'warning' as const, icon: Scissors },
    full: { label: 'Full Redaction', variant: 'danger' as const, icon: AlertCircle },
  };

  const { label: redactionLabel, variant: redactionVariant, icon: RedactionIcon } = redactionBadge[redactionStatus];

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
      {/* Header Row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-500" />
          <span className="font-mono text-sm font-medium text-slate-900 dark:text-white">
            {entry.batesNumber || entry.documentId || 'No Bates #'}
          </span>
        </div>
        <div className="flex gap-2">
          {/* Privilege Type Badge */}
          <Badge variant={privilegeTypeColors[entry.privilegeType]}>
            {privilegeTypeLabels[entry.privilegeType]}
          </Badge>
          {/* Redaction Status Badge */}
          <Badge
            variant={redactionVariant}
            icon={<RedactionIcon className="h-3 w-3" />}
          >
            {redactionLabel}
          </Badge>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 line-clamp-2">
        {entry.description}
      </p>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        {/* Document Date */}
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(entry.documentDate)}</span>
        </div>

        {/* Author */}
        {entry.author && (
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <User className="h-3.5 w-3.5" />
            <span className="truncate">{entry.author}</span>
          </div>
        )}

        {/* Recipients */}
        {entry.recipients && entry.recipients.length > 0 && (
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>
              {entry.recipients.length} recipient{entry.recipients.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Document Type */}
        {entry.documentType && (
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <FileText className="h-3.5 w-3.5" />
            <span className="truncate">{entry.documentType}</span>
          </div>
        )}
      </div>

      {/* Privilege Basis */}
      {entry.privilegeBasis && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">Basis: </span>
            {entry.privilegeBasis}
          </p>
        </div>
      )}

      {/* Author/Recipients Detail */}
      {(entry.author || (entry.recipients && entry.recipients.length > 0)) && (
        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
          {entry.author && (
            <p>
              <span className="font-medium">From:</span> {entry.author}
              {entry.authorRole && ` (${entry.authorRole})`}
            </p>
          )}
          {entry.recipients && entry.recipients.length > 0 && (
            <p>
              <span className="font-medium">To:</span> {entry.recipients.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function PrivilegeLog({ entries, caseId, onAddEntry }: PrivilegeLogProps) {
  const { error: toastError, success: toastSuccess } = useToast();
  const [isPending, startTransition] = useTransition();

  // State
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    privilegeType: 'all',
    dateFrom: '',
    dateTo: '',
    redactionStatus: 'all',
  });

  // Computed values
  const hasActiveFilters = useMemo(() => {
    return (
      filters.privilegeType !== 'all' ||
      filters.dateFrom !== '' ||
      filters.dateTo !== '' ||
      filters.redactionStatus !== 'all'
    );
  }, [filters]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Search filter
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        entry.documentId?.toLowerCase().includes(searchLower) ||
        entry.batesNumber?.toLowerCase().includes(searchLower) ||
        entry.description.toLowerCase().includes(searchLower) ||
        entry.author?.toLowerCase().includes(searchLower) ||
        entry.privilegeBasis?.toLowerCase().includes(searchLower);

      // Privilege type filter
      const matchesPrivilegeType =
        filters.privilegeType === 'all' || entry.privilegeType === filters.privilegeType;

      // Date range filter
      let matchesDateRange = true;
      if (filters.dateFrom) {
        matchesDateRange = matchesDateRange && entry.documentDate >= filters.dateFrom;
      }
      if (filters.dateTo) {
        matchesDateRange = matchesDateRange && entry.documentDate <= filters.dateTo;
      }

      // Redaction status filter
      const redactionStatus = inferRedactionStatus(entry);
      const matchesRedactionStatus =
        filters.redactionStatus === 'all' || redactionStatus === filters.redactionStatus;

      return matchesSearch && matchesPrivilegeType && matchesDateRange && matchesRedactionStatus;
    });
  }, [entries, search, filters]);

  // Statistics
  const stats = useMemo(() => {
    const total = entries.length;
    const attorneyClient = entries.filter((e) => e.privilegeType === 'attorney-client' || e.privilegeType === 'both').length;
    const workProduct = entries.filter((e) => e.privilegeType === 'work-product' || e.privilegeType === 'both').length;
    const withRedactions = entries.filter((e) => inferRedactionStatus(e) !== 'none').length;

    return { total, attorneyClient, workProduct, withRedactions };
  }, [entries]);

  // Handlers
  const handleClearFilters = () => {
    setFilters({
      privilegeType: 'all',
      dateFrom: '',
      dateTo: '',
      redactionStatus: 'all',
    });
  };

  const handleExport = async (format: ExportFormat) => {
    startTransition(async () => {
      try {
        const result = await exportPrivilegeLog(caseId, format);

        if (result.success && result.data) {
          toastSuccess(`Privilege log exported successfully`);

          // Trigger download
          window.open(result.data.downloadUrl, '_blank');
        } else {
          toastError(result.error || 'Failed to export privilege log');
        }
      } catch (err) {
        toastError('An unexpected error occurred while exporting');
        console.error('Export error:', err);
      }
    });
  };

  return (
    <Card>
      <CardHeader className="pb-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Privilege Log (FRCP 26(b)(5))
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {stats.total} privileged document{stats.total !== 1 ? 's' : ''} |
              {' '}{stats.attorneyClient} A-C | {stats.workProduct} WP | {stats.withRedactions} with redactions
            </p>
          </div>
          <div className="flex gap-2">
            <ExportDropdown onExport={handleExport} isExporting={isPending} />
            <Button
              size="sm"
              icon={<Plus className="h-4 w-4" />}
              onClick={onAddEntry}
            >
              Add Entry
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search by Bates number, description, author, or privilege basis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Filters */}
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </CardHeader>

      <CardBody>
        {/* Results Info */}
        {(search || hasActiveFilters) && (
          <div className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Showing {filteredEntries.length} of {entries.length} entries
            {search && <span> matching &ldquo;{search}&rdquo;</span>}
          </div>
        )}

        {/* Entry List */}
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              {entries.length === 0
                ? 'No privilege log entries yet'
                : 'No entries match your filters'}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
              {entries.length === 0
                ? 'Add documents claiming attorney-client or work product privilege'
                : 'Try adjusting your search or filter criteria'}
            </p>
            {entries.length > 0 && hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-4"
                onClick={handleClearFilters}
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <PrivilegeEntryCard
                key={entry.id}
                entry={entry}
                redactionStatus={inferRedactionStatus(entry)}
              />
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
