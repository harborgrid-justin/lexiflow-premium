/**
 * ProjectCard.tsx
 * 
 * Expandable project card with progress bar, task list, and module navigation.
 * 
 * @module components/case-detail/projects/ProjectCard
 * @category Case Management - Projects
 */

// External Dependencies
import React from 'react';
import { Calendar, CheckCircle, ChevronDown, ChevronUp, Plus } from 'lucide-react';

// Internal Dependencies - Components
import { Badge } from '../../../components/atoms/Badge';

// Internal Dependencies - Hooks & Context
import { useTheme } from '../../../../providers/ThemeContext';

// Internal Dependencies - Services & Utils
import { cn } from '@/utils/cn';

// Types & Interfaces
import { Project } from '../../../../types';

interface ProjectCardProps {
    project: Project;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onAddTask: (projectId: string) => void;
    onUpdateTaskStatus: (projectId: string, taskId: string) => void;
    onNavigateToModule?: (module: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ 
    project, isExpanded, onToggleExpand, onAddTask, onUpdateTaskStatus 
}) => {
    const { theme } = useTheme();

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Active': return cn(theme.status.info.bg, theme.status.info.text, theme.status.info.border);
            case 'Completed': return cn(theme.status.success.bg, theme.status.success.text, theme.status.success.border);
            case 'On Hold': return cn(theme.status.warning.bg, theme.status.warning.text, theme.status.warning.border);
            default: return cn(theme.surface.highlight, theme.text.secondary, theme.border.default);
        }
    };

    const totalTasks = project.tasks?.length ?? 0;
    const completedTasks = project.tasks?.filter(t => t.status === 'Done').length ?? 0;
    const progress = totalTasks === 0 ? (project.completionPercentage ?? 0) : Math.round((completedTasks / totalTasks) * 100);

    return (
        <div className={cn("rounded-xl border transition-all duration-300 shadow-sm overflow-hidden", theme.surface.default, project.priority === 'Urgent' ? 'border-l-4 border-l-red-500' : theme.border.default)}>
            {/* Project Header */}
            <div 
              className={cn("p-5 flex flex-col md:flex-row md:items-center justify-between cursor-pointer gap-4", `hover:${theme.surface.highlight}`)}
              onClick={onToggleExpand}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className={cn("font-bold text-lg truncate", theme.text.primary)}>{project.name}</h4>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold border", getStatusColor(project.status))}>
                    {project.status}
                  </span>
                  {project.priority === 'Urgent' && <Badge variant="error">Urgent</Badge>}
                </div>
                <p className={cn("text-sm line-clamp-1", theme.text.secondary)}>{project.description}</p>
                
                <div className={cn("flex flex-wrap items-center gap-4 mt-3 text-xs", theme.text.tertiary)}>
                  {project.startDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/> Started: {new Date(project.startDate).toLocaleDateString()}</span>}
                  {project.dueDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/> Due: {new Date(project.dueDate).toLocaleDateString()}</span>}
                  <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3"/> {completedTasks}/{totalTasks} Tasks</span>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
                <div className="flex-1 md:w-32">
                  <div className={cn("flex justify-between text-xs mb-1 font-medium", theme.text.secondary)}>
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className={cn("w-full rounded-full h-1.5", theme.surface.highlight)}>
                    <div className={cn("h-1.5 rounded-full transition-all", theme.action.primary.bg)} data-progress={progress}></div>
                  </div>
                  <style>{`
                    [data-progress="${progress}"] {
                      width: ${progress}%;
                    }
                  `}</style>
                </div>
                <button 
                  className={cn("transition-colors", theme.text.tertiary, `hover:${theme.text.link}`)}
                  title={isExpanded ? "Collapse project" : "Expand project"}
                  aria-label={isExpanded ? "Collapse project details" : "Expand project details"}
                >
                  {isExpanded ? <ChevronUp className="h-5 w-5"/> : <ChevronDown className="h-5 w-5"/>}
                </button>
              </div>
            </div>

            {/* Task List */}
            {isExpanded && (
              <div className={cn("p-5 pt-0 border-t bg-slate-50/50", theme.border.default)}>
                <div className="space-y-3 mt-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                  {project.tasks?.map((task) => (
                    <div key={task.id} className={cn("group flex flex-col md:flex-row gap-3 items-start md:items-center p-3 rounded-lg border transition-all hover:shadow-sm", theme.surface.default, theme.border.default)}>
                      <button 
                        onClick={() => onUpdateTaskStatus(project.id, task.id)}
                        title={task.status === 'Done' ? 'Mark as incomplete' : 'Mark as complete'}
                        aria-label={task.status === 'Done' ? 'Mark task as incomplete' : 'Mark task as complete'}
                        className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          task.status === 'Done' 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : cn('text-transparent', theme.border.default, `hover:${theme.action.primary.border}`)
                        }`}
                      >
                        <CheckCircle className="h-3.5 w-3.5 fill-current"/>
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className={cn("text-sm font-medium truncate", task.status === 'Done' ? "text-slate-400 line-through" : theme.text.primary)}>
                            {task.name}
                          </h5>
                        </div>
                        <div className={cn("flex items-center gap-3 text-xs mt-0.5", theme.text.tertiary)}>
                          {task.assignedTo && <span>{task.assignedTo}</span>}
                          {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(project.tasks?.length ?? 0) === 0 && (
                    <div className={cn("text-center py-4 text-sm italic", theme.text.tertiary)}>No tasks in this project.</div>
                  )}

                  <button 
                    onClick={() => onAddTask(project.id)}
                    className={cn("w-full py-2 text-xs font-medium rounded border border-dashed transition-colors flex items-center justify-center gap-1", theme.text.primary, theme.border.default, `hover:${theme.surface.default}`, `hover:${theme.primary.text}`)}
                  >
                    <Plus className="h-3 w-3"/> Add Task to Project
                  </button>
                </div>
              </div>
            )}
        </div>
    );
};
