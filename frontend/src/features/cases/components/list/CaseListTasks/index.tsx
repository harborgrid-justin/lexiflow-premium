import { TaskCreationModal } from '@/features/cases/ui/components/TaskCreationModal/TaskCreationModal';
import { VirtualList } from '@/shared/ui/organisms/VirtualList/VirtualList';
import { LazyLoader } from '@/shared/ui/molecules/LazyLoader/LazyLoader';
import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import { TaskRow } from './TaskRow';
import { TaskHeader } from './TaskHeader';
import { useCaseListTasks } from './useCaseListTasks';
import type { CaseListTasksProps } from './types';

export const CaseListTasks: React.FC<CaseListTasksProps> = ({ onSelectCase }) => {
  const { theme } = useTheme();
  const {
    taskModal,
    filter,
    setFilter,
    filteredTasks,
    isLoading,
    error,
    handleAddTask,
    handleToggle,
    handleTaskClick,
  } = useCaseListTasks(onSelectCase);

  return (
    <div className="space-y-4 h-full flex flex-col">
      {taskModal.isOpen && <TaskCreationModal isOpen onClose={taskModal.close} onSave={handleAddTask} />}
      <TaskHeader filter={filter} onFilterChange={setFilter} onAddTask={taskModal.open} />

      <div className={cn('rounded-lg border shadow-sm flex-1 overflow-hidden', theme.surface.default, theme.border.default)}>
        {isLoading ? (
          <LazyLoader />
        ) : error ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <p className={cn('text-sm mb-2', theme.text.secondary)}>Unable to load tasks. Please ensure the backend is running.</p>
              <p className={cn('text-xs', theme.text.tertiary)}>Working in offline mode with cached data.</p>
            </div>
          </div>
        ) : (
          <VirtualList
            items={filteredTasks}
            height="100%"
            itemHeight={90}
            renderItem={(t) => <TaskRow key={t.id} task={t} onToggle={handleToggle} onTaskClick={handleTaskClick} />}
            emptyMessage="No tasks found."
          />
        )}
      </div>
    </div>
  );
};

export type { CaseListTasksProps } from './types';
