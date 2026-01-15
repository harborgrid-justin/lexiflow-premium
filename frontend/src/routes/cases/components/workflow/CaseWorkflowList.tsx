/**
 * CaseWorkflowList.tsx
 *
 * List view of cases with active workflows, progress tracking, and quick actions.
 *
 * REACT V18 CONTEXT CONSUMPTION COMPLIANCE:
 * - Guideline 21: Pure render logic with computed progress metrics
 * - Guideline 28: Theme usage is pure function for workflow display
 * - Guideline 34: useTheme() is side-effect free read
 * - Guideline 33: Uses isPendingThemeChange for list transitions
 */

import { cn } from '@/lib/cn';
import { Badge } from '@/components/atoms/Badge';
import { EmptyState } from '@/components/molecules/EmptyState/EmptyState';
import { useTheme } from "@/hooks/useTheme";
import { Case, WorkflowTask } from '@/types';
import { CheckCircle, ChevronRight, Clock, GitBranch, Search, Settings, Users } from 'lucide-react';
import { getCaseProgress, getNextTask } from './utils';
import { WorkflowQuickActions } from './WorkflowQuickActions';

interface CaseWorkflowListProps {
  cases: Case[];
  tasks: WorkflowTask[];
  onSelectCase: (id: string) => void;
  onManageWorkflow?: (id: string) => void;
}

export function CaseWorkflowList({ cases, tasks, onSelectCase, onManageWorkflow }: CaseWorkflowListProps) {
  // Guideline 34: Side-effect free context read
  const { theme } = useTheme();

  if (!cases || cases.length === 0) {
    return (
      <EmptyState
        title="No Active Case Workflows"
        description="There are no cases with active workflows at the moment. Start a new case to see it here."
        icon={Search}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {cases.map(c => {
        const progress = getCaseProgress(c.id, tasks);
        return (
          <div
            key={c.id}
            className={cn(
              "rounded-lg border shadow-sm p-5 transition-all group relative",
              theme.surface.default,
              theme.border.default,
              `hover:shadow-md hover:${theme.primary.border}`
            )}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 cursor-pointer" onClick={() => onSelectCase(c.id)}>
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg", progress === 100 ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600")}>
                  <GitBranch className="h-6 w-6" />
                </div>
                <div>
                  <h4 className={cn("font-bold text-lg transition-colors", theme.text.primary, `group-hover:${theme.primary.text}`)}>{c.title}</h4>
                  <div className={cn("flex items-center gap-3 text-xs mt-1", theme.text.secondary)}>
                    <span className={cn("font-mono px-1 rounded", theme.surface.highlight)}>{c.id}</span>
                    <Badge variant="neutral">{c.matterType}</Badge>
                    <span className="flex items-center"><Users className="h-3 w-3 mr-1" /> {c.client}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={progress === 100 ? 'success' : 'info'}>{c.status}</Badge>
                <ChevronRight className={cn("h-5 w-5", theme.text.tertiary, `group-hover:${theme.text.secondary}`)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-1">
                <div className={cn("flex justify-between text-xs mb-1", theme.text.secondary)}>
                  <span className="font-medium">Stage Progress</span>
                  <span className={cn("font-bold", theme.text.primary)}>{progress}%</span>
                </div>
                <div className={cn("w-full rounded-full h-2", theme.surface.highlight)}>
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${progress === 100 ? 'bg-green-500' : theme.primary.DEFAULT}`}
                    style={{ '--progress-width': `${progress}%` } as React.CSSProperties}
                  ></div>
                </div>
              </div>

              <div className={cn("p-3 rounded border flex items-center justify-between", theme.surface.highlight, theme.border.default)}>
                <div className="flex items-center gap-3">
                  {progress === 100 ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Clock className="h-5 w-5 text-amber-500" />}
                  <div>
                    <p className={cn("text-xs font-bold uppercase", theme.text.secondary)}>Current Step</p>
                    <p className={cn("text-sm font-semibold", theme.text.primary)}>{getNextTask(c.id, tasks)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <WorkflowQuickActions caseId={c.id} onAction={(action) => console.log(action, c.id)} />
                  {onManageWorkflow && (
                    <button
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); onManageWorkflow(c.id); }}
                      className={cn("p-1 rounded transition-colors ml-1", theme.text.tertiary, `hover:${theme.primary.text}`, `hover:${theme.surface.default}`)}
                      title="Manage Workflow Engine"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

CaseWorkflowList.displayName = 'CaseWorkflowList';
