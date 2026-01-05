
import React, { useState, useTransition } from 'react';
import { Users, FileText, CalendarClock, PenTool } from 'lucide-react';
import { ConferralLog } from './ConferralLog.tsx';
import { DiscoveryPlanBuilder } from './DiscoveryPlanBuilder.tsx';
import { Card } from '../../common/Card.tsx';
import { Button } from '../../common/Button.tsx';
import { MOCK_STIPULATIONS } from '../../../data/mockCollaboration.ts';

interface CaseCollaborationProps {
  caseId: string;
}

export const CaseCollaboration: React.FC<CaseCollaborationProps> = ({ caseId }) => {
  const [activeView, setActiveView] = useState<'conferral' | 'plans' | 'stipulations'>('conferral');
  // Guideline 3: Transition for view switching
  const [isPending, startTransition] = useTransition();

  const handleViewChange = (view: 'conferral' | 'plans' | 'stipulations') => {
      startTransition(() => {
          setActiveView(view);
      });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      <div className="lg:col-span-1 space-y-2">
        <button 
          onClick={() => handleViewChange('conferral')}
          className={`w-full text-left p-4 rounded-lg border transition-all flex items-center gap-3 ${activeView === 'conferral' ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <Users className="h-5 w-5"/>
          <div>
            <span className="block font-bold text-sm">Meet & Confer</span>
            <span className="text-xs opacity-80">Track compliance logs</span>
          </div>
        </button>
        
        <button 
          onClick={() => handleViewChange('plans')}
          className={`w-full text-left p-4 rounded-lg border transition-all flex items-center gap-3 ${activeView === 'plans' ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <FileText className="h-5 w-5"/>
          <div>
            <span className="block font-bold text-sm">Joint Discovery Plans</span>
            <span className="text-xs opacity-80">Rule 26(f) Reports</span>
          </div>
        </button>

        <button 
          onClick={() => handleViewChange('stipulations')}
          className={`w-full text-left p-4 rounded-lg border transition-all flex items-center gap-3 ${activeView === 'stipulations' ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <CalendarClock className="h-5 w-5"/>
          <div>
            <span className="block font-bold text-sm">Stipulations</span>
            <span className="text-xs opacity-80">Deadline negotiation</span>
          </div>
        </button>
      </div>

      <div className={`lg:col-span-3 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        {activeView === 'conferral' && <ConferralLog caseId={caseId} />}
        {activeView === 'plans' && <DiscoveryPlanBuilder caseId={caseId} />}
        {activeView === 'stipulations' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Stipulation Requests</h3>
              <Button variant="primary" icon={PenTool}>Propose Stipulation</Button>
            </div>
            {MOCK_STIPULATIONS.map(stip => (
              <Card key={stip.id} className="border-l-4 border-l-amber-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900">{stip.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">Requested by: {stip.requestingParty}</p>
                    <p className="text-sm text-slate-600">Reason: {stip.reason}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Proposed Date</div>
                    <div className="text-lg font-mono font-bold text-slate-800">{stip.proposedDate}</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-3">
                  <Button size="sm" variant="primary" className="bg-green-600 hover:bg-green-700 border-transparent">Accept</Button>
                  <Button size="sm" variant="danger">Reject</Button>
                  <Button size="sm" variant="secondary">Counter-Propose</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
