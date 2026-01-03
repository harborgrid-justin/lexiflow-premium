import { Button } from '@/components/ui/atoms/Button/Button';
import { Card } from '@/components/ui/molecules/Card/Card';
import { useTheme } from '@/providers';
import { BluebookCitationType, ExportFormat } from '@/types/bluebook';
import { cn } from '@/utils/cn';
import { Copy, FileDown, FileText, Filter, Info, Table } from 'lucide-react';
import React from 'react';
import { ResultItem } from './ResultItem';
import type { FilterOptions, FormattingResult } from './types';

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

export const ResultsSection: React.FC<ResultsSectionProps> = ({
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

  // LAYOUT-STABLE: Render empty state with same card structure instead of null
  if (results.length === 0) {
    return (
      <Card
        title="Formatted Citations"
        subtitle="0 citations"
      >
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
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onFiltersChange({ ...filters, type: e.target.value as BluebookCitationType | 'ALL' })}
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFiltersChange({ ...filters, showOnlyErrors: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-slate-600">Errors Only</span>
          </label>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" icon={Copy} size="sm" onClick={onCopyAll}>
            Copy All
          </Button>

          <Button variant="outline" icon={Table} size="sm" onClick={onGenerateTOA}>
            Table of Authorities
          </Button>

          <div className="relative group">
            <Button variant="outline" icon={FileDown} size="sm">
              Export
            </Button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-10">
              <div className={cn("py-1 rounded-lg border shadow-lg", theme.surface.default, theme.border.default)}>
                <button
                  onClick={() => onExport(ExportFormat.PLAIN_TEXT)}
                  className={cn("w-full px-4 py-2 text-left text-sm hover:bg-slate-100", theme.text.primary)}
                >
                  Plain Text
                </button>
                <button
                  onClick={() => onExport(ExportFormat.HTML)}
                  className={cn("w-full px-4 py-2 text-left text-sm hover:bg-slate-100", theme.text.primary)}
                >
                  HTML
                </button>
                <button
                  onClick={() => onExport(ExportFormat.JSON)}
                  className={cn("w-full px-4 py-2 text-left text-sm hover:bg-slate-100", theme.text.primary)}
                >
                  JSON
                </button>
              </div>
            </div>
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
