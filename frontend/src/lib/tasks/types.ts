/**
 * Tasks Provider Types
 * Type definitions for task/workflow management context
 *
 * @module lib/tasks/types
 */

import type { WorkflowTask } from "@/types/tasks";

export interface TasksStateValue {
  tasks: WorkflowTask[];
  activeTaskId: string | null;
  activeTask: WorkflowTask | null;
  isLoading: boolean;
  error: Error | null;
  filterByCaseId: string | null;
  filterByStatus: string | null;
}

export interface TasksActionsValue {
  loadTasks: (filters?: {
    caseId?: string;
    status?: string;
    assigneeId?: string;
  }) => Promise<void>;
  loadTaskById: (id: string) => Promise<WorkflowTask | null>;
  createTask: (data: Partial<WorkflowTask>) => Promise<WorkflowTask>;
  updateTask: (
    id: string,
    updates: Partial<WorkflowTask>
  ) => Promise<WorkflowTask>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  assignTask: (id: string, assigneeId: string) => Promise<void>;
  setActiveTask: (id: string | null) => void;
  searchTasks: (query: string) => Promise<WorkflowTask[]>;
  filterByCase: (caseId: string | null) => void;
  filterByStatus: (status: string | null) => void;
  refreshTasks: () => Promise<void>;
}

export interface TasksProviderProps {
  children: React.ReactNode;
  initialTasks?: WorkflowTask[];
  caseId?: string;
}
