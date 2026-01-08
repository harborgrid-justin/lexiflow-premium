/**
 * Workflow Automation Type Definitions
 */

export enum WorkflowTriggerType {
  MANUAL = 'manual',
  DOCUMENT_UPLOAD = 'document_upload',
  MATTER_CREATED = 'matter_created',
  INVOICE_GENERATED = 'invoice_generated',
  DEADLINE_APPROACHING = 'deadline_approaching',
  APPROVAL_REQUESTED = 'approval_requested',
  TASK_COMPLETED = 'task_completed',
  CLIENT_INTAKE = 'client_intake',
  SCHEDULE = 'schedule',
  WEBHOOK = 'webhook',
}

export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum StepType {
  TASK = 'task',
  APPROVAL = 'approval',
  NOTIFICATION = 'notification',
  WEBHOOK = 'webhook',
  CONDITION = 'condition',
  DELAY = 'delay',
  DOCUMENT_GENERATION = 'document_generation',
  EMAIL = 'email',
  ASSIGNMENT = 'assignment',
  CONFLICT_CHECK = 'conflict_check',
  DATA_VALIDATION = 'data_validation',
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum ApprovalType {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  UNANIMOUS = 'unanimous',
  MAJORITY = 'majority',
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  trigger: WorkflowTriggerType;
  triggerConfig?: Record<string, any>;
  category?: string;
  status: WorkflowStatus;
  active: boolean;
  tags?: string[];
  executionCount: number;
  avgExecutionTime?: number;
  successRate?: number;
  steps?: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  workflowId: string;
  name: string;
  description?: string;
  type: StepType;
  order: number;
  config: Record<string, any>;
  conditions?: any[];
  required: boolean;
  allowSkip: boolean;
  timeoutSeconds?: number;
  retryCount: number;
  assignedTo?: string;
  assignedRole?: string;
  estimatedDurationHours?: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  tenantId: string;
  entityType?: string;
  entityId?: string;
  status: ExecutionStatus;
  currentStepId?: string;
  currentStepNumber: number;
  totalSteps: number;
  stepHistory?: StepHistory[];
  startedAt?: string;
  completedAt?: string;
  durationSeconds?: number;
  errorMessage?: string;
  initiatedBy?: string;
}

export interface StepHistory {
  stepId: string;
  stepName: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  output?: any;
  error?: string;
}

export interface ApprovalChain {
  id: string;
  entityType: string;
  entityId: string;
  tenantId: string;
  name: string;
  description?: string;
  approvalType: ApprovalType;
  approvers: Approver[];
  currentStep: number;
  status: ApprovalStatus;
  requiredApprovals: number;
  receivedApprovals: number;
  deadline?: string;
  startedAt?: string;
  completedAt?: string;
  requestedBy: string;
}

export interface Approver {
  userId: string;
  userName: string;
  role?: string;
  order: number;
  required: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approvedAt?: string;
  rejectedAt?: string;
  comments?: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  trigger: string;
  conditions?: any[];
  actions: AutomationAction[];
  active: boolean;
  priority: number;
  executionCount: number;
  successCount: number;
  failureCount: number;
  lastExecutedAt?: string;
}

export interface AutomationAction {
  type: string;
  config: Record<string, any>;
  order: number;
  continueOnError?: boolean;
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  events: string[];
  active: boolean;
  status: string;
  successCount: number;
  failureCount: number;
  lastDeliveredAt?: string;
  lastStatusCode?: number;
  lastError?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
}
