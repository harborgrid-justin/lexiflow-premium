/**
 * CaseListIntake.tsx
 * 
 * Kanban board for lead intake and case conversion pipeline.
 * Drag-and-drop workflow from initial contact through case creation.
 * 
 * @module components/case-list/CaseListIntake
 * @category Case Management - Intake Pipeline
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState } from 'react';
import { Calendar, Plus, DollarSign, Loader2 } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { KanbanBoard, KanbanColumn, KanbanCard } from '../common/Kanban';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';
import { useQuery, useMutation, queryClient } from '../../services/queryClient';

// Services & Utils
import { DataService } from '../../services/dataService';
import { cn } from '../../utils/cn';

export const CaseListIntake: React.FC = () => {
  const { theme } = useTheme();
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  // Performance Engine: useQuery for Caching & Stale-While-Revalidate
  const { data: leads = [], isLoading } = useQuery(
      ['crm', 'leads'],
      DataService.crm.getLeads
  );

  // Performance Engine: useMutation for Sync Queue
  const { mutate: updateStage } = useMutation(
      async ({ id, stage }: { id: string, stage: string }) => {
          // In a real scenario, we'd call an API endpoint. 
          // For local simulation, we update the cache directly to mimic optimistic UI
          const current = queryClient.getQueryState<any[]>(['crm', 'leads'])?.data || [];
          const updated = current.map(l => l.id === id ? { ...l, stage } : l);
          // Determine which service method to call based on architecture
          // DataService.crm.updateLead(id, { stage }); 
          return updated;
      },
      {
          onSuccess: (updatedData) => {
              queryClient.setQueryData(['crm', 'leads'], updatedData);
          }
      }
  );

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (stage: string) => {
    if (draggedLeadId !== null) {
      updateStage({ id: draggedLeadId, stage });
    }
    setDraggedLeadId(null);
    setDragOverStage(null);
  };

  const handleAddLead = () => {
      // Simple mock addition for UI demo
      alert("Lead intake wizard would open here.");
  };

  const stages = ['New Lead', 'Conflict Check', 'Engagement', 'Matter Created'];

  if (isLoading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className={cn("font-bold", theme.text.primary)}>Pipeline Board</h3>
      </div>
      
      <KanbanBoard>
        {stages.map((stage, idx) => (
          <KanbanColumn 
            key={stage} 
            title={stage} 
            count={leads.filter((l: any) => l.stage === stage).length}
            isDragOver={dragOverStage === stage}
            onDrop={() => handleDrop(stage)}
            action={idx === 0 ? (
              <button 
                onClick={handleAddLead}
                className={cn(
                  "mt-3 w-full py-2 border-2 border-dashed rounded-lg text-xs font-bold transition-all flex items-center justify-center",
                  theme.border.default,
                  theme.text.secondary,
                  `hover:${theme.surface.default}`,
                  `hover:${theme.primary.text}`,
                  `hover:${theme.primary.border}`
                )}
              >
                <Plus className="h-3 w-3 mr-1"/> Add Lead
              </button>
            ) : undefined}
          >
            {leads.filter((l: any) => l.stage === stage).map((lead: any) => (
              <KanbanCard
                key={lead.id}
                onDragStart={(e) => handleDragStart(e, lead.id)}
                isDragging={draggedLeadId === lead.id}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className={cn("font-bold text-sm line-clamp-1 transition-colors", theme.text.primary, `group-hover:${theme.primary.text}`)}>{lead.client}</h4>
                </div>
                <p className={cn("text-xs mb-3 line-clamp-1", theme.text.secondary)}>{lead.title}</p>
                <div className={cn("flex justify-between items-center text-xs pt-2 border-t", theme.border.default)}>
                  <span className={cn("font-mono font-medium flex items-center", theme.status.success.text)}>
                      <DollarSign className="h-3 w-3 mr-0.5"/>
                      {lead.value.replace('$','')}
                  </span>
                  <span className={cn("flex items-center gap-1", theme.text.tertiary)}>
                    <Calendar className="h-3 w-3"/> {lead.date}
                  </span>
                </div>
              </KanbanCard>
            ))}
          </KanbanColumn>
        ))}
      </KanbanBoard>
    </div>
  );
};
