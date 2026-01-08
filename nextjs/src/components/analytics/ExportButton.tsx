'use client';

/**
 * ExportButton Component
 * Button with dropdown for exporting analytics data
 *
 * @component
 */

import { Button } from '@/components/ui/shadcn/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import { cn } from '@/lib/utils';
import type { ExportFormat } from '@/types/analytics-module';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import * as React from 'react';

interface ExportButtonProps {
  onExport: (format: ExportFormat) => void;
  isExporting?: boolean;
  className?: string;
}

const EXPORT_OPTIONS: Array<{ format: ExportFormat; label: string; icon: React.ReactNode }> = [
  { format: 'csv', label: 'CSV', icon: <FileSpreadsheet className="h-4 w-4" /> },
  { format: 'xlsx', label: 'Excel', icon: <FileSpreadsheet className="h-4 w-4" /> },
  { format: 'pdf', label: 'PDF', icon: <FileText className="h-4 w-4" /> },
];

export function ExportButton({
  onExport,
  isExporting,
  className,
}: ExportButtonProps): React.JSX.Element {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleExport = React.useCallback(
    (format: ExportFormat) => {
      onExport(format);
      setIsOpen(false);
    },
    [onExport]
  );

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="gap-2"
      >
        <Download className={cn('h-4 w-4', isExporting && 'animate-pulse')} />
        {isExporting ? 'Exporting...' : 'Export'}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          {/* Dropdown */}
          <div className="absolute right-0 z-50 mt-2 w-40 rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
            {EXPORT_OPTIONS.map((option) => (
              <button
                key={option.format}
                type="button"
                onClick={() => handleExport(option.format)}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

ExportButton.displayName = 'ExportButton';
