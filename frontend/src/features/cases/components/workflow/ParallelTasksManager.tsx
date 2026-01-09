import { GitMerge, MoreHorizontal, User, ListTodo } from 'lucide-react';
import { TaskWorkflowBadges } from './TaskWorkflowBadges';
import { EmptyState } from '@/components/ui/molecules/EmptyState/EmptyState';
import { AdaptiveLoader } from '@/components/ui/molecules/AdaptiveLoader/AdaptiveLoader';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/shared/lib/cn';
import { DataService } from '@/services/data/dataService';
import { WorkflowTask, TaskStatusBackend } from '@/types';
import { useQuery } from '@/hooks/useQueryHooks';
import { queryKeys } from '@/utils/queryKeys';

export const ParallelTasksManager = () => {
  const { theme } = useTheme();

  // Performance Engine: useQuery
  const { data: allTasks = [], isLoading } = useQuery<WorkflowTask[]>(
      queryKeys.tasks.all(),
      () => DataService.tasks.getAll()
  );

  // Ensure allTasks is always an array to prevent .filter() errors
  const tasksArray = Array.isArray(allTasks) ? allTasks : [];
  const tasks = tasksArray.filter(t => t.status === TaskStatusBackend.IN_PROGRESS || t.status === TaskStatusBackend.TODO).slice(0, 4);

  if (isLoading) return <AdaptiveLoader contentType="list" shimmer itemCount={4} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className={cn("font-bold flex items-center", theme.text.primary)}>
          <GitMerge className="h-5 w-5 mr-2 text-indigo-600" /> Parallel Execution Tracks
        </h3>
        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100 font-medium">{tasks.length} Active Tracks</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tasks.length === 0 ? (
          <div className="col-span-3">
            <EmptyState
              icon={ListTodo}
              title="No parallel tasks"
              description="No parallel execution tracks are currently active."
            />
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className={cn("p-4 rounded-lg border shadow-sm relative overflow-hidden group hover:shadow-md transition-all", theme.surface.default, theme.border.default)}>
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              <div className="flex justify-between items-start mb-2">
                <span className={cn("text-[10px] uppercase font-bold tracking-wider truncate max-w-[100px]", theme.text.tertiary)}>{task.relatedModule || 'General'} Track</span>
                <button type="button" aria-label="Task options" className={cn(theme.text.tertiary, `hover:${theme.text.primary}`)}><MoreHorizontal className="h-4 w-4"/></button>
              </div>
              <h4 className={cn("font-bold text-sm mb-3", theme.text.primary)}>{task.title}</h4>

              <div className="flex items-center justify-between mt-4">
                <div className={cn("flex items-center text-xs", theme.text.secondary)}>
                  <User className="h-3 w-3 mr-1"/> {task.assignee}
                </div>
                <TaskWorkflowBadges status={task.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
