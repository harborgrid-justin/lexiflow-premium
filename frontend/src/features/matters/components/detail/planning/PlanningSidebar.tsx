/**
 * PlanningSidebar.tsx
 * 
 * Collapsible phase/task hierarchy sidebar for Gantt planning view
 * with task counts and status badges.
 * 
 * @module components/case-detail/planning/PlanningSidebar
 * @category Case Management - Planning
 */

// External Dependencies
import React from 'react';
import { ChevronRight, ChevronDown, GripVertical, AlertCircle, Plus } from 'lucide-react';

// Internal Dependencies - Components
import { Badge } from '../../../common/Badge';

// Internal Dependencies - Hooks & Context
import { useTheme } from '../../../../context/ThemeContext';

// Internal Dependencies - Services & Utils
import { cn } from '../../../../utils/cn';

// Types & Interfaces
import { CasePhase, WorkflowTask } from '../../../../types';

interface PlanningSidebarProps {
  phases: CasePhase[];
  tasks: WorkflowTask[];
  collapsedPhases: Set<string>;
  activeTaskId: string | null;
  onTogglePhase: (id: string) => void;
  onHoverTask: (id: string) => void;
  onAddTask: () => void;
}

export const PlanningSidebar: React.FC<PlanningSidebarProps> = ({
  phases, tasks, collapsedPhases, activeTaskId, onTogglePhase, onHoverTask, onAddTask
}) => {
  const { theme } = useTheme();

  return (
    <div className={cn("w-96 border-r flex flex-col overflow-hidden shadow-lg z-10", theme.surface.default, theme.border.default)}>
        <div className={cn("h-8 border-b flex items-center px-4 font-bold text-xs uppercase", theme.surface.highlight, theme.border.default, theme.text.secondary)}>
            Work Breakdown Structure
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {phases.map(phase => (
                <div key={phase.id} className={cn("border-b last:border-0", theme.border.default)}>
                    <div 
                    className={cn(
                        "flex items-center justify-between p-3 cursor-pointer transition-colors sticky top-0 z-10 border-b border-transparent",
                        theme.surface.default,
                        `hover:${theme.surface.highlight}`,
                        collapsedPhases.has(phase.id) && cn("border-b", theme.border.default)
                    )}
                    onClick={() => onTogglePhase(phase.id)}
                    >
                        <div className={cn("flex items-center gap-2 font-bold text-sm", theme.text.primary)}>
                            {collapsedPhases.has(phase.id) ? <ChevronRight className={cn("h-4 w-4", theme.text.tertiary)}/> : <ChevronDown className={cn("h-4 w-4", theme.text.tertiary)}/>}
                            {phase.name}
                        </div>
                        <Badge variant={phase.status === 'Active' ? 'success' : 'neutral'}>{phase.status}</Badge>
                    </div>

                    {!collapsedPhases.has(phase.id) && (
                        <div className={cn(theme.surface.highlight)}>
                            {/* Simple mock filter for tasks belonging to phase - in real app would check ID */}
                            {tasks.filter(t => true).slice(0, 3).map(task => (
                                <div 
                                key={task.id} 
                                className={cn(
                                    "flex items-center gap-3 pl-8 pr-3 py-2 text-sm cursor-pointer border-l-2 border-transparent group transition-colors hover:border-blue-500", 
                                    activeTaskId === task.id ? cn(theme.primary.light, theme.action.primary.border) : theme.surface.default
                                )}
                                onMouseEnter={() => onHoverTask(task.id)}
                                >
                                    <div className={cn("p-1 rounded cursor-grab active:cursor-grabbing", theme.text.tertiary, `group-hover:${theme.primary.text}`)}>
                                        <GripVertical className="h-3 w-3"/>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn("truncate font-medium", theme.text.primary)}>{task.title}</p>
                                        <p className={cn("text-[10px]", theme.text.secondary)}>{task.assignee} • {task.dueDate}</p>
                                    </div>
                                    {task.priority === 'High' && <AlertCircle className="h-3 w-3 text-red-500"/>}
                                </div>
                            ))}
                            <div className="pl-8 p-2">
                                <button onClick={onAddTask} className={cn("text-xs flex items-center transition-colors", theme.text.tertiary, `hover:${theme.primary.text}`)}>
                                    <Plus className="h-3 w-3 mr-1"/> Add Task
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
  );
};
