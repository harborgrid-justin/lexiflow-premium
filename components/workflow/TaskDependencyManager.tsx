
import React from 'react';
import { CheckSquare, Lock, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { useQuery } from '../../services/queryClient';
import { DataService } from '../../services/dataService';
import { STORES } from '../../services/db';

export const TaskDependencyManager: React.FC = () => {
  const { theme } = useTheme();
  
  // Performance Engine: useQuery
  const { data: tasks = [], isLoading } = useQuery(
      [STORES.TASKS, 'all'],
      DataService.tasks.getAll
  );

  // Mock dependency derivation for visualization
  const dependencies = React.useMemo(() => {
      if (tasks.length < 3) return [];
      return [
          { ...tasks[0], type: 'completed' },
          { ...tasks[1], type: 'active' },
          { ...tasks[2], type: 'locked' }
      ];
  }, [tasks]);

  if (isLoading) return <div className="flex justify-center p-6"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="space-y-4 max-w-lg mx-auto py-4">
      <h3 className={cn("font-bold text-center mb-6", theme.text.primary)}>Task Dependency Chain</h3>
      
      <div className="relative">
        <div className={cn("absolute left-6 top-8 bottom-8 w-0.5 -z-10", theme.border.default)}></div>
        
        {dependencies.map((task, idx) => (
            <div key={task.id} className="flex items-center gap-4 mb-6 last:mb-0">
                <div className={cn(
                    "w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 z-10",
                    task.type === 'completed' ? "bg-green-100 border-green-500" :
                    task.type === 'active' ? "bg-blue-100 border-blue-500" :
                    "bg-slate-50 border-slate-300"
                )}>
                    {task.type === 'completed' && <CheckSquare className="h-6 w-6 text-green-600" />}
                    {task.type === 'active' && <span className="font-bold text-blue-700">{idx + 1}</span>}
                    {task.type === 'locked' && <Lock className="h-5 w-5 text-slate-400" />}
                </div>
                <div className={cn(
                    "p-3 rounded-lg border shadow-sm flex-1",
                    theme.surface,
                    theme.border.default,
                    task.type === 'active' ? "ring-2 ring-blue-100" : task.type === 'locked' ? "opacity-75" : ""
                )}>
                    <p className={cn("font-bold text-sm", task.type === 'completed' ? "line-through opacity-50" : theme.text.primary)}>{task.title}</p>
                    <p className={cn("text-xs font-medium", 
                        task.type === 'completed' ? "text-green-600" : 
                        task.type === 'active' ? "text-blue-600" : 
                        theme.text.tertiary
                    )}>
                        {task.type === 'completed' ? 'Completed' : task.type === 'active' ? 'In Progress' : `Blocked by Task ${idx}`}
                    </p>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};
