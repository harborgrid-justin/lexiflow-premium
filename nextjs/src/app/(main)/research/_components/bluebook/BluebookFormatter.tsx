'use client';

/**
 * @module research/bluebook/BluebookFormatter
 * @category Legal Research - Citation Formatting
 * @description Enterprise Bluebook citation formatter with batch processing, validation, and export
 */

import React, { useCallback, useDeferredValue, useMemo, useState } from 'react';
import {
  BookOpen,
  Copy,
  FileDown,
  FileText,
  Filter,
  Info,
  Plus,
  Scale,
  Settings,
  Table,
  Trash2,
  Upload,
  Wand2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Book,
  Flag,
  FileCode,
  X
} from 'lucide-react';

// Internal imports
import { useTheme } from '@/providers';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/atoms/Button/Button';
import { Badge } from '@/components/ui/atoms/Badge/Badge';
import { Card } from '@/components/ui/molecules/Card/Card';

// Local imports
import {
  BluebookCitationType,
  CitationFormat,
  ExportFormat,
  ValidationSeverity,
  FormattingResult,
  FormatStats,
  FormatOptions,
  FilterOptions
} from './types';
import {
  BluebookParser,
  BluebookFormatter as Formatter,
  copyToClipboard,
  getCitationTypeLabel,
  getCitationTypeColor,
  SAMPLE_CITATIONS
} from './citation-utils';
import {
  exportToText,
  exportToHTML,
  exportToJSON,
  openTOAInWindow,
  copyTOAToClipboard
} from './export-utils';

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Calculate formatting statistics from results
 */
function useFormattingStats(results: FormattingResult[]): FormatStats {
  return useMemo<FormatStats>(() => {
    const total = results.length;
    const valid = results.filter(r => r.isValid).length;
    const warnings = results.filter(r =>
      r.citation?.validationErrors.some(e => e.severity === ValidationSeverity.WARNING)
    ).length;
    const errors = results.filter(r => !r.isValid).length;

    return { total, valid, warnings, errors };
  }, [results]);
}

/**
 * Filter results based on filter options
 */
function useFilteredResults(
  results: FormattingResult[],
  filters: FilterOptions
): FormattingResult[] {
  return useMemo(() => {
    let filtered = results;

    if (filters.type !== 'ALL') {
      filtered = filtered.filter(r => r.citation?.type === filters.type);
    }

    if (filters.showOnlyErrors) {
      filtered = filtered.filter(r => !r.isValid);
    }

    return filtered;
  }, [results, filters.type, filters.showOnlyErrors]);
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/**
 * Stats Bar Component
 */
interface StatsBarProps {
  stats: FormatStats;
}

const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  const { theme } = useTheme();

  const statItems = [
    { label: 'Total', value: stats.total, color: 'text-blue-600' },
    { label: 'Valid', value: stats.valid, color: 'text-green-600' },
    { label: 'Warnings', value: stats.warnings, color: 'text-amber-600' },
    { label: 'Errors', value: stats.errors, color: 'text-red-600' }
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {statItems.map((item) => (
        <div
          key={item.label}
          className={cn(
            "text-center p-4 rounded-xl border shadow-sm",
            theme.surface.default,
            theme.border.default
          )}
        >
          <div className={cn("text-2xl font-bold", item.color)}>{item.value}</div>
          <div className={cn("text-xs uppercase font-medium", theme.text.tertiary)}>
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Format Options Card Component
 */
interface FormatOptionsCardProps {
  options: FormatOptions;
  onOptionsChange: (options: FormatOptions) => void;
}

const FormatOptionsCard: React.FC<FormatOptionsCardProps> = ({
  options,
  onOptionsChange
}) => {
  const { theme } = useTheme();

  return (
    <div className={cn("p-4 rounded-lg border", theme.surface.highlight, theme.border.default)}>
      <div className="flex items-center gap-2 mb-3">
        <Settings className="h-4 w-4 text-slate-500" />
        <h4 className={cn("font-bold text-sm", theme.text.primary)}>Format Options</h4>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.italicizeCaseNames}
            onChange={(e) => onOptionsChange({ ...options, italicizeCaseNames: e.target.checked })}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className={cn("text-sm", theme.text.secondary)}>Italicize Case Names</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.useSmallCaps}
            onChange={(e) => onOptionsChange({ ...options, useSmallCaps: e.target.checked })}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className={cn("text-sm", theme.text.secondary)}>Use Small Caps</span>
        </label>

        <div>
          <label className={cn("text-xs uppercase font-bold mb-1 block", theme.text.tertiary)}>
            Citation Format
          </label>
          <select
            value={options.format}
            onChange={(e) => onOptionsChange({ ...options, format: e.target.value as CitationFormat })}
            title="Select citation format style"
            className={cn(
              "w-full px-3 py-1.5 rounded border text-sm",
              theme.surface.default,
              theme.border.default,
              theme.text.primary
            )}
          >
            <option value={CitationFormat.FULL}>Full Citation</option>
            <option value={CitationFormat.SHORT_FORM}>Short Form</option>
          </select>
        </div>
      </div>
    </div>
  );
};

/**
 * Input Section Component
 */
interface InputSectionProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onFormat: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAddSamples: () => void;
  onClearAll: () => void;
  isProcessing: boolean;
  formatOptions: FormatOptions;
  onFormatOptionsChange: (options: FormatOptions) => void;
}

const InputSection: React.FC<InputSectionProps> = ({
  inputText,
  onInputChange,
  onFormat,
  onFileUpload,
  onAddSamples,
  onClearAll,
  isProcessing,
  formatOptions,
  onFormatOptionsChange
}) => {
  const { theme } = useTheme();

  return (
    <Card title="Input Citations" subtitle="Enter citations (one per line) or upload a file">
      <div className="space-y-4">
        <textarea
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={`Enter citations here, one per line...

Example:
Brown v. Board of Education, 347 U.S. 483 (1954)
42 U.S.C. \u00A7 1983 (2018)
U.S. Const. amend. XIV, \u00A7 1`}
          className={cn(
            "w-full h-64 p-4 rounded-lg border resize-none font-mono text-sm",
            theme.surface.default,
            theme.border.default,
            theme.text.primary,
            "focus:outline-none focus:ring-2 focus:ring-blue-500"
          )}
        />

        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            icon={Wand2}
            onClick={onFormat}
            disabled={!inputText.trim() || isProcessing}
            isLoading={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Format Citations'}
          </Button>

          <label className="inline-block cursor-pointer">
            <input
              type="file"
              accept=".txt"
              onChange={onFileUpload}
              className="hidden"
            />
            <Button variant="outline" icon={Upload} type="button">
              Upload File
            </Button>
          </label>

          <Button variant="outline" icon={Plus} onClick={onAddSamples}>
            Add Samples
          </Button>

          <Button variant="outline" icon={Trash2} onClick={onClearAll}>
            Clear All
          </Button>
        </div>

        <FormatOptionsCard
          options={formatOptions}
          onOptionsChange={onFormatOptionsChange}
        />
      </div>
    </Card>
  );
};

/**
 * Result Item Component
 */
interface ResultItemProps {
  result: FormattingResult;
  onCopy: (formatted: string) => void;
  onToggleDetails: (id: string) => void;
  onRemove: (id: string) => void;
}

const ResultItem: React.FC<ResultItemProps> = ({
  result,
  onCopy,
  onToggleDetails,
  onRemove
}) => {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        "p-4 rounded-lg border transition-all",
        theme.surface.default,
        result.isValid
          ? 'border-green-200 bg-green-50/30 dark:bg-green-950/20'
          : 'border-red-200 bg-red-50/30 dark:bg-red-950/20'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {result.isValid ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
            )}
            <Badge variant={result.isValid ? 'success' : 'error'}>
              {getCitationTypeLabel(result.citation?.type || BluebookCitationType.UNKNOWN)}
            </Badge>
          </div>

          <div
            className={cn("text-sm mb-2", theme.text.primary)}
            dangerouslySetInnerHTML={{ __html: result.formatted }}
          />

          {result.formatted !== result.original && (
            <div className={cn("text-xs italic", theme.text.tertiary)}>
              Original: {result.original}
            </div>
          )}

          {result.citation && result.citation.validationErrors.length > 0 && (
            <div className="mt-2 space-y-1">
              {result.citation.validationErrors.map((error, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "text-xs p-2 rounded",
                    error.severity === ValidationSeverity.ERROR
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200'
                  )}
                >
                  <strong>{error.code}:</strong> {error.message}
                  {error.suggestion && (
                    <div className="mt-1 text-[10px] opacity-80">Tip: {error.suggestion}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => onCopy(result.formatted)}
            className={cn(
              "p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
              theme.text.secondary
            )}
            title="Copy"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={() => onToggleDetails(result.id)}
            className={cn(
              "p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
              theme.text.secondary
            )}
            title={result.showDetails ? "Hide Details" : "Show Details"}
          >
            {result.showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            onClick={() => onRemove(result.id)}
            className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
            title="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {result.showDetails && result.citation && (
        <div className={cn("mt-3 pt-3 border-t text-xs", theme.border.default)}>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <strong className={cn(theme.text.tertiary)}>Type:</strong>
              <span className={cn("ml-2", theme.text.secondary)}>
                {result.citation.type}
              </span>
            </div>
            {result.citation.metadata && (
              <div>
                <strong className={cn(theme.text.tertiary)}>Created:</strong>
                <span className={cn("ml-2", theme.text.secondary)}>
                  {new Date(result.citation.metadata.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Results Section Component
 */
interface ResultsSectionProps {
  results: FormattingResult[];
  filteredResults: FormattingResult[];
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onCopy: (formatted: string) => void;
  onCopyAll: () => void;
  onToggleDetails: (id: string) => void;
  onRemove: (id: string) => void;
  onGenerateTOA: () => void;
  onExport: (format: ExportFormat) => void;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({
  results,
  filteredResults,
  filters,
  onFiltersChange,
  onCopy,
  onCopyAll,
  onToggleDetails,
  onRemove,
  onGenerateTOA,
  onExport
}) => {
  const { theme } = useTheme();
  const [showExportMenu, setShowExportMenu] = useState(false);

  if (results.length === 0) {
    return (
      <Card title="Formatted Citations" subtitle="0 citations">
        <div className={cn("py-12 text-center", theme.text.tertiary)}>
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No citations formatted yet</p>
          <p className="text-xs mt-1">Enter citation details above to generate</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Formatted Citations"
      subtitle={`${filteredResults.length} of ${results.length} citations`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={filters.type}
            onChange={(e) => onFiltersChange({
              ...filters,
              type: e.target.value as BluebookCitationType | 'ALL'
            })}
            title="Filter citations by type"
            className={cn(
              "px-3 py-1.5 rounded border text-sm",
              theme.surface.default,
              theme.border.default
            )}
          >
            <option value="ALL">All Types</option>
            <option value={BluebookCitationType.CASE}>Cases Only</option>
            <option value={BluebookCitationType.STATUTE}>Statutes Only</option>
            <option value={BluebookCitationType.CONSTITUTION}>Constitution Only</option>
            <option value={BluebookCitationType.REGULATION}>Regulations Only</option>
            <option value={BluebookCitationType.BOOK}>Books Only</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showOnlyErrors}
              onChange={(e) => onFiltersChange({ ...filters, showOnlyErrors: e.target.checked })}
              className="rounded border-slate-300"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">Errors Only</span>
          </label>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" icon={Copy} size="sm" onClick={onCopyAll}>
            Copy All
          </Button>

          <Button variant="outline" icon={Table} size="sm" onClick={onGenerateTOA}>
            Table of Authorities
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              icon={FileDown}
              size="sm"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              Export
            </Button>
            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowExportMenu(false)}
                />
                <div
                  className={cn(
                    "absolute right-0 top-full mt-1 z-20 py-1 rounded-lg border shadow-lg min-w-[120px]",
                    theme.surface.default,
                    theme.border.default
                  )}
                >
                  <button
                    onClick={() => {
                      onExport(ExportFormat.PLAIN_TEXT);
                      setShowExportMenu(false);
                    }}
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800",
                      theme.text.primary
                    )}
                  >
                    Plain Text
                  </button>
                  <button
                    onClick={() => {
                      onExport(ExportFormat.HTML);
                      setShowExportMenu(false);
                    }}
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800",
                      theme.text.primary
                    )}
                  >
                    HTML
                  </button>
                  <button
                    onClick={() => {
                      onExport(ExportFormat.JSON);
                      setShowExportMenu(false);
                    }}
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800",
                      theme.text.primary
                    )}
                  >
                    JSON
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredResults.map((result) => (
          <ResultItem
            key={result.id}
            result={result}
            onCopy={onCopy}
            onToggleDetails={onToggleDetails}
            onRemove={onRemove}
          />
        ))}

        {filteredResults.length === 0 && (
          <div className="text-center py-12">
            <Info className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className={cn("text-sm", theme.text.secondary)}>
              {filters.showOnlyErrors ? 'No errors found' : 'No citations match the current filter'}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * Help Section Component
 */
const HelpSection: React.FC = () => {
  const { theme } = useTheme();

  const citationTypes = [
    {
      icon: Scale,
      name: 'Case Citation',
      example: 'Brown v. Board of Education, 347 U.S. 483 (1954)',
      color: 'text-blue-600'
    },
    {
      icon: Book,
      name: 'Statute',
      example: '42 U.S.C. \u00A7 1983 (2018)',
      color: 'text-green-600'
    },
    {
      icon: Flag,
      name: 'Constitution',
      example: 'U.S. Const. art. I, \u00A7 8',
      color: 'text-purple-600'
    },
    {
      icon: FileCode,
      name: 'Regulation',
      example: '21 C.F.R. \u00A7 314.126 (2022)',
      color: 'text-amber-600'
    },
    {
      icon: FileText,
      name: 'Book',
      example: 'Richard A. Posner, Economic Analysis of Law 25 (9th ed. 2014)',
      color: 'text-rose-600'
    }
  ];

  return (
    <Card title="Quick Reference">
      <div className={cn("text-sm mb-4", theme.text.secondary)}>
        The Bluebook Formatter supports multiple citation types. Enter citations in any format,
        and they will be automatically parsed and formatted according to The Bluebook (21st ed.) standards.
      </div>

      <div className="space-y-3">
        {citationTypes.map((type, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <type.icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", type.color)} />
            <div className="flex-1 min-w-0">
              <div className={cn("font-medium text-sm mb-1", theme.text.primary)}>
                {type.name}
              </div>
              <div className={cn("text-xs font-mono", theme.text.tertiary)}>
                {type.example}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={cn("mt-4 pt-4 border-t text-xs", theme.border.default, theme.text.tertiary)}>
        <strong>Pro Tips:</strong>
        <ul className="mt-2 space-y-1 pl-4">
          <li>- Enter multiple citations separated by new lines</li>
          <li>- Use &quot;Add Sample Data&quot; to see examples</li>
          <li>- Export to HTML for formatted documents</li>
          <li>- Generate Table of Authorities for briefs</li>
        </ul>
      </div>
    </Card>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export interface BluebookFormatterProps {
  className?: string;
}

export const BluebookFormatter: React.FC<BluebookFormatterProps> = ({ className }) => {
  const { theme } = useTheme();

  // State
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<FormattingResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);
  const [formatOptions, setFormatOptions] = useState<FormatOptions>({
    format: CitationFormat.FULL,
    italicizeCaseNames: true,
    useSmallCaps: true
  });
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'ALL',
    showOnlyErrors: false
  });

  // Defer filter updates for better UX
  const deferredFilters = useDeferredValue(filters);

  // Computed values
  const stats = useFormattingStats(results);
  const filteredResults = useFilteredResults(results, deferredFilters);

  // Notification helper
  const notify = useCallback((type: 'success' | 'warning' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Handlers
  const handleFormat = useCallback(async () => {
    if (!inputText.trim()) {
      notify('warning', 'Please enter citations to format');
      return;
    }

    setIsProcessing(true);
    try {
      const lines = inputText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const newResults: FormattingResult[] = lines.map(line => {
        const citation = BluebookParser.parse(line);
        const formatted = citation
          ? Formatter.format(citation, {
              italicizeCaseNames: formatOptions.italicizeCaseNames,
              useSmallCaps: formatOptions.useSmallCaps,
              format: formatOptions.format
            })
          : line;

        return {
          id: Math.random().toString(36).substr(2, 9),
          original: line,
          citation,
          formatted,
          isValid: citation?.isValid || false,
          showDetails: false
        };
      });

      setResults(newResults);
      const validCount = newResults.filter(r => r.isValid).length;
      notify('success', `Processed ${newResults.length} citations (${validCount} valid)`);
    } catch (error) {
      console.error('Formatting error:', error);
      notify('error', 'Failed to process citations');
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, formatOptions, notify]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setInputText(e.target?.result as string || '');
    reader.readAsText(file);
  }, []);

  const handleAddSamples = useCallback(() => {
    setInputText(prev => prev ? `${prev}\n${SAMPLE_CITATIONS}` : SAMPLE_CITATIONS);
  }, []);

  const handleCopy = useCallback(async (formatted: string) => {
    const success = await copyToClipboard(Formatter.stripFormatting(formatted));
    if (success) {
      notify('success', 'Citation copied to clipboard');
    } else {
      notify('error', 'Failed to copy');
    }
  }, [notify]);

  const handleCopyAll = useCallback(async () => {
    const text = results.map(r => Formatter.stripFormatting(r.formatted)).join('\n\n');
    const success = await copyToClipboard(text);
    if (success) {
      notify('success', `Copied ${results.length} citations`);
    } else {
      notify('error', 'Failed to copy');
    }
  }, [results, notify]);

  const handleToggleDetails = useCallback((id: string) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, showDetails: !r.showDetails } : r));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
  }, []);

  const handleGenerateTOA = useCallback(async () => {
    if (results.length === 0) {
      notify('warning', 'No citations available');
      return;
    }
    openTOAInWindow(results);
    notify('success', 'Table of Authorities generated');
  }, [results, notify]);

  const handleExport = useCallback((format: ExportFormat) => {
    if (results.length === 0) {
      notify('warning', 'No citations to export');
      return;
    }
    switch (format) {
      case ExportFormat.PLAIN_TEXT:
        exportToText(results);
        break;
      case ExportFormat.HTML:
        exportToHTML(results);
        break;
      case ExportFormat.JSON:
        exportToJSON(results);
        break;
    }
    notify('success', `Exported ${results.length} citations`);
  }, [results, notify]);

  return (
    <div className={cn("max-w-6xl mx-auto p-6 space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className={cn("text-3xl font-bold", theme.text.primary)}>
            Bluebook Citation Formatter
          </h1>
          <p className={cn("text-slate-600 dark:text-slate-400")}>
            Format legal citations according to The Bluebook (21st ed.)
          </p>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={cn(
            "p-4 rounded-lg flex items-center justify-between",
            notification.type === 'success' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
            notification.type === 'warning' && 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
            notification.type === 'error' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
          )}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="p-1 hover:opacity-70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats Bar */}
      <StatsBar stats={stats} />

      {/* Input Section */}
      <InputSection
        inputText={inputText}
        onInputChange={setInputText}
        onFileUpload={handleFileUpload}
        onAddSamples={handleAddSamples}
        onClearAll={() => setInputText('')}
        onFormat={handleFormat}
        isProcessing={isProcessing}
        formatOptions={formatOptions}
        onFormatOptionsChange={setFormatOptions}
      />

      {/* Results Section */}
      <ResultsSection
        results={results}
        filteredResults={filteredResults}
        filters={filters}
        onFiltersChange={setFilters}
        onCopy={handleCopy}
        onCopyAll={handleCopyAll}
        onToggleDetails={handleToggleDetails}
        onRemove={handleRemove}
        onGenerateTOA={handleGenerateTOA}
        onExport={handleExport}
      />

      {/* Help Section */}
      <HelpSection />
    </div>
  );
};

export default BluebookFormatter;
