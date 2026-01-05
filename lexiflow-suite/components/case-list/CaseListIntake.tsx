
import React, { useState, useTransition } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { KanbanBoard, KanbanColumn, KanbanCard } from '../common/Kanban.tsx';
import { Skeleton } from '../common/Primitives.tsx';

interface Lead {
  id: number;
  client: string;
  matter: string;
  stage: string;
  value: string;
  age: string;
}

interface CaseListIntakeProps {
  isLoading?: boolean;
}

export const CaseListIntake: React.FC<CaseListIntakeProps> = ({ isLoading = false }) => {
  const [leads, setLeads] = useState<Lead[]>([
    { id: 1, client: 'Horizon Tech', matter: 'IP Dispute', stage: 'Conflict Check', value: '$50k', age: '2d' },
    { id: 2, client: 'Dr. A. Smith', matter: 'Malpractice Defense', stage: 'Engagement Letter', value: '$120k', age: '5d' },
    { id: 3, client: 'RetailCo', matter: 'Lease Negotiation', stage: 'New Lead', value: '$15k', age: '1d' },
    { id: 4, client: 'StartUp Inc', matter: 'Series A Funding', stage: 'New Lead', value: '$200k', age: '4h' },
  ]);
  const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  
  const [isPending, startTransition] = useTransition();

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedLeadId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (stage: string) => {
    if (draggedLeadId !== null) {
      startTransition(() => {
        setLeads(prev => prev.map(lead => 
            lead.id === draggedLeadId ? { ...lead, stage } : lead
        ));
        setDraggedLeadId(null);
        setDragOverStage(null);
      });
    }
  };

  const handleAddLead = () => {
    startTransition(() => {
        const newLead: Lead = {
        id: Date.now(),
        client: 'New Prospect',
        matter: 'Pending Intake',
        stage: 'New Lead',
        value: '$0',
        age: 'Just now'
        };
        setLeads([...leads, newLead]);
    });
  };

  const stages = ['New Lead', 'Conflict Check', 'Engagement Letter', 'Matter Created'];

  return (
    <div className={`flex flex-col h-full transition-opacity duration-200 ${isPending ? 'opacity-70' : 'opacity-100'}`}>
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="font-bold text-slate-900">Pipeline Board</h3>
      </div>
      
      <KanbanBoard>
        {stages.map((stage, idx) => (
          <KanbanColumn 
            key={stage} 
            title={stage} 
            count={isLoading ? 0 : leads.filter(l => l.stage === stage).length}
            isDragOver={dragOverStage === stage}
            onDrop={() => handleDrop(stage)}
            action={idx === 0 && !isLoading ? (
              <button 
                onClick={handleAddLead}
                className="mt-3 w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 text-xs font-bold hover:bg-white hover:text-blue-600 hover:border-blue-300 transition-all flex items-center justify-center"
              >
                <Plus className="h-3 w-3 mr-1"/> Add Lead
              </button>
            ) : undefined}
          >
            {isLoading ? (
                // Skeleton Cards
                Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2 mb-3" />
                        <div className="flex justify-between pt-2 border-t border-slate-50">
                            <Skeleton className="h-3 w-10" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                ))
            ) : (
                leads.filter(l => l.stage === stage).map(lead => (
                <KanbanCard
                    key={lead.id}
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    isDragging={draggedLeadId === lead.id}
                >
                    <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 line-clamp-1">{lead.client}</h4>
                    </div>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-1">{lead.matter}</p>
                    <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-50">
                    <span className="font-mono text-emerald-600 font-medium">{lead.value}</span>
                    <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3"/> {lead.age}
                    </span>
                    </div>
                </KanbanCard>
                ))
            )}
          </KanbanColumn>
        ))}
      </KanbanBoard>
    </div>
  );
};
