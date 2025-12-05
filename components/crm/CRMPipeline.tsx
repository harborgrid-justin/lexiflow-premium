
import React, { useState } from 'react';
import { KanbanBoard, KanbanColumn, KanbanCard } from '../common/Kanban';
import { Plus, Calendar, DollarSign, User, Briefcase, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { useQuery, useMutation, queryClient } from '../../services/queryClient';
import { Case, CaseStatus } from '../../types';
import { useNotify } from '../../hooks/useNotify';

interface Lead {
  id: string;
  title: string;
  client: string;
  value: string;
  stage: string;
  date: string;
  owner: string;
}

export const CRMPipeline: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const stages = ['New Lead', 'Conflict Check', 'Engagement', 'Active Matter', 'Closed/Lost'];

  // Enterprise Data Access
  const { data: leads = [] } = useQuery<Lead[]>(
      ['crm', 'leads'],
      DataService.crm.getLeads
  );

  // Mutation for converting lead to case
  const { mutate: convertToCase } = useMutation(
    async (lead: Lead) => {
       const newCase: Case = {
          id: `CASE-${Date.now()}`,
          title: lead.title,
          client: lead.client,
          matterType: 'General',
          status: CaseStatus.Discovery,
          filingDate: new Date().toISOString().split('T')[0],
          description: `Converted from Lead ${lead.id}`,
          value: parseInt(lead.value.replace(/[^0-9]/g, '')) || 0,
          jurisdiction: 'Pending',
          court: 'Pending',
          judge: 'Unassigned',
          opposingCounsel: 'Pending',
          parties: [],
          citations: [],
          arguments: [],
          defenses: []
       };
       return DataService.cases.add(newCase);
    },
    {
      onSuccess: (data) => {
         notify.success(`Lead converted to Case: ${data.title}`);
         queryClient.invalidate(['crm', 'leads']); // Refresh leads if removed/updated
      }
    }
  );

  // Mock Mutation for updating lead stage
  const { mutate: moveLead } = useMutation(
      async (payload: { id: string, stage: string }) => {
          // Here we update the cache directly for the mock
          const currentLeads = queryClient.getQueryState<Lead[]>(['crm', 'leads'])?.data || [];
          const lead = currentLeads.find(l => l.id === payload.id);
          
          if (lead && payload.stage === 'Active Matter') {
              // Trigger conversion logic
              convertToCase(lead);
          }

          const updated = currentLeads.map(l => l.id === payload.id ? { ...l, stage: payload.stage } : l);
          return updated;
      },
      {
          onSuccess: (updatedLeads) => {
              queryClient.setQueryData(['crm', 'leads'], updatedLeads);
          }
      }
  );

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (stage: string) => {
    if (draggedId) {
      moveLead({ id: draggedId, stage });
      setDraggedId(null);
    }
  };
  
  const handleManualConvert = (lead: Lead) => {
      moveLead({ id: lead.id, stage: 'Active Matter' });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 px-2">
        <div>
          <h3 className={cn("font-bold text-lg", theme.text.primary)}>Intake Pipeline</h3>
          <p className={cn("text-xs", theme.text.secondary)}>Manage prospect lifecycle from lead to retained client.</p>
        </div>
        <button className={cn("flex items-center text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors shadow-sm")}>
          <Plus className="h-3 w-3 mr-1"/> Add Lead
        </button>
      </div>

      <KanbanBoard className="flex-1">
        {stages.map((stage) => (
          <KanbanColumn 
            key={stage} 
            title={stage} 
            count={leads.filter(l => l.stage === stage).length}
            onDrop={() => handleDrop(stage)}
          >
            {leads.filter(l => l.stage === stage).map(lead => (
              <KanbanCard 
                key={lead.id}
                onDragStart={(e) => handleDragStart(e, lead.id)}
                isDragging={draggedId === lead.id}
                className="hover:border-blue-400"
              >
                <div className="mb-2">
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1")}>{lead.client}</span>
                  <h4 className={cn("font-bold text-sm", theme.text.primary)}>{lead.title}</h4>
                </div>
                
                <div className={cn("flex justify-between items-center pt-2 border-t mt-2", theme.border.light)}>
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
                    <DollarSign className="h-3 w-3"/> {lead.value}
                  </div>
                  <div className={cn("flex items-center gap-2 text-[10px]", theme.text.tertiary)}>
                    <span className="flex items-center"><User className="h-3 w-3 mr-1"/> {lead.owner}</span>
                    <span className="flex items-center"><Calendar className="h-3 w-3 mr-1"/> {lead.date}</span>
                  </div>
                </div>
                
                {stage !== 'Active Matter' && stage !== 'Closed/Lost' && (
                   <button 
                     onClick={(e) => { e.stopPropagation(); handleManualConvert(lead); }}
                     className={cn("w-full mt-2 py-1 text-[10px] flex items-center justify-center rounded border transition-colors", theme.surfaceHighlight, theme.border.default, "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200")}
                   >
                      Convert to Matter <ArrowRight className="h-3 w-3 ml-1"/>
                   </button>
                )}
              </KanbanCard>
            ))}
          </KanbanColumn>
        ))}
      </KanbanBoard>
    </div>
  );
};
