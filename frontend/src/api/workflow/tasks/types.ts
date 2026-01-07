/**
 * Tasks Module Types
 */

export type {
  TaskAssignmentDto,
  TaskAttachment,
  TaskBulkOperationResult,
  TaskComment,
  TaskFiltersExtended,
  TaskHistory,
  TaskPriorityBackend,
  TaskRelationshipDto,
  TaskStatistics,
  TaskStatusBackend,
  WorkflowTask,
} from "@/types";

export interface CreateTaskDto {
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  caseId?: string;
  assignedTo?: string;
  parentTaskId?: string;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  completionPercentage?: number;
  createdBy?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  caseId?: string;
  assignedTo?: string;
  parentTaskId?: string;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  completionPercentage?: number;
}

export interface TaskFilters {
  caseId?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
}
