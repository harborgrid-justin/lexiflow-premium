
import React from 'react';
import { TimelineEvent } from '../../../types';
import { useQuery } from '../../../services/queryClient';
import { DataService } from '../../../services/dataService';
import { STORES } from '../../../services/db';
import { Flag, Calendar, Plus, Loader2, Link } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

interface FactIntegratorProps {
  caseId: string;
  onInsertFact: (text: string) => void;
}

export const FactIntegrator: React.FC<FactIntegratorProps> = ({ caseId, onInsertFact }) => {
  const { theme } = useTheme();

  // Cross-Module Integration: Fetching from Case Domain
  const { data: caseData, isLoading } = useQuery(
    [STORES.CASES, caseId],
    () => DataService.cases.getById(caseId)
  );

  // Mocking timeline events derivation (normally comes from hooks/useCaseDetail)
  // In a real scenario, we'd reuse the hook or move the derivation to DataService
  const timelineEvents: TimelineEvent[] = [
      { id: 'ev1', date: '2023-11-15', title: 'Complaint Filed', type: 'milestone', description: 'Original filing date.' },
      { id: 'ev2', date: '2023-12-01', title: 'Breach of Contract', type: 'milestone', description: 'Defendant failed to deliver goods per Schedule A.' },
      { id: 'ev3', date: '2024-01-10', title: 'Notice of Default', type: 'document', description: 'Plaintiff sent formal notice of default via certified mail.' },
  ];

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-5 w-5 text-blue-600"/></div>;

  return (
    <div className="flex flex-col h-full">
      <div className={cn("p-4 border-b", theme.border.default)}>
        <h3 className={cn("text-sm font-bold flex items-center", theme.text.primary)}>
          <Link className="h-4 w-4 mr-2" /> Fact Integration
        </h3>
        <p className={cn("text-xs mt-1", theme.text.secondary)}>Insert facts directly from case timeline.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {timelineEvents.map((evt) => (
          <div key={evt.id} className={cn("p-3 rounded-lg border group hover:border-blue-300 transition-colors", theme.surface.default, theme.border.default)}>
             <div className="flex justify-between items-start mb-1">
                <span className={cn("flex items-center text-xs font-bold", theme.primary.text)}>
                  <Calendar className="h-3 w-3 mr-1" /> {evt.date}
                </span>
                <span className={cn("text-[10px] px-1.5 rounded uppercase", theme.surfaceHighlight, theme.text.tertiary)}>{evt.type}</span>
             </div>
             <p className={cn("text-sm font-medium mb-1", theme.text.primary)}>{evt.title}</p>
             <p className={cn("text-xs line-clamp-2", theme.text.secondary)}>{evt.description}</p>
             
             <button 
                onClick={() => onInsertFact(`On ${evt.date}, ${evt.description}`)}
                className={cn("w-full mt-3 flex items-center justify-center py-1.5 rounded text-xs font-medium bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100")}
             >
                <Plus className="h-3 w-3 mr-1" /> Insert Paragraph
             </button>
          </div>
        ))}
        {timelineEvents.length === 0 && (
            <div className="text-center text-xs text-slate-400 py-4">No facts found in case timeline.</div>
        )}
      </div>
    </div>
  );
};
