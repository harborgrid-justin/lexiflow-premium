import { WorkflowTask, Case } from '@/types';

export interface CaseListTasksProps {
  onSelectCase?: (c: Case) => void;
}

export interface TaskRowProps {
  task: WorkflowTask;
  onToggle: (id: string) => void;
  onTaskClick: (task: WorkflowTask) => void;
}

export interface TaskHeaderProps {
  filter: string;
  onFilterChange: (value: string) => void;
  onAddTask: () => void;
}
