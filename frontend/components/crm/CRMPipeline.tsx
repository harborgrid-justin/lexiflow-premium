import React, { useState } from 'react';
import { Calendar, Plus, DollarSign, Loader2 } from 'lucide-react';
import { KanbanBoard, KanbanColumn, KanbanCard } from '../common/Kanban';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { useQuery, useMutation, queryClient } from '../../services/queryClient';
import { useNotify } from '../../hooks/useNotify';

interface CRMPipelineProps {
  leads: any[];
}

export const CRMPipeline: React.FC<CRMPipelineProps> = ({ leads }) => {
  const { theme } = useTheme();
  const { notifySuccess } = useNotify();
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [showIntakeModal, setShowIntakeModal] = useState(false);

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
  
  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDrop = (stage: string) => {
    if (draggedLeadId !== null) {
      updateStage({ id: draggedLeadId, stage });
    }
    setDraggedLeadId(null);
    setDragOverStage(null);
  };

  const handleAddLead = () => {
      setShowIntakeModal(true);
      notifySuccess('Lead intake wizard opened. Use "New Intake" button in header to add leads.');
  };

  const stages = ['New Lead', 'Conflict Check', 'Engagement', 'Matter Created'];

  return (
    <div className="flex flex-col h-full">
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
export default CRMPipeline;