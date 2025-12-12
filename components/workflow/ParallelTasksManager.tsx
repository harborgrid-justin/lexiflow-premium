
import React from 'react';
import { GitMerge, MoreHorizontal, User, Loader2 } from 'lucide-react';
import { TaskWorkflowBadges } from './TaskWorkflowBadges';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { WorkflowTask } from '../../types';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';

export const ParallelTasksManager: React.FC = () => {
  const { theme } = useTheme();
  
  // Performance Engine: useQuery
  const { data: allTasks = [], isLoading } = useQuery<WorkflowTask[]>(
      [STORES.TASKS, 'all'],
      DataService.tasks.getAll
  );

  const tasks = allTasks.filter(t => t.status === 'In Progress' || t.status === 'Pending').slice(0, 4);

  if (isLoading) return <div className="flex justify-center p-6"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className={cn("font-bold flex items-center", theme.text.primary)}>
          <GitMerge className="h-5 w-5 mr-2 text-indigo-600" /> Parallel Execution Tracks
        </h3>
        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100 font-medium">{tasks.length} Active Tracks</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tasks.map(task => (
          <div key={task.id} className={cn("p-4 rounded-lg border shadow-sm relative overflow-hidden group hover:shadow-md transition-all", theme.surface.default, theme.border.default)}>
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            <div className="flex justify-between items-start mb-2">
              <span className={cn("text-[10px] uppercase font-bold tracking-wider truncate max-w-[100px]", theme.text.tertiary)}>{task.relatedModule || 'General'} Track</span>
              <button className={cn(theme.text.tertiary, `hover:${theme.text.primary}`)}><MoreHorizontal className="h-4 w-4"/></button>
            </div>
            <h4 className={cn("font-bold text-sm mb-3", theme.text.primary)}>{task.title}</h4>
            
            <div className="flex items-center justify-between mt-4">
              <div className={cn("flex items-center text-xs", theme.text.secondary)}>
                <User className="h-3 w-3 mr-1"/> {task.assignee}
              </div>
              <TaskWorkflowBadges status={task.status} />
            </div>
          </div>
        ))}
        {tasks.length === 0 && <div className="col-span-3 text-center py-8 text-slate-400">No parallel tasks active.</div>}
      </div>
    </div>
  );
};
