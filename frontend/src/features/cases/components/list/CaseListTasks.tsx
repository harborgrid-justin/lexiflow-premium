/**
 * CaseListTasks.tsx
 * 
 * Task management view with filtering by category (all, discovery, pleadings, evidence, trial).
 * Virtual scrolling for performance with large task lists.
 * 
 * @module components/case-list/CaseListTasks
 * @category Case Management - Task Views
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useEffect } from 'react';
import { Plus, FileText, Scale, Box, Gavel, ArrowRight } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Badge } from '@/components/atoms/Badge';
import { TaskCreationModal } from '@/components/organisms/TaskCreationModal';
import { VirtualList } from '@/components/organisms/VirtualList';
import { LazyLoader } from '@/components/molecules/LazyLoader';

// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';
import { useQuery, useMutation, queryClient } from '@/hooks/useQueryHooks';
import { useModalState } from '@/hooks';

// Services & Utils
import { DataService } from '@/services';
import { cn } from '@/utils/cn';
// ✅ Migrated to backend API (2025-12-21)
import { queryKeys } from '@/utils/queryKeys';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { WorkflowTask, Case, TaskStatusBackend } from '@/types';

interface CaseListTasksProps {
  onSelectCase?: (c: Case) => void;
}

export const CaseListTasks: React.FC<CaseListTasksProps> = ({ onSelectCase }) => {
  const taskModal = useModalState();
  const [filter, setFilter] = useState('All');
  const { theme } = useTheme();

  const { data: tasks = [], isLoading, refetch, error } = useQuery<WorkflowTask[]>(['tasks', 'all'], () => DataService.tasks.getAll());
  
  const { mutate: addTask } = useMutation(DataService.tasks.add, {
      onSuccess: () => queryClient.invalidate(queryKeys.tasks.all())
  });

  const { mutate: updateTask } = useMutation(
      (payload: {id: string, updates: Partial<WorkflowTask>}) => DataService.tasks.update(payload.id, payload.updates),
      {
          onSuccess: () => queryClient.invalidate(queryKeys.tasks.all())
      }
  );

  const getModuleIcon = (module?: string) => {
      switch(module) {
          case 'Documents': return <FileText className={cn("h-3 w-3 mr-1", theme.text.tertiary)}/>;
          case 'Discovery': return <Scale className="h-3 w-3 mr-1 text-purple-500"/>;
          case 'Evidence': return <Box className="h-3 w-3 mr-1 text-amber-500"/>;
          case 'Motions': return <Gavel className="h-3 w-3 mr-1 text-blue-500"/>;
          default: return null;
      }
  };

  // Ensure tasks is always an array
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  
  const filteredTasks = safeTasks.filter(t => {
      if (filter === 'All') return true;
      if (filter === 'Pending') return t.status === TaskStatusBackend.TODO || t.status === TaskStatusBackend.IN_PROGRESS;
      if (filter === 'High Priority') return t.priority === 'High';
      return true;
  });

  const handleAddTask = async (newTask: WorkflowTask) => {
      await addTask(newTask);
  };

  const handleToggle = async (id: string) => {
      const task = safeTasks.find(t => t.id === id);
      if (task) {
          const newStatus = task.status === TaskStatusBackend.COMPLETED ? TaskStatusBackend.TODO : TaskStatusBackend.COMPLETED;
          await updateTask({id, updates: {status: newStatus as any}});
      }
  };

  const handleTaskClick = async (task: WorkflowTask) => {
      if (task.caseId && onSelectCase) {
          const found = await DataService.cases.getById(task.caseId);
          if (found) onSelectCase(found);
      }
  };
  
  const renderRow = (t: WorkflowTask) => (
    <div key={t.id} className={cn("p-4 flex items-start transition-colors group h-[90px] border-b", theme.border.default, `hover:${theme.surface.highlight}`)}>
        <div className="pt-0.5 mr-4">
            <input
                type="checkbox"
                className="h-5 w-5 text-blue-600 rounded border-slate-300 cursor-pointer"
                checked={t.status === TaskStatusBackend.COMPLETED}
                onChange={() => handleToggle(t.id)}
                aria-label={`Mark ${t.title} as ${t.status === TaskStatusBackend.COMPLETED ? 'incomplete' : 'complete'}`}
            />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
              <p className={cn("text-sm font-bold truncate pr-2", t.status === TaskStatusBackend.COMPLETED ? "text-slate-400 line-through" : theme.text.primary)}>{t.title}</p>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={t.priority === 'High' ? 'error' : t.priority === 'Medium' ? 'warning' : 'neutral'}>{t.priority}</Badge>
                {t.caseId && (
                    <button 
                        onClick={() => handleTaskClick(t)}
                        className={cn("flex items-center px-2 py-1 rounded text-[10px] font-medium transition-colors border border-transparent", "text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-200")}
                        title="Go to Case"
                    >
                        Case <ArrowRight className="h-3 w-3 ml-1"/>
                    </button>
                )}
              </div>
          </div>
          <p className={cn("text-xs mt-1 flex items-center", theme.text.secondary)}>
              {t.relatedModule && <span className={cn("flex items-center mr-3 px-1.5 py-0.5 rounded", theme.surface.highlight)}>{getModuleIcon(t.relatedModule)} {t.relatedModule}</span>}
              <span className="mr-3">Due: {t.dueDate}</span>
              <span>Assignee: {t.assignee}</span>
          </p>
          {t.relatedItemTitle && (
              <p className={cn("text-xs mt-1 pl-2 border-l-2 truncate opacity-80", theme.primary.text, theme.primary.border)}>
                  Linked: {t.relatedItemTitle}
              </p>
          )}
        </div>
    </div>
  );

  return (
    <div className="space-y-4 h-full flex flex-col">
      {taskModal.isOpen && <TaskCreationModal isOpen={true} onClose={taskModal.close} onSave={handleAddTask} />}
      
      <div className={cn("flex flex-col sm:flex-row justify-between items-center gap-4 p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
        <div>
            <h3 className={cn("font-bold", theme.text.primary)}>Task Manager</h3>
            <p className={cn("text-sm", theme.text.secondary)}>Cross-module workflow & assignments</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <select 
              className={cn("border text-sm rounded-md px-3 py-1.5 outline-none", theme.surface.default, theme.border.default, theme.text.primary)} 
              value={filter} 
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilter(e.target.value)}
              aria-label="Filter Tasks"
            >
                <option value="All">All Tasks</option>
                <option value="Pending">Pending</option>
                <option value="High Priority">High Priority</option>
            </select>
            <button 
              onClick={taskModal.open}
              className={cn("flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors", theme.primary.DEFAULT, theme.text.inverse, theme.primary.hover)}
            >
              <Plus className="h-4 w-4 mr-2"/> Add Task
            </button>
        </div>
      </div>

      <div className={cn("rounded-lg border shadow-sm flex-1 overflow-hidden", theme.surface.default, theme.border.default)}>
        {isLoading ? (
          <LazyLoader />
        ) : error ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <p className={cn("text-sm mb-2", theme.text.secondary)}>
                Unable to load tasks. Please ensure the backend is running.
              </p>
              <p className={cn("text-xs", theme.text.tertiary)}>
                Working in offline mode with cached data.
              </p>
            </div>
          </div>
        ) : (
          <VirtualList 
            items={filteredTasks}
            height="100%"
            itemHeight={90}
            renderItem={renderRow}
            emptyMessage="No tasks found."
          />
        )}
      </div>
    </div>
  );
};

