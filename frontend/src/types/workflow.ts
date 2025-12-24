// types/workflow.ts
// Auto-generated from models.ts split

import {
  BaseEntity, UserId, TaskId, ProjectId,
  WorkflowTemplateId, CaseId, MetadataRecord, JsonValue
} from './primitives';
import { TaskDependencyType, UserRole, StageStatus } from './enums';


// --- CLUSTER 6: WORKFLOW & AUTOMATION ---
// Backend Task entity enums (from tasks/dto/create-task.dto.ts)
export enum TaskStatusBackend {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  BLOCKED = 'Blocked',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export enum TaskPriorityBackend {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical' // Backend uses CRITICAL not URGENT
}

export interface WorkflowTask extends Omit<BaseEntity, 'createdBy'> { 
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

// Backward compatibility alias
export type Task = WorkflowTask;

// Basic/Legacy SLA and Approval types (renamed to avoid conflict with advanced types)
export interface SLAConfigBasic extends BaseEntity { name: string; targetHours: number; warningThresholdHours: number; businessHoursOnly: boolean; }
export interface ApprovalChainBasic extends BaseEntity { name: string; steps: { role: UserRole; userId?: UserId; order: number }[]; }
export interface WorkflowStage { id: string; title: string; status: StageStatus | string; tasks: WorkflowTask[]; }
export interface WorkflowTemplateData extends BaseEntity { id: WorkflowTemplateId; title: string; category: string; complexity: 'Low' | 'Medium' | 'High'; duration: string; tags: string[]; auditReady: boolean; stages: string[]; }

// Workflow Process Types
export interface WorkflowProcess extends BaseEntity {
  id: string;
  name: string;
  description?: string;
  status: 'Active' | 'Paused' | 'Completed' | 'Archived';
  templateId?: WorkflowTemplateId;
  caseId?: CaseId;
  projectId?: ProjectId;
  startDate?: string;
  dueDate?: string;
  completedDate?: string;
  completionPercentage: number;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignedTo?: UserId[];
  ownerId?: UserId;
  stages?: WorkflowStage[];
  tasks?: WorkflowTask[];
  metadata?: MetadataRecord;
}

// Workflow Analytics Types
// Task API Response Types
export interface TaskStatistics {
  total: number;
  byStatus: Record<TaskStatusBackend, number>;
  byPriority: Record<TaskPriorityBackend, number>;
  overdue: number;
  completedThisWeek: number;
  completedThisMonth: number;
  averageCompletionTime: number; // in hours
  averageEstimateAccuracy: number; // percentage
}

export interface TaskFiltersExtended {
  caseId?: string;
  status?: TaskStatusBackend | TaskStatusBackend[];
  priority?: TaskPriorityBackend | TaskPriorityBackend[];
  assignedTo?: string | string[];
  createdBy?: string;
  parentTaskId?: string;
  tags?: string[];
  dueDateFrom?: string;
  dueDateTo?: string;
  overdue?: boolean;
  hasSubtasks?: boolean;
  search?: string;
  sortBy?: 'dueDate' | 'priority' | 'status' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

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

