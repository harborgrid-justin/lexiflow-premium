
import React, { useState } from 'react';
import { WorkflowStage, WorkflowTask } from '../../types';
import { Cpu, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '../common/Button';
import { WorkflowTimeline } from './workflow/WorkflowTimeline';
import { WorkflowAutomations } from './workflow/WorkflowAutomations';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface CaseWorkflowProps {
  stages: WorkflowStage[];
  generatingWorkflow: boolean;
  onGenerateWorkflow: () => void;
  onNavigateToModule?: (module: string) => void;
}

export const CaseWorkflow: React.FC<CaseWorkflowProps> = ({ stages: initialStages, generatingWorkflow, onGenerateWorkflow, onNavigateToModule }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'timeline' | 'automation'>('timeline');
  const [stages, setStages] = useState(initialStages);

  const handleToggleTask = (stageId: string, taskId: string) => {
    setStages(prevStages => prevStages.map(stage => {
        if (stage.id !== stageId) return stage;
        
        const newTasks = stage.tasks.map(task => 
            task.id === taskId ? { ...task, status: task.status === 'Done' ? 'Pending' : 'Done' } : task
        );
        
        const allDone = newTasks.every(t => t.status === 'Done');
        const anyInProgress = newTasks.some(t => t.status === 'In Progress');
        
        let newStageStatus: string = stage.status;
        if (allDone) newStageStatus = 'Completed';
        else if (anyInProgress || newTasks.some(t => t.status === 'Done')) newStageStatus = 'Active';

        return { ...stage, tasks: newTasks as WorkflowTask[], status: newStageStatus };
    }));
  };

  const totalTasks = stages.reduce((acc, s) => acc + s.tasks.length, 0);
  const completedTasks = stages.reduce((acc, s) => acc + s.tasks.filter(t => t.status === 'Done').length, 0);
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Workflow Header / Stats */}
      <div className={cn("rounded-xl shadow-sm border p-6 flex flex-col md:flex-row justify-between items-center gap-6", theme.surface, theme.border.default)}>
          <div className="w-full md:w-1/3">
              <h3 className={cn("text-lg font-bold mb-1", theme.text.primary)}>Workflow Status</h3>
              <div className={cn("flex items-center justify-between text-sm mb-2", theme.text.secondary)}>
                  <span>{completedTasks} of {totalTasks} Tasks Complete</span>
                  <span className="font-bold text-blue-600">{progress}%</span>
              </div>
              <div className={cn("w-full rounded-full h-2.5", theme.surfaceHighlight)}>
                  <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
              </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
             <button 
                onClick={() => setActiveTab('timeline')}
                className={cn("flex-1 md:flex-none px-4 py-2 rounded-lg font-medium text-sm transition-colors", activeTab === 'timeline' ? "bg-slate-900 text-white shadow-lg" : cn("border", theme.surface, theme.text.secondary, theme.border.default, `hover:${theme.surfaceHighlight}`))}
             >
                 Timeline
             </button>
             <button 
                onClick={() => setActiveTab('automation')}
                className={cn("flex-1 md:flex-none px-4 py-2 rounded-lg font-medium text-sm transition-colors", activeTab === 'automation' ? "bg-slate-900 text-white shadow-lg" : cn("border", theme.surface, theme.text.secondary, theme.border.default, `hover:${theme.surfaceHighlight}`))}
             >
                 Automations
             </button>
          </div>

          <div className="flex gap-2">
             <Button variant="outline" icon={BookOpen} onClick={() => alert("Loading Playbook...")}>Templates</Button>
             <Button 
                variant="primary" 
                icon={generatingWorkflow ? Cpu : Sparkles} 
                onClick={onGenerateWorkflow} 
                disabled={generatingWorkflow}
                className="bg-purple-600 hover:bg-purple-700 border-transparent text-white"
             >
                {generatingWorkflow ? 'Thinking...' : 'AI Assist'}
             </Button>
          </div>
      </div>

      {activeTab === 'timeline' ? (
        <WorkflowTimeline stages={stages} onToggleTask={handleToggleTask} onNavigateToModule={onNavigateToModule} />
      ) : (
        <WorkflowAutomations />
      )}
    </div>
  );
};
