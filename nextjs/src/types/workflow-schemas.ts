/**
 * Workflow Schemas and Types
 *
 * Comprehensive type definitions for workflow automation system.
 * Supports templates, instances, steps, variables, and execution control.
 *
 * Next.js 16 Compliance:
 * - Strict type safety with discriminated unions
 * - Zod-compatible validation schemas
 * - Server Action compatible types
 *
 * @module types/workflow-schemas
 */

import { BaseEntity, CaseId, UserId, MetadataRecord } from './primitives';

// =============================================================================
// Workflow Status Enums
// =============================================================================

/**
 * Workflow template status lifecycle
 */
export type WorkflowTemplateStatus = 'draft' | 'active' | 'inactive' | 'archived';

/**
 * Workflow instance execution status
 */
export type WorkflowInstanceStatus =
  | 'pending'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Workflow step execution status
 */
export type WorkflowStepStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'skipped'
  | 'failed'
  | 'blocked';

/**
 * Step type discriminators for workflow builder
 */
export type WorkflowStepType =
  | 'task'
  | 'approval'
  | 'notification'
  | 'condition'
  | 'delay'
  | 'parallel'
  | 'loop'
  | 'webhook'
  | 'document_generation'
  | 'email'
  | 'automation';

/**
 * Workflow category for organization and filtering
 */
export type WorkflowCategory =
  | 'case-management'
  | 'client-intake'
  | 'document-review'
  | 'billing'
  | 'compliance'
  | 'hr'
  | 'litigation'
  | 'discovery'
  | 'custom';

/**
 * Workflow trigger types for automation
 */
export type WorkflowTriggerType =
  | 'manual'
  | 'event'
  | 'scheduled'
  | 'webhook'
  | 'case_status_change'
  | 'document_upload'
  | 'deadline_approaching';

// =============================================================================
// Variable Types
// =============================================================================

/**
 * Variable data types supported in workflow
 */
export type VariableType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'array'
  | 'object'
  | 'user'
  | 'case'
  | 'document';

/**
 * Workflow variable definition
 */
export interface WorkflowVariable {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly type: VariableType;
  readonly description?: string;
  readonly required: boolean;
  readonly defaultValue?: unknown;
  readonly validation?: {
    readonly min?: number;
    readonly max?: number;
    readonly pattern?: string;
    readonly options?: readonly string[];
  };
}

/**
 * Runtime variable value
 */
export interface WorkflowVariableValue {
  readonly variableId: string;
  readonly key: string;
  readonly value: unknown;
  readonly setAt: string;
  readonly setBy?: UserId;
}

// =============================================================================
// Step Configuration Types
// =============================================================================

/**
 * Base step configuration shared by all step types
 */
interface BaseStepConfig {
  readonly description?: string;
  readonly timeout?: number; // in minutes
  readonly retryOnFailure?: boolean;
  readonly maxRetries?: number;
  readonly onError?: 'stop' | 'continue' | 'skip';
}

/**
 * Task step configuration
 */
export interface TaskStepConfig extends BaseStepConfig {
  readonly type: 'task';
  readonly assigneeType: 'user' | 'role' | 'variable' | 'case_team_member';
  readonly assigneeValue?: string;
  readonly dueInDays?: number;
  readonly priority?: 'low' | 'medium' | 'high' | 'critical';
  readonly instructions?: string;
  readonly requiredFields?: string[];
  readonly allowDelegation?: boolean;
}

/**
 * Approval step configuration
 */
export interface ApprovalStepConfig extends BaseStepConfig {
  readonly type: 'approval';
  readonly approverType: 'user' | 'role' | 'hierarchy';
  readonly approverValue?: string;
  readonly requireComment?: boolean;
  readonly approvalType: 'single' | 'all' | 'majority';
  readonly escalationRules?: {
    readonly afterHours: number;
    readonly escalateTo: string;
  };
}

/**
 * Notification step configuration
 */
export interface NotificationStepConfig extends BaseStepConfig {
  readonly type: 'notification';
  readonly channel: 'email' | 'sms' | 'in_app' | 'all';
  readonly recipientType: 'user' | 'role' | 'variable' | 'case_team';
  readonly recipientValue?: string;
  readonly template?: string;
  readonly subject?: string;
  readonly body?: string;
}

/**
 * Condition step configuration
 */
export interface ConditionStepConfig extends BaseStepConfig {
  readonly type: 'condition';
  readonly conditions: readonly {
    readonly field: string;
    readonly operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'not_contains' | 'in' | 'not_in';
    readonly value: unknown;
    readonly nextStepId: string;
  }[];
  readonly defaultNextStepId?: string;
}

/**
 * Delay step configuration
 */
export interface DelayStepConfig extends BaseStepConfig {
  readonly type: 'delay';
  readonly delayType: 'fixed' | 'until_date' | 'until_event';
  readonly duration?: number;
  readonly durationUnit?: 'minutes' | 'hours' | 'days' | 'weeks';
  readonly untilDate?: string;
  readonly untilEvent?: string;
  readonly businessDaysOnly?: boolean;
}

/**
 * Parallel step configuration
 */
export interface ParallelStepConfig extends BaseStepConfig {
  readonly type: 'parallel';
  readonly branches: readonly string[]; // Step IDs to execute in parallel
  readonly joinCondition: 'all' | 'any' | 'custom';
  readonly customJoinExpression?: string;
}

/**
 * Document generation step configuration
 */
export interface DocumentGenerationStepConfig extends BaseStepConfig {
  readonly type: 'document_generation';
  readonly templateId: string;
  readonly outputFormat: 'pdf' | 'docx' | 'html';
  readonly variableMapping: Record<string, string>;
  readonly attachToCaseId?: string;
  readonly sendForApproval?: boolean;
}

/**
 * Email step configuration
 */
export interface EmailStepConfig extends BaseStepConfig {
  readonly type: 'email';
  readonly to: string[];
  readonly cc?: string[];
  readonly bcc?: string[];
  readonly subject: string;
  readonly body: string;
  readonly attachments?: string[];
  readonly useTemplate?: string;
}

/**
 * Webhook step configuration
 */
export interface WebhookStepConfig extends BaseStepConfig {
  readonly type: 'webhook';
  readonly url: string;
  readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  readonly headers?: Record<string, string>;
  readonly payload?: Record<string, unknown>;
  readonly responseMapping?: Record<string, string>;
}

/**
 * Automation step configuration
 */
export interface AutomationStepConfig extends BaseStepConfig {
  readonly type: 'automation';
  readonly action: string;
  readonly parameters: Record<string, unknown>;
}

/**
 * Loop step configuration
 */
export interface LoopStepConfig extends BaseStepConfig {
  readonly type: 'loop';
  readonly iterateOver: string; // Variable key containing array
  readonly loopVariable: string; // Variable to hold current item
  readonly stepsToExecute: string[]; // Step IDs in loop body
  readonly maxIterations?: number;
}

/**
 * Discriminated union of all step configurations
 */
export type WorkflowStepConfig =
  | TaskStepConfig
  | ApprovalStepConfig
  | NotificationStepConfig
  | ConditionStepConfig
  | DelayStepConfig
  | ParallelStepConfig
  | DocumentGenerationStepConfig
  | EmailStepConfig
  | WebhookStepConfig
  | AutomationStepConfig
  | LoopStepConfig;

// =============================================================================
// Workflow Step Definition
// =============================================================================

/**
 * Workflow step definition
 */
export interface WorkflowStep {
  readonly id: string;
  readonly name: string;
  readonly type: WorkflowStepType;
  readonly config: WorkflowStepConfig;
  readonly position: {
    readonly x: number;
    readonly y: number;
  };
  readonly nextStepIds?: readonly string[];
  readonly previousStepIds?: readonly string[];
  readonly metadata?: MetadataRecord;
}

// =============================================================================
// Workflow Template
// =============================================================================

/**
 * Workflow template trigger configuration
 */
export interface WorkflowTrigger {
  readonly type: WorkflowTriggerType;
  readonly config: {
    readonly event?: string;
    readonly schedule?: string; // Cron expression
    readonly conditions?: Record<string, unknown>;
  };
}

/**
 * Workflow template entity
 */
export interface WorkflowTemplate extends BaseEntity {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly category: WorkflowCategory;
  readonly status: WorkflowTemplateStatus;
  readonly version: number;
  readonly steps: readonly WorkflowStep[];
  readonly variables: readonly WorkflowVariable[];
  readonly triggers: readonly WorkflowTrigger[];
  readonly estimatedDuration?: number; // in minutes
  readonly tags?: readonly string[];
  readonly createdBy?: UserId;
  readonly lastModifiedBy?: UserId;
  readonly publishedAt?: string;
  readonly metadata?: MetadataRecord;
}

/**
 * Workflow template summary for list views
 */
export interface WorkflowTemplateSummary {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly category: WorkflowCategory;
  readonly status: WorkflowTemplateStatus;
  readonly version: number;
  readonly stepCount: number;
  readonly instanceCount: number;
  readonly estimatedDuration?: number;
  readonly tags?: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

// =============================================================================
// Workflow Instance
// =============================================================================

/**
 * Step execution record
 */
export interface WorkflowStepExecution {
  readonly stepId: string;
  readonly stepName: string;
  readonly status: WorkflowStepStatus;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly assignedTo?: UserId;
  readonly completedBy?: UserId;
  readonly result?: unknown;
  readonly error?: string;
  readonly attempts: number;
  readonly notes?: string;
}

/**
 * Workflow instance entity
 */
export interface WorkflowInstance extends BaseEntity {
  readonly id: string;
  readonly templateId: string;
  readonly templateName: string;
  readonly templateVersion: number;
  readonly status: WorkflowInstanceStatus;
  readonly caseId?: CaseId;
  readonly caseName?: string;
  readonly currentStepId?: string;
  readonly currentStepName?: string;
  readonly progress: number; // 0-100
  readonly startedAt: string;
  readonly startedBy?: UserId;
  readonly completedAt?: string;
  readonly pausedAt?: string;
  readonly failedAt?: string;
  readonly cancelledAt?: string;
  readonly cancelledBy?: UserId;
  readonly stepExecutions: readonly WorkflowStepExecution[];
  readonly variables: readonly WorkflowVariableValue[];
  readonly metadata?: MetadataRecord;
}

/**
 * Workflow instance summary for list views
 */
export interface WorkflowInstanceSummary {
  readonly id: string;
  readonly templateName: string;
  readonly status: WorkflowInstanceStatus;
  readonly progress: number;
  readonly currentStepName?: string;
  readonly caseId?: CaseId;
  readonly caseName?: string;
  readonly startedAt: string;
  readonly startedBy?: UserId;
  readonly completedAt?: string;
}

// =============================================================================
// Workflow Analytics
// =============================================================================

/**
 * Workflow execution metrics
 */
export interface WorkflowMetrics {
  readonly activeInstances: number;
  readonly completedThisWeek: number;
  readonly completedThisMonth: number;
  readonly averageCompletionTime: number; // in hours
  readonly successRate: number; // percentage
  readonly failureRate: number; // percentage
  readonly tasksDueToday: number;
  readonly overdueTasks: number;
  readonly bottleneckSteps: readonly {
    readonly stepName: string;
    readonly averageTime: number;
    readonly count: number;
  }[];
}

/**
 * Workflow dashboard statistics
 */
export interface WorkflowDashboardStats {
  readonly totalTemplates: number;
  readonly activeTemplates: number;
  readonly totalInstances: number;
  readonly runningInstances: number;
  readonly completedInstances: number;
  readonly failedInstances: number;
  readonly metrics: WorkflowMetrics;
  readonly recentActivity: readonly {
    readonly instanceId: string;
    readonly templateName: string;
    readonly action: string;
    readonly timestamp: string;
    readonly user?: string;
  }[];
}

// =============================================================================
// Server Action Request/Response Types
// =============================================================================

/**
 * Create workflow template request
 */
export interface CreateWorkflowTemplateRequest {
  readonly name: string;
  readonly description?: string;
  readonly category: WorkflowCategory;
  readonly steps?: readonly Omit<WorkflowStep, 'id'>[];
  readonly variables?: readonly Omit<WorkflowVariable, 'id'>[];
  readonly triggers?: readonly WorkflowTrigger[];
  readonly tags?: readonly string[];
}

/**
 * Update workflow template request
 */
export interface UpdateWorkflowTemplateRequest {
  readonly name?: string;
  readonly description?: string;
  readonly category?: WorkflowCategory;
  readonly status?: WorkflowTemplateStatus;
  readonly steps?: readonly WorkflowStep[];
  readonly variables?: readonly WorkflowVariable[];
  readonly triggers?: readonly WorkflowTrigger[];
  readonly tags?: readonly string[];
}

/**
 * Start workflow instance request
 */
export interface StartWorkflowInstanceRequest {
  readonly templateId: string;
  readonly caseId?: CaseId;
  readonly variables?: Record<string, unknown>;
}

/**
 * Complete step request
 */
export interface CompleteStepRequest {
  readonly instanceId: string;
  readonly stepId: string;
  readonly result?: unknown;
  readonly notes?: string;
  readonly nextStepId?: string;
}

/**
 * Server action result type
 */
export interface WorkflowActionResult<T = void> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly message?: string;
}

// =============================================================================
// Filter Types
// =============================================================================

/**
 * Workflow template filters
 */
export interface WorkflowTemplateFilters {
  readonly status?: WorkflowTemplateStatus | readonly WorkflowTemplateStatus[];
  readonly category?: WorkflowCategory | readonly WorkflowCategory[];
  readonly search?: string;
  readonly tags?: readonly string[];
  readonly sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'instanceCount';
  readonly sortOrder?: 'asc' | 'desc';
  readonly page?: number;
  readonly limit?: number;
}

/**
 * Workflow instance filters
 */
export interface WorkflowInstanceFilters {
  readonly templateId?: string;
  readonly status?: WorkflowInstanceStatus | readonly WorkflowInstanceStatus[];
  readonly caseId?: CaseId;
  readonly startedBy?: UserId;
  readonly startedAfter?: string;
  readonly startedBefore?: string;
  readonly search?: string;
  readonly sortBy?: 'startedAt' | 'progress' | 'status';
  readonly sortOrder?: 'asc' | 'desc';
  readonly page?: number;
  readonly limit?: number;
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Check if step config is a task step
 */
export function isTaskStep(config: WorkflowStepConfig): config is TaskStepConfig {
  return config.type === 'task';
}

/**
 * Check if step config is an approval step
 */
export function isApprovalStep(config: WorkflowStepConfig): config is ApprovalStepConfig {
  return config.type === 'approval';
}

/**
 * Check if step config is a condition step
 */
export function isConditionStep(config: WorkflowStepConfig): config is ConditionStepConfig {
  return config.type === 'condition';
}

/**
 * Check if step config is a parallel step
 */
export function isParallelStep(config: WorkflowStepConfig): config is ParallelStepConfig {
  return config.type === 'parallel';
}

// =============================================================================
// Default Values
// =============================================================================

/**
 * Default workflow template values
 */
export const DEFAULT_TEMPLATE: Partial<WorkflowTemplate> = {
  status: 'draft',
  version: 1,
  steps: [],
  variables: [],
  triggers: [{ type: 'manual', config: {} }],
  tags: [],
};

/**
 * Default step position
 */
export const DEFAULT_STEP_POSITION = { x: 0, y: 0 };

/**
 * Workflow categories with labels
 */
export const WORKFLOW_CATEGORIES: readonly { value: WorkflowCategory; label: string }[] = [
  { value: 'case-management', label: 'Case Management' },
  { value: 'client-intake', label: 'Client Intake' },
  { value: 'document-review', label: 'Document Review' },
  { value: 'billing', label: 'Billing & Invoicing' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'hr', label: 'HR & Admin' },
  { value: 'litigation', label: 'Litigation' },
  { value: 'discovery', label: 'Discovery' },
  { value: 'custom', label: 'Custom' },
] as const;

/**
 * Workflow status labels
 */
export const TEMPLATE_STATUS_LABELS: Record<WorkflowTemplateStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  inactive: 'Inactive',
  archived: 'Archived',
};

/**
 * Instance status labels
 */
export const INSTANCE_STATUS_LABELS: Record<WorkflowInstanceStatus, string> = {
  pending: 'Pending',
  running: 'Running',
  paused: 'Paused',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

/**
 * Step type labels
 */
export const STEP_TYPE_LABELS: Record<WorkflowStepType, string> = {
  task: 'Task',
  approval: 'Approval',
  notification: 'Notification',
  condition: 'Condition',
  delay: 'Delay',
  parallel: 'Parallel',
  loop: 'Loop',
  webhook: 'Webhook',
  document_generation: 'Document Generation',
  email: 'Email',
  automation: 'Automation',
};
