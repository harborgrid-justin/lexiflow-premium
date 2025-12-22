/**
 * CaseWorkflow.tsx
 * 
 * Case workflow management with AI-generated stages, task tracking,
 * and automation configuration interface.
 * 
 * @module components/case-detail/CaseWorkflow
 * @category Case Management - Workflow & Automation
 */

// External Dependencies
import React, { useState } from 'react';
import { Cpu, Sparkles, BookOpen } from 'lucide-react';

// Internal Dependencies - Components
import { Button } from '../common/Button';
import { WorkflowTimeline } from './workflow/WorkflowTimeline';
import { WorkflowAutomations } from './workflow/WorkflowAutomations';

// Internal Dependencies - Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Internal Dependencies - Services & Utils
import { cn } from '../../utils/cn';

// Types & Interfaces
import { WorkflowStage, WorkflowTask, StageStatus, TaskStatus } from '../../types';

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
            task.id === taskId ? { ...task, status: (task.status === 'Done' ? 'Pending' : 'Done') as TaskStatus } : task
        );
        
        const allDone = newTasks.every(t => t.status === 'Done');
        const anyInProgress = newTasks.some(t => t.status === 'In Progress');
        
        let newStageStatus: StageStatus = stage.status as StageStatus;
        if (allDone) newStageStatus = 'Completed';
        else if (anyInProgress || newTasks.some(t => t.status === 'Done')) newStageStatus = 'Active';

        return { ...stage, tasks: newTasks, status: newStageStatus };
    }));
  };

  const totalTasks = stages.reduce((acc, s) => acc + s.tasks.length, 0);
  const completedTasks = stages.reduce((acc, s) => acc + s.tasks.filter(t => t.status === 'Done').length, 0);
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Workflow Header / Stats */}
      <div className={cn("rounded-xl shadow-sm border p-6 flex flex-col md:flex-row justify-between items-center gap-6", theme.surface.default, theme.border.default)}>
          <div className="w-full md:w-1/3">
              <h3 className={cn("text-lg font-bold mb-1", theme.text.primary)}>Workflow Status</h3>
              <div className={cn("flex items-center justify-between text-sm mb-2", theme.text.secondary)}>
                  <span>{completedTasks} of {totalTasks} Tasks Complete</span>
                  <span className={cn("font-bold", theme.text.link)}>{progress}%</span>
              </div>
              <div className={cn("w-full rounded-full h-2.5", theme.surface.highlight)}>
                  {/* eslint-disable-next-line react/forbid-dom-props -- Dynamic width required for progress */}
                  <div className={cn("h-2.5 rounded-full transition-all duration-1000 ease-out", theme.action.primary.bg)} style={{ width: `${progress}%` }}></div>
              </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
             <button 
                onClick={() => setActiveTab('timeline')}
                className={cn("flex-1 md:flex-none px-4 py-2 rounded-lg font-medium text-sm transition-colors", activeTab === 'timeline' ? "bg-slate-900 text-white shadow-lg" : cn("border", theme.surface.default, theme.text.secondary, theme.border.default, `hover:${theme.surface.highlight}`))}
             >
                 Timeline
             </button>
             <button 
                onClick={() => setActiveTab('automation')}
                className={cn("flex-1 md:flex-none px-4 py-2 rounded-lg font-medium text-sm transition-colors", activeTab === 'automation' ? "bg-slate-900 text-white shadow-lg" : cn("border", theme.surface.default, theme.text.secondary, theme.border.default, `hover:${theme.surface.highlight}`))}
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
