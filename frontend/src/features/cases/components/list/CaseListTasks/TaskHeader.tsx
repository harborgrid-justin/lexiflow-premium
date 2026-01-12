import React from 'react';
import { Plus } from 'lucide-react';
import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import type { TaskHeaderProps } from './types';

export const TaskHeader: React.FC<TaskHeaderProps> = ({ filter, onFilterChange, onAddTask }) => {
  const { theme } = useTheme();

  return (
    <div className={cn('flex flex-col sm:flex-row justify-between items-center gap-4 p-4 rounded-lg border shadow-sm', theme.surface.default, theme.border.default)}>
      <div>
        <h3 className={cn('font-bold', theme.text.primary)}>Task Manager</h3>
        <p className={cn('text-sm', theme.text.secondary)}>Cross-module workflow & assignments</p>
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <select
          className={cn('border text-sm rounded-md px-3 py-1.5 outline-none', theme.surface.default, theme.border.default, theme.text.primary)}
          value={filter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onFilterChange(e.target.value)}
          aria-label="Filter Tasks"
        >
          <option value="All">All Tasks</option>
          <option value="Pending">Pending</option>
          <option value="High Priority">High Priority</option>
        </select>
        <button
          onClick={onAddTask}
          className={cn('flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors', theme.primary.DEFAULT, theme.text.inverse, theme.primary.hover)}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Task
        </button>
      </div>
    </div>
  );
};
