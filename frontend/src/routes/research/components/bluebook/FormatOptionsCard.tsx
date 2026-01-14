import { Settings } from 'lucide-react';
import { useTheme } from '@/theme';
import { cn } from '@/shared/lib/cn';
import { CitationFormat } from '@/types/bluebook';
import type { FormatOptions } from './types';
import React from "react";

interface FormatOptionsCardProps {
  options: FormatOptions;
  formatStyle: CitationFormat;
  onOptionsChange: (options: FormatOptions) => void;
  onFormatStyleChange: (style: CitationFormat) => void;
}

export function FormatOptionsCard({
  options,
  formatStyle,
  onOptionsChange,
  onFormatStyleChange
}) => {
  const { theme } = useTheme();

  return (
    <div className={cn("p-4 rounded-lg border", theme.surface.highlight, theme.border.default)}>
      <div className="flex items-center gap-2 mb-3">
        <Settings className="h-4 w-4 text-slate-500" />
        <h4 className={cn("font-bold text-sm", theme.text.primary)}>Format Options</h4>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={options.italicizeCaseNames}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onOptionsChange({ ...options, italicizeCaseNames: e.target.checked })}
            className="rounded"
          />
          <span className={cn("text-sm", theme.text.secondary)}>Italicize Case Names</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={options.useSmallCaps}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onOptionsChange({ ...options, useSmallCaps: e.target.checked })}
            className="rounded"
          />
          <span className={cn("text-sm", theme.text.secondary)}>Use Small Caps</span>
        </label>

        <div>
          <label className={cn("text-xs uppercase font-bold mb-1 block", theme.text.tertiary)}>
            Citation Format
          </label>
          <select
            value={formatStyle}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onFormatStyleChange(e.target.value as CitationFormat)}
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
