/**
 * WorkflowTimeline.tsx
 *
 * Stage-based workflow timeline with collapsible task lists,
 * assignee avatars, and module navigation.
 *
 * @module components/case-detail/workflow/WorkflowTimeline
 * @category Case Management - Workflow
 */

// External Dependencies
import { useState } from 'react';
import { CheckCircle, ChevronUp, ChevronDown, Clock, ArrowRight } from 'lucide-react';

// Internal Dependencies - Components
import { UserAvatar } from '@/components/atoms/UserAvatar';

// Internal Dependencies - Hooks & Context
import { useTheme } from '@/theme';

// Internal Dependencies - Services & Utils
import { cn } from '@/lib/cn';

// Types & Interfaces
import { WorkflowStage, TaskStatusBackend } from '@/types';

interface WorkflowTimelineProps {
  stages: WorkflowStage[];
  onToggleTask: (stageId: string, taskId: string) => void;
  onNavigateToModule?: (module: string) => void;
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({ stages, onToggleTask, onNavigateToModule }) => {
  const { theme } = useTheme();
  const [expandedStage, setExpandedStage] = useState<string | null>(stages.find(s => s.status === 'Active')?.id || null);

return (
    <div className="space-y-6">
        {stages.map((stage, index) => {
            const isExpanded = expandedStage === stage.id;
            const isActive = stage.status === 'Active';
            return (
                <div key={stage.id} className={cn("rounded-xl border transition-all duration-300", theme.surface.default, isActive ? cn(theme.action.primary.border, "shadow-md ring-1", theme.surface.highlight) : theme.border.default)}>
                    {/* Stage Header */}
                    <div
                        className={cn("p-4 flex items-center justify-between cursor-pointer rounded-t-xl transition-colors", `hover:${theme.surface.highlight}`)}
                        onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-bold ${
                                stage.status === 'Completed' ? 'bg-green-100 border-green-500 text-green-700' :
                                stage.status === 'Active' ? cn(theme.surface.highlight, theme.action.primary.border, theme.action.primary.text) :
                                `bg-slate-50 ${theme.border.default} ${theme.text.tertiary}`
                            }`}>
                                {stage.status === 'Completed' ? <CheckCircle className="h-5 w-5"/> : index + 1}
                            </div>
                            <div>
                                <h4 className={cn("font-bold text-lg", isActive ? theme.action.primary.text : theme.text.primary)}>{stage.title}</h4>
                                <div className={cn("flex items-center gap-2 text-xs", theme.text.secondary)}>
                                    <span className={cn("px-2 py-0.5 rounded-full", isActive ? cn(theme.surface.highlight, theme.action.primary.text) : "bg-slate-100 dark:bg-slate-800")}>{stage.status}</span>
                                    <span>• {stage.tasks.length} tasks</span>
                                </div>
                            </div>
                        </div>
                        <button className={theme.text.tertiary}>
                            {isExpanded ? <ChevronUp className="h-5 w-5"/> : <ChevronDown className="h-5 w-5"/>}
                        </button>
                    </div>

                    {/* Stage Tasks */}
                    {isExpanded && (
                        <div className={cn("p-4 pt-0 space-y-3 rounded-b-xl border-t", theme.surface.highlight, theme.border.default)}>
                            <div className="h-2"></div>
                            {stage.tasks.map((task) => (
                                <div key={task.id} className={cn("group relative p-4 rounded-lg border hover:shadow-md transition-all flex flex-col md:flex-row gap-4 items-start md:items-center hover:border-blue-500", theme.surface.default, theme.border.default)}>
                                    <button
                                        onClick={() => onToggleTask(stage.id, task.id)}
                                        title={task.status === TaskStatusBackend.COMPLETED ? 'Mark as incomplete' : 'Mark as complete'}
                                        className={cn(
                                            "shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors hover:border-blue-500",
                                            task.status === TaskStatusBackend.COMPLETED
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : 'border-slate-300 text-transparent'
                                        )}
                                    >
                                        <CheckCircle className="h-4 w-4 fill-current"/>
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h5 className={cn("font-semibold text-sm", task.status === TaskStatusBackend.COMPLETED ? "text-slate-400 line-through" : theme.text.primary)}>
                                                {task.title}
                                            </h5>
                                            {task.priority === 'High' && task.status !== TaskStatusBackend.COMPLETED && (
                                                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-200">HIGH</span>
                                            )}
                                        </div>
                                        {task.description && (
                                            <p className={cn("text-xs mb-2 line-clamp-1", theme.text.secondary)}>{task.description}</p>
                                        )}
                                        <div className={cn("flex flex-wrap items-center gap-4 text-xs", theme.text.tertiary)}>
                                            <span className="flex items-center gap-1"><UserAvatar name={task.assignee || 'Unassigned'} size="sm" className="w-4 h-4 text-[9px]"/> {task.assignee || 'Unassigned'}</span>
                                            {task.dueDate && (
                                                <span className={`flex items-center gap-1 ${task.status !== TaskStatusBackend.COMPLETED && new Date(task.dueDate) < new Date() ? 'text-red-500 font-bold' : ''}`}>
                                                    <Clock className="h-3 w-3"/> Due: {task.dueDate}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {task.relatedModule && onNavigateToModule && (
                                        <button
                                            onClick={() => onNavigateToModule(task.relatedModule!)}
                                            className="w-full md:w-auto mt-2 md:mt-0 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                                        >
                                            {task.actionLabel || 'View Module'}
                                            <ArrowRight className="h-3 w-3"/>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        })}
    </div>
  );
};
