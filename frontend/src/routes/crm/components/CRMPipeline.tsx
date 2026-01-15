import { useState } from 'react';
import { Calendar, Plus, DollarSign } from 'lucide-react';
import { useModalState } from '@/hooks/core';
import { KanbanBoard, KanbanColumn, KanbanCard } from '@/routes/cases/ui/components/Kanban/Kanban';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/cn';
import { useMutation, queryClient } from '@/hooks/useQueryHooks';
import { useNotify } from '@/hooks/useNotify';

interface CRMPipelineProps {
  leads: unknown[];
}

export const CRMPipeline = ({ leads }: CRMPipelineProps) => {
  const { theme } = useTheme();
  const { success: notifySuccess } = useNotify();
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const intakeModal = useModalState();

  // Performance Engine: useMutation for Sync Queue
  const { mutate: updateStage } = useMutation(
      async ({ id, stage }: { id: string, stage: string }) => {
          // In a real scenario, we'd call an API endpoint.
          // For local simulation, we update the cache directly to mimic optimistic UI
          const current = queryClient.getQueryState<unknown[]>(['crm', 'leads'])?.data || [];
          const updated = current.map((l: unknown) => (l as {id: string}).id === id ? { ...(l as object), stage } : l);
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
      intakeModal.open();
      notifySuccess('Lead intake wizard opened. Use "New Intake" button in header to add leads.');
  };

  const stages = ['New Lead', 'Conflict Check', 'Engagement', 'Matter Created'];

  return (
    <div className="flex flex-col h-full">
      <KanbanBoard>
        {stages.map((stage, idx) => {
          const stageLeads = leads.filter((l: unknown) => {
            return typeof l === 'object' && l !== null && 'stage' in l && l.stage === stage;
          });

          return (
          <KanbanColumn
            key={stage}
            title={stage}
            count={stageLeads.length}
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
            {stageLeads.map((lead: unknown) => {
              if (typeof lead !== 'object' || lead === null) return null;
              const leadId = 'id' in lead ? String(lead.id) : '';
              const leadClient = 'client' in lead && typeof lead.client === 'string' ? lead.client : '';
              const leadTitle = 'title' in lead && typeof lead.title === 'string' ? lead.title : '';
              const leadValue = 'value' in lead && typeof lead.value === 'string' ? lead.value : '$0';
              const leadDate = 'date' in lead && typeof lead.date === 'string' ? lead.date : '';

              return (
              <KanbanCard
                key={leadId}
                onDragStart={(e) => handleDragStart(e, leadId)}
                isDragging={draggedLeadId === leadId}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className={cn("font-bold text-sm line-clamp-1 transition-colors", theme.text.primary, `group-hover:${theme.primary.text}`)}>{leadClient}</h4>
                </div>
                <p className={cn("text-xs mb-3 line-clamp-1", theme.text.secondary)}>{leadTitle}</p>
                <div className={cn("flex justify-between items-center text-xs pt-2 border-t", theme.border.default)}>
                  <span className={cn("font-mono font-medium flex items-center", theme.status.success.text)}>
                      <DollarSign className="h-3 w-3 mr-0.5"/>
                      {leadValue.replace('$','')}
                  </span>
                  <span className={cn("flex items-center gap-1", theme.text.tertiary)}>
                    <Calendar className="h-3 w-3"/> {leadDate}
                  </span>
                </div>
              </KanbanCard>
              );
            })}
          </KanbanColumn>
          );
        })}
      </KanbanBoard>
    </div>
  );
};
export default CRMPipeline;
