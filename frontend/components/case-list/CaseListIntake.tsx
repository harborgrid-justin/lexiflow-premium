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
import { Modal } from '../common/Modal';
import { Input, TextArea } from '../common/Inputs';
import { Button } from '../common/Button';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';
import { useQuery, useMutation, queryClient } from '../../hooks/useQueryHooks';
import { useNotify } from '../../hooks/useNotify';
import { useModalState } from '../../hooks';

// Services & Utils
import { DataService } from '../../services/data/dataService';
import { cn } from '../../utils/cn';

export const CaseListIntake: React.FC = () => {
  const { theme } = useTheme();
  const { success, error: notifyError } = useNotify();
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const leadModal = useModalState();
  const [newLead, setNewLead] = useState<any>({});

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
          const current = queryClient.getQueryState<any[]>(['crm', 'leads'])?.data || [];
          const updated = current.map(l => l.id === id ? { ...l, stage, updatedAt: new Date().toISOString() } : l);
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
      async (leadData: any) => {
          const lead = {
              ...leadData,
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
              const current = queryClient.getQueryState<any[]>(['crm', 'leads'])?.data || [];
              queryClient.setQueryData(['crm', 'leads'], [...current, newLead]);
              success('Lead added successfully');
              setIsLeadModalOpen(false);
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
      setIsLeadModalOpen(true);
  };

  const handleSaveLead = () => {
      if (!newLead.name || !newLead.contactEmail) {
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
            {leads.filter((l: any) => l.stage === stage).length === 0 ? (
              <div className={cn("text-center py-8 text-xs", theme.text.tertiary)}>
                No leads in this stage
              </div>
            ) : (
              leads.filter((l: any) => l.stage === stage).map((lead: any) => (
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
            ))
          )}
          </KanbanColumn>
        ))}
      </KanbanBoard>

      {/* Lead Intake Modal */}
      <Modal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} title="New Lead Intake">
        <div className="p-6 space-y-4">
          <Input 
            label="Client Name" 
            placeholder="e.g., John Doe" 
            value={newLead.name || ''} 
            onChange={(e) => setNewLead({...newLead, name: e.target.value, client: e.target.value})} 
            required
          />
          <Input 
            label="Contact Email" 
            type="email"
            placeholder="client@example.com" 
            value={newLead.contactEmail || ''} 
            onChange={(e) => setNewLead({...newLead, contactEmail: e.target.value})} 
            required
          />
          <Input 
            label="Phone" 
            type="tel"
            placeholder="(555) 123-4567" 
            value={newLead.contactPhone || ''} 
            onChange={(e) => setNewLead({...newLead, contactPhone: e.target.value})} 
          />
          <Input 
            label="Matter Title" 
            placeholder="Brief description of matter" 
            value={newLead.title || ''} 
            onChange={(e) => setNewLead({...newLead, title: e.target.value})} 
          />
          <Input 
            label="Estimated Value" 
            type="number"
            placeholder="50000" 
            value={newLead.value?.replace(/[^0-9]/g, '') || ''} 
            onChange={(e) => setNewLead({...newLead, value: `$${e.target.value}`})} 
          />
          <TextArea 
            label="Notes" 
            rows={4} 
            placeholder="Initial consultation notes..." 
            value={newLead.notes || ''} 
            onChange={(e) => setNewLead({...newLead, notes: e.target.value})} 
          />
          <div className={cn("flex justify-end gap-2 pt-4 border-t", theme.border.default)}>
            <Button variant="ghost" onClick={() => setIsLeadModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveLead}>Add Lead</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

