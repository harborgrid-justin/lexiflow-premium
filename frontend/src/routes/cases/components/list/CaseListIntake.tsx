/**
 * CaseListIntake.tsx
 *
 * Kanban board for lead intake and case conversion pipeline.
 * Drag-and-drop workflow from initial contact through case creation.
 *
 * @module components/case-list/CaseListIntake
 * @category Case Management - Intake Pipeline
 *
 * REACT V18 CONTEXT CONSUMPTION COMPLIANCE:
 * - Guideline 21: Pure render logic with drag-drop state management
 * - Guideline 28: Theme usage is pure function for Kanban styling
 * - Guideline 34: useTheme() is side-effect free read
 * - Guideline 33: Uses isPendingThemeChange for intake board transitions
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Calendar, DollarSign, Plus } from 'lucide-react';
import { useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { KanbanBoard, KanbanCard, KanbanColumn } from '@/routes/cases/ui/components/Kanban/Kanban';
import { Button } from '@/shared/ui/atoms/Button';
import { Input } from '@/shared/ui/atoms/Input';
import { TextArea } from '@/shared/ui/atoms/TextArea';
import { AdaptiveLoader } from '@/shared/ui/molecules/AdaptiveLoader/AdaptiveLoader';
import { Modal } from '@/shared/ui/molecules/Modal';

// Hooks & Context
import { useTheme } from '@/theme';
import { useModalState } from '@/hooks/useModalState';
import { useNotify } from '@/hooks/useNotify';
import { queryClient, useMutation, useQuery } from '@/hooks/useQueryHooks';

// Services & Utils
import { DataService } from '@/services/data/dataService';
import { cn } from '@/shared/lib/cn';

export const CaseListIntake: React.FC = () => {
  // Guideline 34: Side-effect free context read
  const { theme, isPendingThemeChange } = useTheme();
  const { success, error: notifyError } = useNotify();
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const leadModal = useModalState();
  const [newLead, setNewLead] = useState<Record<string, unknown>>({});

  // Performance Engine: useQuery for Caching & Stale-While-Revalidate
  const { data: leads = [], isLoading } = useQuery(
    ['crm', 'leads'],
    DataService.crm.getLeads
  );

  // Performance Engine: useMutation for Sync Queue
  const { mutate: updateStage } = useMutation(
    async ({ id, stage }: { id: string, stage: string }) => {
      // Update via DataService
      await DataService.crm.updateLead(id, { stage, updatedAt: new Date().toISOString() });

      // Return updated cache state
      const current = queryClient.getQueryState<unknown[]>(['crm', 'leads'])?.data || [];
      const updated = current.map((l: unknown) => (l as { id: string }).id === id ? { ...(l as object), stage, updatedAt: new Date().toISOString() } : l);
      return updated;
    },
    {
      onSuccess: (updatedData) => {
        queryClient.setQueryData(['crm', 'leads'], updatedData);
        success('Lead stage updated');
      },
      onError: (error: Error) => {
        notifyError(`Failed to update stage: ${error.message}`);
      }
    }
  );

  // Mutation for adding new leads
  const { mutate: addLead } = useMutation(
    async (leadData: unknown) => {
      const lead = {
        ...(leadData && typeof leadData === 'object' ? leadData : {}),
        id: crypto.randomUUID(),
        stage: 'New Lead',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await DataService.crm.addLead(lead);
      return lead;
    },
    {
      onSuccess: (newLead) => {
        const current = queryClient.getQueryState<unknown[]>(['crm', 'leads'])?.data || [];
        queryClient.setQueryData(['crm', 'leads'], [...current, newLead]);
        success('Lead added successfully');
        leadModal.close();
        setNewLead({});
      },
      onError: (error: Error) => {
        notifyError(`Failed to add lead: ${error.message}`);
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
    leadModal.open();
  };

  const handleSaveLead = () => {
    if (typeof newLead !== 'object' || newLead === null) {
      notifyError('Invalid lead data');
      return;
    }
    const hasName = 'name' in newLead && newLead.name;
    const hasEmail = 'contactEmail' in newLead && newLead.contactEmail;
    if (!hasName || !hasEmail) {
      notifyError('Name and email are required');
      return;
    }
    addLead(newLead);
  };

  const stages = ['New Lead', 'Conflict Check', 'Engagement', 'Matter Created'];

  if (isLoading) return <AdaptiveLoader contentType="dashboard" itemCount={6} shimmer />;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className={cn("font-bold", theme.text.primary)}>Pipeline Board</h3>
      </div>

      <KanbanBoard>
        {stages.map((stage, idx) => {
          const stageLeads = (Array.isArray(leads) ? leads : []).filter((l: unknown) => {
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
                  <Plus className="h-3 w-3 mr-1" /> Add Lead
                </button>
              ) : undefined}
            >
              {stageLeads.length === 0 ? (
                <div className={cn("text-center py-8 text-xs", theme.text.tertiary)}>
                  No leads in this stage
                </div>
              ) : (
                stageLeads.map((lead: unknown) => {
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
                          <DollarSign className="h-3 w-3 mr-0.5" />
                          {leadValue.replace('$', '')}
                        </span>
                        <span className={cn("flex items-center gap-1", theme.text.tertiary)}>
                          <Calendar className="h-3 w-3" /> {leadDate}
                        </span>
                      </div>
                    </KanbanCard>
                  );
                })
              )}
            </KanbanColumn>
          );
        })}
      </KanbanBoard>

      {/* Lead Intake Modal */}
      <Modal isOpen={leadModal.isOpen} onClose={leadModal.close} title="New Lead Intake">
        <div className="p-6 space-y-4">
          <Input
            label="Client Name"
            placeholder="e.g., John Doe"
            value={typeof newLead === 'object' && newLead !== null && 'name' in newLead && typeof newLead.name === 'string' ? newLead.name : ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLead({ ...newLead as object, name: e.target.value, client: e.target.value })}
            required
          />
          <Input
            label="Contact Email"
            type="email"
            placeholder="client@example.com"
            value={typeof newLead === 'object' && newLead !== null && 'contactEmail' in newLead && typeof newLead.contactEmail === 'string' ? newLead.contactEmail : ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLead({ ...newLead as object, contactEmail: e.target.value })}
            required
          />
          <Input
            label="Phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={typeof newLead === 'object' && newLead !== null && 'contactPhone' in newLead && typeof newLead.contactPhone === 'string' ? newLead.contactPhone : ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLead({ ...newLead as object, contactPhone: e.target.value })}
          />
          <Input
            label="Matter Title"
            placeholder="Brief description of matter"
            value={typeof newLead === 'object' && newLead !== null && 'title' in newLead && typeof newLead.title === 'string' ? newLead.title : ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLead({ ...newLead as object, title: e.target.value })}
          />
          <Input
            label="Estimated Value"
            type="number"
            placeholder="50000"
            value={typeof newLead === 'object' && newLead !== null && 'value' in newLead && typeof newLead.value === 'string' ? newLead.value.replace(/[^0-9]/g, '') : ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLead({ ...newLead as object, value: `$${e.target.value}` })}
          />
          <TextArea
            label="Notes"
            rows={4}
            placeholder="Initial consultation notes..."
            value={typeof newLead === 'object' && newLead !== null && 'notes' in newLead && typeof newLead.notes === 'string' ? newLead.notes : ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewLead({ ...newLead as object, notes: e.target.value })}
          />
          <div className={cn("flex justify-end gap-2 pt-4 border-t", theme.border.default)}>
            <Button variant="ghost" onClick={leadModal.close}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveLead}>Add Lead</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
