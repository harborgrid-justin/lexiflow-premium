import { WorkflowCategory } from '../dto/create-workflow-template.dto';

/**
 * Interface for workflow stage data
 */
export interface IWorkflowStage {
  name: string;
  description?: string;
  order: number;
  durationDays?: number;
}

/**
 * Interface for workflow query filters
 */
export interface IWorkflowQueryFilters {
  category?: WorkflowCategory;
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

/**
 * Interface for workflow instantiation result
 */
export interface IWorkflowInstantiationResult {
  tasks: IWorkflowTask[];
  caseId: string;
  templateId: string;
  templateName: string;
}

/**
 * Interface for generated workflow task
 */
export interface IWorkflowTask {
  title: string;
  description: string;
  caseId: string;
  status: string;
  priority: string;
  order: number;
  dueDate: string | null;
  workflowTemplateId: string;
}

/**
 * Interface for paginated workflow response
 */
export interface IPaginatedWorkflowResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
