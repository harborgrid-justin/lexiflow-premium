/**
 * ArgumentList.tsx
 *
 * Scrollable list of legal arguments with risk meters, status badges,
 * and selection highlighting.
 *
 * @module components/case-detail/arguments/ArgumentList
 * @category Case Management - Arguments
 */

// External Dependencies
import React from 'react';
import { Scale, Fingerprint, ChevronRight } from 'lucide-react';

// Internal Dependencies - Components
import { RiskMeter } from '@/features/cases/ui/components/RiskMeter/RiskMeter';
import { Badge } from '@/shared/ui/atoms/Badge';

// Internal Dependencies - Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';

// Internal Dependencies - Services & Utils
import { cn } from '@/shared/lib/cn';

// Types & Interfaces
import { LegalArgument } from '@/types';

interface ArgumentListProps {
  argumentsList: LegalArgument[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const ArgumentList: React.FC<ArgumentListProps> = ({ argumentsList, selectedId, onSelect }) => {
  const { theme } = useTheme();

  if (argumentsList.length === 0) {
      return (
          <div className={cn("flex flex-col items-center justify-center h-full p-8 text-center", theme.text.tertiary)}>
              <p>No arguments found matching your criteria.</p>
          </div>
      );
  }

  return (
    <div className={cn("flex-1 overflow-y-auto p-4 space-y-3", theme.surface.highlight)}>
        {argumentsList.map(arg => (
            <div
                key={arg.id}
                onClick={() => onSelect(arg.id)}
                className={cn(
                    "group relative p-5 rounded-xl border transition-all cursor-pointer hover:shadow-md",
                    theme.surface.default,
                    selectedId === arg.id
                        ? cn(theme.action.primary.border, "ring-1 shadow-md z-10")
                        : cn(theme.border.default, `hover:${theme.primary.border}`)
                )}
            >
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 pr-4">
                        <h4 className={cn("font-bold text-base mb-1", theme.text.primary)}>{arg.title}</h4>
                        <p className={cn("text-xs line-clamp-2 leading-relaxed", theme.text.secondary)}>{arg.description}</p>
                    </div>
                    <Badge variant={arg.status === 'Active' ? 'success' : arg.status === 'Draft' ? 'warning' : 'neutral'}>
                        {arg.status}
                    </Badge>
                </div>

                <div className={cn("flex items-center justify-between pt-4 border-t", theme.border.default)}>
                    <div className="flex gap-3">
                        <div className={cn("flex items-center text-xs px-2 py-1 rounded border", theme.surface.highlight, theme.action.primary.text, theme.border.default, !arg.relatedCitationIds.length && "opacity-50 grayscale")}>
                            <Scale className="h-3 w-3 mr-1.5"/>
                            <span className="font-bold">{arg.relatedCitationIds.length}</span>
                        </div>
                        <div className={cn("flex items-center text-xs px-2 py-1 rounded bg-amber-50 text-amber-700 border border-amber-100", (!arg.relatedEvidenceIds || !arg.relatedEvidenceIds.length) && "opacity-50 grayscale")}>
                            <Fingerprint className="h-3 w-3 mr-1.5"/>
                            <span className="font-bold">{arg.relatedEvidenceIds?.length || 0}</span>
                        </div>
                    </div>

                    <div className="w-32">
                        <RiskMeter value={arg.strength} label="Win Probability" />
                    </div>
                </div>

                <div className={cn("absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity", selectedId === arg.id && cn("opacity-100", theme.action.primary.text))}>
                    <ChevronRight className="h-6 w-6"/>
                </div>
            </div>
        ))}
    </div>
  );
};
