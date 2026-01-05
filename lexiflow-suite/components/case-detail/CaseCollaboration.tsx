
import React, { useState, useTransition } from 'react';
import { Users, FileText, CalendarClock, PenTool, MessageSquare, List } from 'lucide-react';
import { ConferralLog } from './collaboration/ConferralLog.tsx';
import { DiscoveryPlanBuilder } from './collaboration/DiscoveryPlanBuilder.tsx';
import { Card } from '../common/Card.tsx';
import { Button } from '../common/Button.tsx';
import { Badge } from '../common/Badge.tsx';
import { MOCK_STIPULATIONS } from '../../data/mockCollaboration.ts';

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

  const navItems = [
      { id: 'conferral', label: 'Meet & Confer', sub: 'Compliance Logs', icon: Users },
      { id: 'plans', label: 'Discovery Plans', sub: 'Rule 26(f)', icon: FileText },
      { id: 'stipulations', label: 'Stipulations', sub: 'Deadlines', icon: CalendarClock },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full animate-fade-in">
      {/* Navigation Sidebar/Top Bar */}
      <div className="lg:w-64 shrink-0">
        <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1">
            {navItems.map(item => (
                <button 
                    key={item.id}
                    onClick={() => handleViewChange(item.id as any)}
                    className={`
                        flex-1 lg:w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3 min-w-[160px]
                        ${activeView === item.id 
                            ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm ring-1 ring-blue-100' 
                            : 'bg-white border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-200'
                        }
                    `}
                >
                    <div className={`p-2 rounded-lg ${activeView === item.id ? 'bg-white text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                        <item.icon className="h-5 w-5"/>
                    </div>
                    <div>
                        <span className="block font-bold text-sm leading-tight">{item.label}</span>
                        <span className="text-[10px] opacity-80 font-medium">{item.sub}</span>
                    </div>
                </button>
            ))}
        </div>
        
        <div className="mt-6 p-4 bg-slate-900 rounded-xl text-white hidden lg:block shadow-lg">
            <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-2">Active Counsel</h4>
            <div className="flex -space-x-2 overflow-hidden mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">AH</div>
                <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">SJ</div>
                <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-400">+2</div>
            </div>
            <Button variant="secondary" size="sm" className="w-full bg-white/10 border-none hover:bg-white/20 text-xs">Manage Access</Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 min-w-0 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        {activeView === 'conferral' && <ConferralLog caseId={caseId} />}
        {activeView === 'plans' && <DiscoveryPlanBuilder caseId={caseId} />}
        {activeView === 'stipulations' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4">
              <div>
                 <h3 className="font-bold text-slate-900 text-lg">Stipulation Requests</h3>
                 <p className="text-sm text-slate-500">Formal agreements to extend deadlines or modify procedures.</p>
              </div>
              <Button variant="primary" icon={PenTool}>Propose Stipulation</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_STIPULATIONS.map(stip => (
                <div key={stip.id} className="bg-white rounded-xl border-l-4 border-l-amber-500 border-y border-r border-slate-200 shadow-sm p-5 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                        <Badge variant="warning" className="text-[10px] uppercase font-black">Pending</Badge>
                        <div className="text-right">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Proposed Date</div>
                            <div className="text-sm font-mono font-bold text-slate-900">{stip.proposedDate}</div>
                        </div>
                    </div>
                    
                    <h4 className="font-bold text-slate-900 mb-1">{stip.title}</h4>
                    <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="font-bold text-slate-700 block mb-1">Reason:</span>
                        {stip.reason}
                    </p>
                    
                    <div className="pt-4 border-t border-slate-100 flex gap-2">
                        <Button size="sm" variant="primary" className="flex-1 bg-green-600 hover:bg-green-700 border-transparent text-xs">Accept</Button>
                        <Button size="sm" variant="danger" className="flex-1 text-xs">Reject</Button>
                        <Button size="sm" variant="secondary" className="flex-1 text-xs">Counter</Button>
                    </div>
                </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
