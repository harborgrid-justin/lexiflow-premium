
import React, { useState, useTransition } from 'react';
import { WorkflowStage, WorkflowTask } from '../../types.ts';
import { 
  Cpu, Sparkles, Plus, CheckCircle, Clock, 
  FileText, DollarSign, Scale, Gavel, Layout, ChevronDown, ChevronUp, Box
} from 'lucide-react';
import { Button } from '../common/Button.tsx';
import { UserAvatar } from '../common/UserAvatar.tsx';
import { Badge } from '../common/Badge.tsx';

interface CaseWorkflowProps {
  stages: WorkflowStage[];
  generatingWorkflow: boolean;
  onGenerateWorkflow: () => void;
  onNavigateToModule?: (module: string) => void;
}

export const CaseWorkflow: React.FC<CaseWorkflowProps> = ({ stages: initialStages, generatingWorkflow, onGenerateWorkflow, onNavigateToModule }) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'automation'>('timeline');
  const [stages, setStages] = useState(initialStages);
  const [expandedStage, setExpandedStage] = useState<string | null>(initialStages.find(s => s.status === 'Active')?.id || null);

  const [isPending, startTransition] = useTransition();

  const handleTabChange = (tab: 'timeline' | 'automation') => {
      startTransition(() => {
          setActiveTab(tab);
      });
  };

  const handleToggleTask = (stageId: string, taskId: string) => {
    setStages(prevStages => prevStages.map(stage => {
        if (stage.id !== stageId) return stage;
        
        const newTasks = stage.tasks.map(task => 
            task.id === taskId ? { ...task, status: task.status === 'Done' ? 'Pending' : 'Done' } : task
        );
        
        const allDone = newTasks.every(t => t.status === 'Done');
        const anyInProgress = newTasks.some(t => t.status === 'In Progress');
        
        let newStageStatus: 'Pending' | 'Active' | 'Completed' = stage.status;
        if (allDone) newStageStatus = 'Completed';
        else if (anyInProgress || newTasks.some(t => t.status === 'Done')) newStageStatus = 'Active';

        return { ...stage, tasks: newTasks as WorkflowTask[], status: newStageStatus };
    }));
  };

  const getModuleIcon = (module?: string) => {
      switch(module) {
          case 'Documents': return <FileText className="h-3 w-3 mr-1"/>;
          case 'Billing': return <DollarSign className="h-3 w-3 mr-1"/>;
          case 'Discovery': return <Scale className="h-3 w-3 mr-1"/>;
          case 'Motions': return <Gavel className="h-3 w-3 mr-1"/>;
          case 'Evidence': return <Box className="h-3 w-3 mr-1"/>;
          default: return <Layout className="h-3 w-3 mr-1"/>;
      }
  };

  const totalTasks = stages.reduce((acc, s) => acc + s.tasks.length, 0);
  const completedTasks = stages.reduce((acc, s) => acc + s.tasks.filter(t => t.status === 'Done').length, 0);
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Velocity Header */}
      <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden flex flex-wrap items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex-1 min-w-[200px]">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Workflow Velocity</h3>
             <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-black tracking-tighter leading-none">{progress}%</span>
                <span className="text-sm font-bold text-slate-400 mb-1">Complete</span>
             </div>
             <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_#3b82f6]" style={{ width: `${progress}%` }}></div>
             </div>
          </div>
          
          <div className="flex flex-wrap gap-2 relative z-10">
             <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button 
                    onClick={() => handleTabChange('timeline')}
                    className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'timeline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                    Timeline
                </button>
                <button 
                    onClick={() => handleTabChange('automation')}
                    className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'automation' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                    Automations
                </button>
             </div>
             <Button 
                variant="primary" 
                size="sm"
                icon={generatingWorkflow ? Cpu : Sparkles} 
                onClick={onGenerateWorkflow} 
                disabled={generatingWorkflow}
                className="bg-indigo-600 hover:bg-indigo-500 border-none shadow-lg shadow-indigo-900/20"
             >
                {generatingWorkflow ? 'Generating...' : 'AI Assist'}
             </Button>
          </div>
      </div>

      <div className={`transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
      {activeTab === 'timeline' ? (
        <div className="space-y-4">
            {stages.map((stage, index) => {
                const isExpanded = expandedStage === stage.id;
                const isActive = stage.status === 'Active';
                return (
                    <div key={stage.id} className={`bg-white rounded-xl border transition-all duration-300 ${isActive ? 'border-blue-300 shadow-md ring-1 ring-blue-50' : 'border-slate-200 shadow-sm'}`}>
                        {/* Stage Header */}
                        <div 
                            className="p-4 md:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors rounded-t-xl"
                            onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border-2 text-xs font-bold transition-colors shrink-0 ${
                                    stage.status === 'Completed' ? 'bg-green-100 border-green-500 text-green-700' :
                                    stage.status === 'Active' ? 'bg-blue-100 border-blue-500 text-blue-700' :
                                    'bg-slate-50 border-slate-300 text-slate-400'
                                }`}>
                                    {stage.status === 'Completed' ? <CheckCircle className="h-5 w-5 md:h-6 md:w-6"/> : index + 1}
                                </div>
                                <div>
                                    <h4 className={`font-bold text-sm md:text-base ${isActive ? 'text-blue-900' : 'text-slate-800'}`}>{stage.title}</h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                        <Badge variant={isActive ? 'info' : stage.status === 'Completed' ? 'success' : 'neutral'} className="text-[10px] px-2 py-0.5 uppercase">
                                            {stage.status}
                                        </Badge>
                                        <span className="hidden sm:inline">• {stage.tasks.length} tasks</span>
                                    </div>
                                </div>
                            </div>
                            <button className="text-slate-400 p-2 hover:bg-slate-200 rounded-full transition-colors">
                                {isExpanded ? <ChevronUp className="h-5 w-5"/> : <ChevronDown className="h-5 w-5"/>}
                            </button>
                        </div>

                        {/* Stage Tasks */}
                        {isExpanded && (
                            <div className="px-4 pb-4 md:px-6 md:pb-6 space-y-2 border-t border-slate-100 bg-slate-50/30 rounded-b-xl animate-in slide-in-from-top-2 duration-200">
                                <div className="h-2"></div>
                                {stage.tasks.map((task) => (
                                    <div key={task.id} className="group flex items-start gap-3 p-3 md:p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
                                        <button 
                                            onClick={() => handleToggleTask(stage.id, task.id)}
                                            className={`mt-0.5 shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                                task.status === 'Done' 
                                                ? 'bg-green-500 border-green-500 text-white' 
                                                : 'border-slate-300 hover:border-blue-500 text-transparent'
                                            }`}
                                        >
                                            <CheckCircle className="h-3.5 w-3.5 fill-current"/>
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap justify-between items-start mb-1 gap-2">
                                                <h5 className={`text-sm font-semibold ${task.status === 'Done' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                                    {task.title}
                                                </h5>
                                                {task.priority === 'High' && task.status !== 'Done' && (
                                                    <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded uppercase tracking-wide border border-red-100 whitespace-nowrap">Critical</span>
                                                )}
                                            </div>
                                            
                                            {task.description && (
                                                <p className="text-xs text-slate-500 mb-2 line-clamp-2 md:line-clamp-1">{task.description}</p>
                                            )}

                                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                                                <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                                                    <UserAvatar name={task.assignee} size="sm" className="w-4 h-4 text-[8px]"/>
                                                    <span className="font-medium">{task.assignee}</span>
                                                </div>
                                                <div className={`flex items-center gap-1.5 ${task.status !== 'Done' && new Date(task.dueDate) < new Date() ? 'text-red-600 font-bold' : ''}`}>
                                                    <Clock className="h-3 w-3"/>
                                                    <span>{task.dueDate}</span>
                                                </div>
                                                {task.relatedModule && (
                                                    <div className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 ml-auto md:ml-0">
                                                        {getModuleIcon(task.relatedModule)}
                                                        <span className="font-bold">{task.relatedModule}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-3 text-xs font-bold text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-200 transition-colors flex items-center justify-center gap-2">
                                    <Plus className="h-4 w-4"/> Add Task
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
               <p className="text-center text-slate-400 italic text-sm">Automation rules configuration would appear here.</p>
            </div>
        </div>
      )}
      </div>
    </div>
  );
};
