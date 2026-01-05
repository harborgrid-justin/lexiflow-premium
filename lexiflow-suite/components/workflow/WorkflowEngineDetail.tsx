
import React, { useState, useTransition } from 'react';
import { 
  ArrowLeft, Settings, Play, Pause, AlertTriangle, CheckCircle, 
  GitBranch, Clock, RefreshCw, User, Layout, ArrowRight,
  Gavel, ShieldCheck, Box, MessageSquare, Zap, MoreVertical,
  Activity, Layers, FileText, Calendar, Users
} from 'lucide-react';
import { Button } from '../common/Button.tsx';
import { Card } from '../common/Card.tsx';
import { Badge } from '../common/Badge.tsx';
import { MetricCard } from '../common/Primitives.tsx';
import { TaskDependencyManager } from './TaskDependencyManager.tsx';
import { ParallelTasksManager } from './ParallelTasksManager.tsx';
import { SLAMonitor } from './SLAMonitor.tsx';
import { AuditTrailViewer } from './AuditTrailViewer.tsx';
import { Tabs } from '../common/Tabs.tsx';

interface WorkflowEngineDetailProps {
  id: string;
  type: 'case' | 'process';
  onBack: () => void;
}

export const WorkflowEngineDetail: React.FC<WorkflowEngineDetailProps> = ({ id, type, onBack }) => {
  const [activeTab, setActiveTab] = useState<'visualizer' | 'tasks' | 'audit' | 'settings'>('visualizer');
  const [status, setStatus] = useState('Active');
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (t: string) => {
    startTransition(() => setActiveTab(t as any));
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in min-h-0 relative">
      {/* Component ID Badge */}
      <div className="absolute top-0 right-0 z-50">
        <span className="bg-slate-900 text-blue-400 font-mono text-[10px] font-black px-2 py-1 rounded border border-slate-700 shadow-xl">
          WF-DET-02
        </span>
      </div>

      {/* Header with Glassmorphism feel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-5">
          <button onClick={onBack} className="p-2.5 hover:bg-slate-100 rounded-full transition-all text-slate-500 border border-slate-200 bg-white shadow-sm hover:shadow-md active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{type === 'case' ? 'Martinez v. TechCorp' : 'Corporate Ingestion Flow'}</h2>
              <Badge variant={status === 'Active' ? 'success' : 'warning'} className="px-3 py-1 shadow-sm border font-bold tracking-wide uppercase text-[10px]">
                  {status === 'Active' && <RefreshCw size={10} className="animate-spin text-green-600 mr-2"/>}
                  {status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <span className="font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">ENGINE-ID: {id}</span>
                <span className="flex items-center gap-1.5"><Box size={12} className="text-blue-500"/> Cluster 4A-Primary</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {status === 'Active' ? (
            <Button variant="secondary" icon={Pause} onClick={() => setStatus('Paused')} className="px-6 rounded-full font-bold border-slate-300 hover:bg-slate-100 shadow-sm">Pause Engine</Button>
          ) : (
            <Button variant="primary" icon={Play} onClick={() => setStatus('Active')} className="px-6 rounded-full font-bold shadow-blue-500/25 shadow-lg">Resume</Button>
          )}
          <Button variant="outline" icon={Settings} className="rounded-full border-slate-200 hover:border-blue-300 shadow-sm">Reconfigure</Button>
        </div>
      </div>

      {/* Planning Layer [VZ-27 Integration] */}
      <Card title={<div className="flex justify-between items-center"><span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-slate-400"/> Matter Timeline Projection</span> <Badge variant="neutral" className="text-[9px]">VZ-27</Badge></div>} noPadding>
          <div className="p-6 space-y-4">
              <div className="grid grid-cols-12 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                  <div className="col-span-3 pl-1">Pleadings</div>
                  <div className="col-span-4 border-l border-slate-100 pl-1">Discovery</div>
                  <div className="col-span-3 border-l border-slate-100 pl-1">Pre-Trial</div>
                  <div className="col-span-2 border-l border-slate-100 pl-1">Trial</div>
              </div>
              <div className="h-10 w-full bg-slate-50 rounded-xl border border-slate-200 relative overflow-hidden shadow-inner ring-1 ring-slate-100">
                  {/* Pattern background */}
                  <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px]"></div>
                  
                  <div className="absolute top-1.5 bottom-1.5 left-0 w-[24%] bg-green-500 rounded-md shadow-sm border border-green-400 opacity-90 group cursor-pointer">
                    <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors"></div>
                  </div>
                  <div className="absolute top-1 bottom-1 left-[25%] w-[33%] bg-blue-600 rounded-lg shadow-lg border border-blue-500 ring-2 ring-blue-100 z-10 cursor-pointer flex items-center justify-center group">
                      <div className="h-full w-full bg-gradient-to-b from-white/10 to-transparent group-hover:from-white/20 transition-all"></div>
                      <div className="absolute bottom-1 w-8 h-1 bg-white/40 rounded-full"></div>
                  </div>
                  <div className="absolute top-1.5 bottom-1.5 left-[60%] w-[25%] bg-slate-300 rounded-md opacity-60 pattern-diagonal-lines border border-slate-400 cursor-not-allowed"></div>
                  <div className="absolute top-1.5 bottom-1.5 right-0 w-[14%] bg-red-400 rounded-md opacity-40 border border-red-300"></div>
              </div>
          </div>
      </Card>

      <div className="flex-1 bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden min-h-0 ring-1 ring-slate-100">
        <div className="border-b border-slate-200 px-6 pt-2 bg-slate-50/50">
          <Tabs 
            tabs={['visualizer', 'tasks', 'audit', 'settings']} 
            activeTab={activeTab} 
            onChange={handleTabChange} 
            variant="underline"
            className="border-none"
          />
        </div>
        
        <div className={`flex-1 overflow-y-auto p-8 bg-slate-50/50 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
          {activeTab === 'visualizer' && (
            <div className="space-y-8 h-full">
              {/* WF-02 Domain Node Logic Visualizer */}
              <div 
                className="bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-inner flex flex-col items-center gap-16 relative min-h-[500px] justify-center overflow-x-auto overflow-y-hidden"
                style={{
                  backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
                  backgroundSize: '24px 24px' 
                }}
              >
                 <div className="absolute top-6 left-8 flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    <Layout className="h-3.5 w-3.5 text-blue-500"/> Orchestration Logic [WF-02]
                 </div>
                 
                 <div className="flex items-center gap-16 min-w-max px-12">
                     {/* Start Event */}
                     <div className="flex flex-col items-center gap-3 group">
                        <div className="w-16 h-16 rounded-full border-[5px] border-green-500 bg-white flex items-center justify-center shadow-xl shadow-green-100 relative transition-transform group-hover:scale-110">
                            <Play size={24} className="text-green-600 ml-1 fill-green-600"/>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm group-hover:text-green-600 transition-colors">Trigger</span>
                     </div>
                     
                     <div className="w-12 h-0.5 bg-slate-300 relative">
                        <div className="absolute right-0 -top-1.5 text-slate-300"><ArrowRight size={16}/></div>
                     </div>

                     {/* WF-02 Task Node */}
                     <div className="w-72 bg-white border-2 border-blue-500 rounded-3xl p-5 shadow-2xl relative group cursor-pointer hover:scale-105 transition-all ring-4 ring-blue-50/50 hover:ring-blue-100">
                        <div className="absolute top-4 left-0 w-1.5 h-12 bg-blue-500 rounded-r-full"></div>
                        <div className="flex items-center gap-4 mb-5">
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 border border-blue-100 shadow-inner"><User size={20}/></div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Task Instance</span>
                                <span className="text-base font-bold text-slate-800">Review Pleadings</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-inner">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter flex items-center gap-1.5"><Users size={10}/> Assoc. Pool B</span>
                            <Badge variant="info" className="text-[9px] font-black shadow-sm uppercase tracking-widest bg-white">SLA: 24h</Badge>
                        </div>
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-colors">
                            <MoreVertical size={14}/>
                        </div>
                     </div>
                     
                     <div className="w-12 h-0.5 bg-slate-300 relative">
                        <div className="absolute right-0 -top-1.5 text-slate-300"><ArrowRight size={16}/></div>
                     </div>

                     {/* Decision Node */}
                     <div className="flex flex-col items-center gap-3">
                        <div className="w-24 h-24 bg-white border-[5px] border-amber-400 rounded-3xl rotate-45 flex items-center justify-center shadow-xl group hover:bg-amber-50 transition-colors relative z-10">
                            <div className="-rotate-45 font-black text-amber-600 text-2xl">?</div>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm whitespace-nowrap mt-4">Validation Gateway</span>
                     </div>

                     <div className="w-12 h-0.5 bg-slate-300 relative">
                        <div className="absolute right-0 -top-1.5 text-slate-300"><ArrowRight size={16}/></div>
                     </div>

                     {/* Automated Task */}
                     <div className="w-72 bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 shadow-2xl relative group ring-4 ring-slate-200 cursor-pointer hover:border-purple-500 transition-colors">
                        <div className="absolute top-4 left-0 w-1.5 h-12 bg-purple-500 rounded-r-full shadow-[0_0_10px_#a855f7]"></div>
                        <div className="flex items-center gap-4 mb-5">
                            <div className="p-3 bg-slate-800 rounded-2xl text-purple-400 border border-slate-700 shadow-inner"><RefreshCw size={20} className="animate-spin-slow"/></div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">System Service</span>
                                <span className="text-base font-bold text-white">AI Evidence Parse</span>
                            </div>
                        </div>
                        <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 backdrop-blur-sm">
                             <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase mb-2">
                                 <span className="flex items-center gap-1.5"><Layers size={10}/> Processing Blobs</span>
                                 <span className="text-purple-400 font-mono">65%</span>
                             </div>
                             <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                                 <div className="h-full bg-purple-500 w-[65%] rounded-full shadow-[0_0_12px_rgba(168,85,247,0.8)] relative">
                                     <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                 </div>
                             </div>
                        </div>
                     </div>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SLAMonitor />
                <Card title={<div className="flex items-center gap-3">Anomaly Detection <Badge variant="neutral" className="text-[9px] font-mono border-slate-300">FB-33</Badge></div>}>
                  <div className="p-2 space-y-4">
                    <div className="flex items-start gap-5 p-5 text-red-800 bg-red-50 rounded-2xl border border-red-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                        <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none"><AlertTriangle size={80}/></div>
                        <div className="p-2 bg-white rounded-xl border border-red-100 shadow-sm text-red-600 shrink-0">
                            <AlertTriangle className="h-6 w-6"/>
                        </div>
                        <div>
                            <h5 className="font-black text-xs uppercase tracking-widest mb-1 text-red-900">Bottleneck Identified [Step 42]</h5>
                            <p className="text-xs mt-1 leading-relaxed font-medium opacity-90 text-red-800">
                                Manual review of "High Complexity" contracts is exceeding the 48h SLA by <span className="font-black underline decoration-red-400 decoration-2 underline-offset-2">12.4 hours</span>. Suggest dynamic resource reallocation.
                            </p>
                        </div>
                    </div>
                    <Button variant="primary" className="w-full bg-slate-900 border-none shadow-xl shadow-slate-200 hover:bg-slate-800 rounded-xl h-12 text-xs font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 group">
                        <Zap size={14} className="fill-yellow-400 text-yellow-400 group-hover:scale-125 transition-transform"/> Optimize Resources Now
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && <ParallelTasksManager />}
          {activeTab === 'audit' && <AuditTrailViewer />}
          {activeTab === 'settings' && <div className="p-12 text-center text-slate-400 italic bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">Advanced Engine Configuration restricted to Administrators.</div>}
        </div>
      </div>
    </div>
  );
};
