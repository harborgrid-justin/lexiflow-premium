
import React from 'react';
import { ChevronRight, ChevronDown, GripVertical, AlertCircle, Plus } from 'lucide-react';
import { Badge } from '../../common/Badge';
import { CasePhase, WorkflowTask } from '../../../types';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

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
    <div className={cn("w-96 border-r flex flex-col bg-white overflow-hidden shadow-lg z-10", theme.border.default)}>
        <div className={cn("h-8 border-b bg-slate-50 flex items-center px-4 font-bold text-xs uppercase text-slate-500", theme.border.default)}>
            Work Breakdown Structure
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {phases.map(phase => (
                <div key={phase.id} className="border-b last:border-0 border-slate-100">
                    <div 
                    className={cn(
                        "flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors sticky top-0 bg-white z-10 border-b border-transparent",
                        collapsedPhases.has(phase.id) && "border-b-slate-100"
                    )}
                    onClick={() => onTogglePhase(phase.id)}
                    >
                        <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                            {collapsedPhases.has(phase.id) ? <ChevronRight className="h-4 w-4 text-slate-400"/> : <ChevronDown className="h-4 w-4 text-slate-400"/>}
                            {phase.name}
                        </div>
                        <Badge variant={phase.status === 'Active' ? 'success' : 'neutral'}>{phase.status}</Badge>
                    </div>

                    {!collapsedPhases.has(phase.id) && (
                        <div className="bg-slate-50/50">
                            {/* Simple mock filter for tasks belonging to phase - in real app would check ID */}
                            {tasks.filter(t => true).slice(0, 3).map(task => (
                                <div 
                                key={task.id} 
                                className={cn("flex items-center gap-3 pl-8 pr-3 py-2 text-sm hover:bg-blue-50 cursor-pointer border-l-2 border-transparent hover:border-blue-500 group", activeTaskId === task.id && "bg-blue-50 border-blue-500")}
                                onMouseEnter={() => onHoverTask(task.id)}
                                >
                                    <div className={cn("p-1 rounded text-slate-400 group-hover:text-blue-500 cursor-grab active:cursor-grabbing")}>
                                        <GripVertical className="h-3 w-3"/>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate font-medium text-slate-700">{task.title}</p>
                                        <p className="text-[10px] text-slate-500">{task.assignee} • {task.dueDate}</p>
                                    </div>
                                    {task.priority === 'High' && <AlertCircle className="h-3 w-3 text-red-500"/>}
                                </div>
                            ))}
                            <div className="pl-8 p-2">
                                <button onClick={onAddTask} className="text-xs flex items-center text-slate-400 hover:text-blue-600 transition-colors">
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
