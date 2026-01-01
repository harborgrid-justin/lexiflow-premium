import React from 'react';
import { Copy, Eye, EyeOff, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/atoms/Badge/Badge';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { ValidationSeverity } from '@/types/bluebook';
import type { FormattingResult } from './types';

interface ResultItemProps {
  result: FormattingResult;
  onCopy: (formatted: string) => void;
  onToggleDetails: (id: string) => void;
  onRemove: (id: string) => void;
}

export const ResultItem: React.FC<ResultItemProps> = ({
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
        result.isValid ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'
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
            <Badge variant="neutral">
              {result.citation?.type || 'Unknown'}
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
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  )}
                >
                  <strong>{error.code}:</strong> {error.message}
                  {error.suggestion && (
                    <div className="mt-1 text-[10px]">💡 {error.suggestion}</div>
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
              "p-2 rounded hover:bg-slate-100 transition-colors",
              theme.text.secondary
            )}
            title="Copy"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={() => onToggleDetails(result.id)}
            className={cn(
              "p-2 rounded hover:bg-slate-100 transition-colors",
              theme.text.secondary
            )}
            title={result.showDetails ? "Hide Details" : "Show Details"}
          >
            {result.showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            onClick={() => onRemove(result.id)}
            className="p-2 rounded hover:bg-red-100 text-red-600 transition-colors"
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
