
import React, { useTransition } from 'react';
import { GitBranch, Users, ChevronRight, CheckCircle, Clock, Settings, Briefcase, Zap } from 'lucide-react';
import { Badge } from '../common/Badge.tsx';
import { Button } from '../common/Button.tsx';
import { Case } from '../../types.ts';
import { WorkflowQuickActions } from './WorkflowQuickActions.tsx';

interface CaseWorkflowListProps {
  cases: Case[];
  onSelectCase: (id: string) => void;
  onManageWorkflow?: (id: string) => void;
  getCaseProgress: (status: string) => number;
  getNextTask: (status: string) => string;
}

export const CaseWorkflowList: React.FC<CaseWorkflowListProps> = ({ 
  cases, 
  onSelectCase, 
  onManageWorkflow, 
  getCaseProgress, 
  getNextTask 
}) => {
  const [isPending, startTransition] = useTransition();

  const handleRowClick = (id: string) => {
    startTransition(() => {
        onSelectCase(id);
    });
  };

  const handleSettingsClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onManageWorkflow) {
        startTransition(() => {
            onManageWorkflow(id);
        });
    }
  };

  return (
    <div className={`grid grid-cols-1 gap-4 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        {cases.map(c => {
            const progress = getCaseProgress(c.status);
            return (
            <div 
                key={c.id} 
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-blue-400 hover:shadow-xl transition-all group relative overflow-hidden"
            >
                {/* ID Badge */}
                <div className="absolute top-0 right-0 z-10 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-1 border rounded shadow-sm">WF-CASE-01</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6 cursor-pointer" onClick={() => handleRowClick(c.id)}>
                  <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-2xl shadow-sm border ring-4 ring-slate-50 transition-all ${progress === 100 ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-slate-200 text-blue-600 group-hover:border-blue-200'}`}>
                        <Briefcase className="h-6 w-6"/>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-black text-lg text-slate-900 group-hover:text-blue-600 transition-colors truncate tracking-tight leading-snug">{c.title}</h4>
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-1 mb-2">{c.id}</div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                             <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">{c.matterType}</span>
                             <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200 flex items-center gap-1"><Users size={10}/> {c.client}</span>
                             <Badge variant={c.status === 'Trial' ? 'warning' : 'info'} className="text-[10px] font-black px-2 py-1 border uppercase">{c.status}</Badge>
                        </div>
                      </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-5 border-t border-slate-100 bg-slate-50/30 -mx-5 px-5 -mb-5 pb-5">
                  <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span className="flex items-center gap-1"><Zap size={10} className="text-amber-500"/> Pipeline Velocity</span>
                        <span className="text-slate-900">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`} 
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                        </div>
                      </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-slate-50 border border-slate-100 ${progress === 100 ? 'text-green-500' : 'text-slate-400'}`}>
                             {progress === 100 ? <CheckCircle size={16}/> : <Clock size={16}/>}
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Task</p>
                            <p className="text-xs font-bold text-slate-800 leading-tight">{getNextTask(c.status)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 pl-4 border-l border-slate-100">
                        <WorkflowQuickActions caseId={c.id} onAction={(action) => console.log(action, c.id)} />
                        <button 
                            onClick={(e) => handleSettingsClick(e, c.id)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-all ml-1"
                            title="Engine Config"
                        >
                            <Settings className="h-4 w-4"/>
                        </button>
                      </div>
                  </div>
                </div>
            </div>
            );
        })}
    </div>
  );
};
