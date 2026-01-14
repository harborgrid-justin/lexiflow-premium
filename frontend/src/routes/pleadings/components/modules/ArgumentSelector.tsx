import { Target, GripVertical, ArrowRight } from 'lucide-react';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
// ✅ Migrated to backend API (2025-12-21)
import { queryKeys } from '@/utils/queryKeys';
import { Case, LegalArgument } from '@/types';
import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';

interface ArgumentSelectorProps {
  caseId: string;
  onInsertArgument: (arg: LegalArgument) => void;
}

export const ArgumentSelector: React.FC<ArgumentSelectorProps> = ({ caseId, onInsertArgument }) => {
  const { theme } = useTheme();

  const { data: caseData } = useQuery<Case>(
    queryKeys.cases.detail(caseId),
    () => DataService.cases.getById(caseId)
  );

  const argumentsList = caseData?.arguments || [];

  return (
    <div className="flex flex-col h-full">
        <div className={cn("p-4 border-b", theme.border.default)}>
            <h3 className={cn("text-sm font-bold flex items-center", theme.text.primary)}>
                <Target className="h-4 w-4 mr-2 text-blue-600" /> Strategic Arguments
            </h3>
            <p className={cn("text-xs mt-1", theme.text.secondary)}>Insert pre-formulated arguments from your case strategy.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {argumentsList.length === 0 && (
                <div className={cn("text-center py-8 italic text-xs", theme.text.tertiary)}>
                    No arguments defined in Case Strategy.
                </div>
            )}

            {argumentsList.map((arg) => (
                <div key={arg.id} className={cn("p-3 rounded-lg border group hover:shadow-sm transition-all", theme.surface.default, theme.border.default, `hover:${theme.primary.border}`)}>
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded", theme.surface.highlight, theme.text.primary)}>
                                {arg.strength}% Strength
                            </span>
                        </div>
                        <GripVertical className="h-4 w-4 text-slate-300 cursor-grab active:cursor-grabbing"/>
                    </div>
                    
                    <h4 className={cn("font-bold text-sm mb-1", theme.text.primary)}>{arg.title}</h4>
                    <p className={cn("text-xs line-clamp-3 mb-3", theme.text.secondary)}>{arg.description}</p>
                    
                    <div className={cn("flex items-center justify-between pt-2 border-t", theme.border.default)}>
                         <div className="flex gap-1">
                             {arg.relatedCitationIds.length > 0 && <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 rounded">{arg.relatedCitationIds.length} Cites</span>}
                             {arg.relatedEvidenceIds.length > 0 && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 rounded">{arg.relatedEvidenceIds.length} Evid</span>}
                         </div>
                         <button 
                            onClick={() => onInsertArgument(arg)}
                            className={cn("text-xs font-bold text-blue-600 flex items-center hover:underline")}
                         >
                             Insert <ArrowRight className="h-3 w-3 ml-1"/>
                         </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

