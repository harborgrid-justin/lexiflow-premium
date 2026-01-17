// types/workflow.ts
// Auto-generated from models.ts split

import { type TaskDependencyType, type UserRole, type StageStatus } from './enums';
import {
  type BaseEntity, type UserId, type TaskId, type ProjectId,
  type WorkflowTemplateId, type CaseId, type MetadataRecord, type JsonValue
} from './primitives';


// --- CLUSTER 6: WORKFLOW & AUTOMATION ---

/**
 * Task status discriminated union
 * Backend alignment: tasks/dto/create-task.dto.ts
 */
export enum TaskStatusBackend {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  BLOCKED = 'Blocked',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

/**
 * Task priority levels
 * Backend alignment: tasks/dto/create-task.dto.ts
 * Note: Backend uses CRITICAL instead of URGENT
 */
export enum TaskPriorityBackend {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

/**
 * Workflow task entity
 * @see Backend: tasks/entities/task.entity.ts
 * @see Shared: packages/shared-types/src/entities/task.entity.ts
 * 
 * Extends BaseEntity with workflow-specific fields.
 * Properties marked as "Frontend extension" are not persisted in backend.
 */
export type WorkflowTask = Omit<BaseEntity, 'createdBy'> & { 
  id: TaskId;
  // Core fields (EXACTLY aligned with backend Task entity)
  title: string;
  description?: string; // Backend: text, nullable
  status: TaskStatusBackend; // Backend: enum TaskStatus
  priority: TaskPriorityBackend; // Backend: enum TaskPriority
  dueDate?: string; // Backend: timestamp, nullable
  
  // Assignment (backend field names)
  assignedTo?: string; // Backend: assigned_to (uuid)
  createdBy?: string; // Backend: created_by (uuid) - overrides BaseEntity.createdBy which is UserId
  
  // Relationships
  caseId?: CaseId; // Backend: case_id (uuid, nullable)
  parentTaskId?: string; // Backend: parent_task_id (uuid, nullable)
  
  // Tracking (exact backend fields)
  tags?: string[]; // Backend: simple-array
  estimatedHours?: number; // Backend: estimated_hours decimal(10,2)
  actualHours?: number; // Backend: actual_hours decimal(10,2), default 0
  completionPercentage?: number; // Backend: completion_percentage int, default 0
  
  // Legacy aliases for backward compatibility
  assignee?: string; // Alias - use assignedTo
  assigneeId?: UserId; // Alias - use assignedTo
  projectId?: ProjectId; // Frontend extension
  startDate?: string; // Frontend extension
  relatedModule?: string; // Frontend extension
  relatedItemId?: string; // Frontend extension
  relatedItemTitle?: string; // Frontend extension
  actionLabel?: string; // Frontend extension
  automatedTrigger?: string; // Frontend extension
  linkedRules?: string[]; // Frontend extension
  dependencies?: TaskId[]; // Frontend extension
  dependencyType?: TaskDependencyType; // Frontend extension
  rrule?: string; // Frontend extension - recurring rule
  completion?: number; // Alias for completionPercentage
  slaId?: string; // Frontend extension
}

/**
 * Backward compatibility alias
 * @deprecated Use WorkflowTask directly
 */
export type Task = WorkflowTask;

/**
 * Workflow stage complexity classification
 */
export type WorkflowComplexity = 'Low' | 'Medium' | 'High';

/**
 * Basic SLA configuration
 * For advanced SLA features, see workflow-advanced-types.ts
 */
export type SLAConfigBasic = BaseEntity & {
  readonly name: string;
  readonly targetHours: number;
  readonly warningThresholdHours: number;
  readonly businessHoursOnly: boolean;
};

/**
 * Basic approval chain configuration  
 * For advanced approval features, see workflow-advanced-types.ts
 */
export type ApprovalChainBasic = BaseEntity & {
  readonly name: string;
  readonly steps: ReadonlyArray<{
    readonly role: UserRole;
    readonly userId?: UserId;
    readonly order: number;
  }>;
};

/**
 * Workflow stage representation
 * Contains grouped tasks with status tracking
 */
export type WorkflowStage = {
  readonly id: string;
  readonly title: string;
  readonly status: StageStatus | string;
  readonly tasks: readonly WorkflowTask[];
};

/**
 * Workflow template metadata
 * Used for template library and workflow initialization
 */
export type WorkflowTemplateData = BaseEntity & {
  readonly id: WorkflowTemplateId;
  readonly title: string;
  readonly category: string;
  readonly complexity: WorkflowComplexity;
  readonly duration: string;
  readonly tags: readonly string[];
  readonly auditReady: boolean;
  readonly stages: readonly string[];
};

/**
 * Workflow process instance
 * Represents an active workflow with execution state
 */
export type WorkflowProcess = BaseEntity & {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly status: 'Active' | 'Paused' | 'Completed' | 'Archived';
  readonly templateId?: WorkflowTemplateId;
  readonly caseId?: CaseId;
  readonly projectId?: ProjectId;
  readonly startDate?: string;
  readonly dueDate?: string;
  readonly completedDate?: string;
  readonly completionPercentage: number;
  readonly priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  readonly assignedTo?: readonly UserId[];
  readonly ownerId?: UserId;
  readonly stages?: readonly WorkflowStage[];
  readonly tasks?: readonly WorkflowTask[];
  readonly metadata?: MetadataRecord;
};

/**
 * Task statistics aggregation
 * Used for analytics and reporting dashboards
 */
export type TaskStatistics = {
  readonly total: number;
  readonly byStatus: Readonly<Record<TaskStatusBackend, number>>;
  readonly byPriority: Readonly<Record<TaskPriorityBackend, number>>;
  readonly overdue: number;
  readonly completedThisWeek: number;
  readonly completedThisMonth: number;
  readonly averageCompletionTime: number; // in hours
  readonly averageEstimateAccuracy: number; // percentage
};

/**
 * Extended task filtering options
 * Used for advanced task search and analytics queries
 */
export type TaskFiltersExtended = {
  readonly caseId?: string;
  readonly status?: TaskStatusBackend | readonly TaskStatusBackend[];
  readonly priority?: TaskPriorityBackend | readonly TaskPriorityBackend[];
  readonly assignedTo?: string | readonly string[];
  readonly createdBy?: string;
  readonly parentTaskId?: string;
  readonly tags?: readonly string[];
  readonly dueDateFrom?: string;
  readonly dueDateTo?: string;
  readonly overdue?: boolean;
  readonly hasSubtasks?: boolean;
  readonly search?: string;
  readonly sortBy?: 'dueDate' | 'priority' | 'status' | 'createdAt' | 'title';
  readonly sortOrder?: 'asc' | 'desc';
  readonly page?: number;
  readonly limit?: number;
};

export interface TaskBulkOperationResult {
  success: number;
  failed: number;
  total: number;
  errors?: Array<{ taskId: string; error: string }>;
}

export interface TaskAssignmentDto {
  taskId: string;
  assignedTo: string;
  assignedBy?: string;
  assignedAt?: string;
  reason?: string;
}

export interface TaskRelationshipDto {
  parentTaskId: string;
  childTaskId: string;
  relationshipType?: 'blocks' | 'depends_on' | 'related_to';
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  attachments?: string[];
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  userId: string;
  userName?: string;
  action: 'created' | 'updated' | 'status_changed' | 'assigned' | 'commented' | 'completed' | 'deleted';
  previousValue?: JsonValue;
  newValue?: JsonValue;
  timestamp: string;
  description?: string;
}

// Renamed to avoid conflict with workflow-advanced-types WorkflowAnalytics
export interface WorkflowProcessAnalytics {
  totalProcesses: number;
  activeProcesses: number;
  completedThisMonth: number;
  averageCompletionRate: number;
  overdueTasks: number;
  atRiskTasks: number;
  tasksByStatus: Record<string, number>;
  processByCategory: Record<string, number>;
  completionTrend?: Array<{ date: string; count: number }>;
}

// Template with full schema
export interface TemplateDocument extends BaseEntity {
  id: string;
  name: string;
  description?: string;
  category: string;
  type: 'Workflow' | 'Pleading' | 'Motion' | 'Document' | 'Email' | 'Other';
  content?: string;
  variables?: Array<{ key: string; label: string; type: string; required?: boolean }>;
  sections?: string[];
  status: 'Draft' | 'Active' | 'Archived';
  templateVersion?: string;
  tags?: string[];
  jurisdictions?: string[];
  complexity?: 'Low' | 'Medium' | 'High';
  estimatedDuration?: string;
  createdBy?: UserId;
  modifiedBy?: UserId;
  usageCount?: number;
  metadata?: MetadataRecord;
}
export interface Project extends BaseEntity { 
  id: ProjectId;
  // Core fields (aligned with backend Project entity)
  name: string; // Backend: varchar(255)
  description?: string; // Backend: text, nullable
  status: 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled'; // Backend: enum ProjectStatus
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'; // Backend: enum ProjectPriority
  
  // Relationships
  caseId?: CaseId; // Backend: uuid, nullable, with FK to cases
  projectManagerId?: string; // Backend: uuid, nullable
  assignedTeamId?: string; // Backend: uuid, nullable
  
  // Dates
  startDate?: string; // Backend: date
  dueDate?: string; // Backend: date
  completedDate?: string; // Backend: date
  
  // Progress tracking
  completionPercentage: number; // Backend: decimal(5,2), default 0
  estimatedHours?: number; // Backend: decimal(12,2)
  actualHours?: number; // Backend: decimal(12,2)
  budget?: number; // Backend: decimal(12,2)
  
  // Content
  notes?: string; // Backend: text
  tasks?: Array<{
    title: string;
    priority: string;
    assignee: string;
    relatedModule: ((module: string) => void) | undefined;
    actionLabel: string; // Backend: jsonb
    id: string;
    name: string;
    assignedTo?: string;
    status: string;
    dueDate?: string;
    completedDate?: string;
  }>;
  milestones?: Array<{ // Backend: jsonb
    name: string;
    dueDate?: string;
    completedDate?: string;
    status: string;
  }>;
  metadata?: MetadataRecord; // Backend: jsonb
  
  // Frontend-specific (legacy)
  title?: string; // Alias for name
  lead?: string; // Alias for projectManagerId
}

