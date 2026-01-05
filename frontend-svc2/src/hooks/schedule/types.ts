/**
 * Type definitions for Schedule Dependencies
 */

export type DependencyType = 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';

export interface TaskDependency {
  id: string;
  fromTaskId: string;
  toTaskId: string;
  type: DependencyType;
  lagDays?: number;
}

export interface ScheduleTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  progress: number;
  isMilestone?: boolean;
  isOnCriticalPath?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CriticalPath {
  taskIds: string[];
  totalDuration: number;
  slackTime: Map<string, number>;
}

export interface UseScheduleDependenciesReturn {
  dependencies: TaskDependency[];
  criticalPath: CriticalPath | null;
  addDependency: (dependency: Omit<TaskDependency, 'id'>) => string;
  removeDependency: (id: string) => void;
  updateDependency: (id: string, updates: Partial<TaskDependency>) => void;
  validateDependency: (dependency: Omit<TaskDependency, 'id'>) => ValidationResult;
  hasCircularDependency: (fromTaskId: string, toTaskId: string) => boolean;
  calculateCriticalPath: () => CriticalPath | null;
  isTaskOnCriticalPath: (taskId: string) => boolean;
  getTaskSlack: (taskId: string) => number;
  cascadeTaskUpdate: (taskId: string, newEndDate: Date) => Map<string, Date>;
  getDependentTasks: (taskId: string, type?: 'direct' | 'all') => string[];
  getPredecessorTasks: (taskId: string, type?: 'direct' | 'all') => string[];
  getDependencyPath: (
    dependencyId: string,
    getTaskPosition?: (taskId: string) => { x: number; y: number; width: number; height: number } | null
  ) => { start: { x: number; y: number }; end: { x: number; y: number } } | null;
  getDependencyColor: (dependencyId: string) => string;
}
