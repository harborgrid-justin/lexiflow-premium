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
import React from 'react';
import { BookOpen, Cpu, Sparkles } from 'lucide-react';

// Internal Dependencies - Components
import { Button } from '@/components/atoms/Button';
import { WorkflowAutomations } from './workflow/WorkflowAutomations';
import { WorkflowTimeline } from './workflow/WorkflowTimeline';

// Internal Dependencies - Hooks & Context
import { useCaseWorkflow } from '@/routes/cases/_hooks/useCaseWorkflow';
import { useTheme } from "@/hooks/useTheme";

// Internal Dependencies - Services & Utils
import { cn } from '@/lib/cn';

// Types & Interfaces
import { WorkflowStage } from '@/types';

interface CaseWorkflowProps {
  stages: WorkflowStage[];
  generatingWorkflow: boolean;
  onGenerateWorkflow: () => void;
  onNavigateToModule?: (module: string) => void;
}

export const CaseWorkflow: React.FC<CaseWorkflowProps> = ({ stages: initialStages, generatingWorkflow, onGenerateWorkflow, onNavigateToModule }) => {
  const { theme } = useTheme();

  const {
    stages,
    activeTab,
    setActiveTab,
    handleToggleTask,
    stats
  } = useCaseWorkflow(initialStages);

  const { totalTasks, completedTasks, progress } = stats;

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
            { }
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
