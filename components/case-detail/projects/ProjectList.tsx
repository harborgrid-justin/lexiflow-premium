
import React, { useState } from 'react';
import { Project, WorkflowTask } from '../../../types';
import { 
  FileText, DollarSign, Scale, Gavel, Layout, ChevronDown, ChevronUp, Box, CheckCircle, Plus, User, Calendar
} from 'lucide-react';
import { Badge } from '../../../components/common/Badge';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

interface ProjectListProps {
  projects: Project[];
  onAddTask: (projectId: string) => void;
  onUpdateTaskStatus: (projectId: string, taskId: string) => void;
  onNavigateToModule?: (module: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, onAddTask, onUpdateTaskStatus, onNavigateToModule }) => {
  const { theme } = useTheme();
  const [expandedProject, setExpandedProject] = useState<string | null>(projects.find(p => p.status === 'Active')?.id || null);

  const getModuleIcon = (module?: string) => {
    switch(module) {
        case 'Documents': return <FileText className="h-4 w-4"/>;
        case 'Billing': return <DollarSign className="h-4 w-4"/>;
        case 'Discovery': return <Scale className="h-4 w-4"/>;
        case 'Motions': return <Gavel className="h-4 w-4"/>;
        case 'Evidence': return <Box className="h-4 w-4"/>;
        default: return <Layout className="h-4 w-4"/>;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
        case 'Active': return cn(theme.status.info.bg, theme.status.info.text, theme.status.info.border);
        case 'Completed': return cn(theme.status.success.bg, theme.status.success.text, theme.status.success.border);
        case 'On Hold': return cn(theme.status.warning.bg, theme.status.warning.text, theme.status.warning.border);
        default: return cn(theme.surfaceHighlight, theme.text.secondary, theme.border.default);
    }
  };

  return (
    <div className="space-y-6">
      {projects.map((project) => {
        const isExpanded = expandedProject === project.id;
        const totalTasks = project.tasks.length;
        const completedTasks = project.tasks.filter(t => t.status === 'Done').length;
        const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

        return (
          <div key={project.id} className={cn("rounded-xl border transition-all duration-300 shadow-sm overflow-hidden", theme.surface, project.priority === 'Critical' ? 'border-l-4 border-l-red-500' : theme.border.default)}>
            {/* Project Header */}
            <div 
              className={cn("p-5 flex flex-col md:flex-row md:items-center justify-between cursor-pointer gap-4", `hover:${theme.surfaceHighlight}`)}
              onClick={() => setExpandedProject(isExpanded ? null : project.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className={cn("font-bold text-lg truncate", theme.text.primary)}>{project.title}</h4>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold border", getStatusColor(project.status))}>
                    {project.status}
                  </span>
                  {project.priority === 'Critical' && <Badge variant="error">Critical</Badge>}
                </div>
                <p className={cn("text-sm line-clamp-1", theme.text.secondary)}>{project.description}</p>
                
                <div className={cn("flex flex-wrap items-center gap-4 mt-3 text-xs", theme.text.tertiary)}>
                  <span className="flex items-center gap-1"><User className="h-3 w-3"/> Lead: {project.lead}</span>
                  {project.dueDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/> Due: {project.dueDate}</span>}
                  <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3"/> {completedTasks}/{totalTasks} Tasks</span>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
                <div className="flex-1 md:w-32">
                  <div className={cn("flex justify-between text-xs mb-1 font-medium", theme.text.secondary)}>
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className={cn("w-full rounded-full h-1.5", theme.surfaceHighlight)}>
                    <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
                <button className={cn("hover:text-blue-600", theme.text.tertiary)}>
                  {isExpanded ? <ChevronUp className="h-5 w-5"/> : <ChevronDown className="h-5 w-5"/>}
                </button>
              </div>
            </div>

            {/* Task List */}
            {isExpanded && (
              <div className={cn("p-5 pt-0 border-t bg-slate-50/50", theme.border.light)}>
                <div className="space-y-3 mt-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                  {project.tasks.map((task) => (
                    <div key={task.id} className={cn("group flex flex-col md:flex-row gap-3 items-start md:items-center p-3 rounded-lg border transition-all hover:shadow-sm", theme.surface, theme.border.default, "hover:border-blue-300")}>
                      <button 
                        onClick={() => onUpdateTaskStatus(project.id, task.id)}
                        className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          task.status === 'Done' 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-slate-300 hover:border-blue-500 text-transparent'
                        }`}
                      >
                        <CheckCircle className="h-3.5 w-3.5 fill-current"/>
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className={cn("text-sm font-medium truncate", task.status === 'Done' ? "text-slate-400 line-through" : theme.text.primary)}>
                            {task.title}
                          </h5>
                          {task.priority === 'High' && task.status !== 'Done' && <span className="w-2 h-2 rounded-full bg-red-500" title="High Priority"></span>}
                        </div>
                        <div className={cn("flex items-center gap-3 text-xs mt-0.5", theme.text.tertiary)}>
                          <span>{task.assignee}</span>
                          {task.dueDate && <span>Due: {task.dueDate}</span>}
                        </div>
                      </div>

                      {task.relatedModule && onNavigateToModule && (
                        <button 
                          onClick={() => onNavigateToModule(task.relatedModule!)}
                          className={cn("w-full md:w-auto px-3 py-1.5 border rounded text-xs font-medium flex items-center justify-center gap-2 transition-all whitespace-nowrap", theme.surfaceHighlight, theme.text.secondary, theme.border.default, `hover:${theme.surface}`, "hover:text-blue-600 hover:border-blue-200")}
                        >
                          {getModuleIcon(task.relatedModule)}
                          {task.actionLabel || `Go to ${task.relatedModule}`}
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {project.tasks.length === 0 && (
                    <div className={cn("text-center py-4 text-sm italic", theme.text.tertiary)}>No tasks in this project.</div>
                  )}

                  <button 
                    onClick={() => onAddTask(project.id)}
                    className={cn("w-full py-2 text-xs font-medium rounded border border-dashed transition-colors flex items-center justify-center gap-1", theme.text.primary, theme.border.default, `hover:${theme.surface}`, `hover:${theme.primary.text}`)}
                  >
                    <Plus className="h-3 w-3"/> Add Task to Project
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
