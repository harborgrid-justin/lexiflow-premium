/**
 * @file workflow-advanced.dto.ts
 * @description Enterprise-grade DTOs for advanced workflow features
 * @architecture NestJS + PostgreSQL + TypeORM
 * @validation class-validator decorators for input sanitization
 */

import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsNumber, 
  IsBoolean, 
  IsArray, 
  IsObject, 
  ValidateNested, 
  Min, 
  Max, 
  IsUUID,
  IsDateString,
  Matches,
  IsUrl,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================================================
// FEATURE 1: CONDITIONAL BRANCHING DTOs
// ============================================================================

export class ConditionalRuleDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  field!: string;

  @ApiProperty({ enum: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'in', 'not_in', 'regex', 'custom'] })
  @IsEnum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'in', 'not_in', 'regex', 'custom'])
  operator!: string;

  @ApiProperty()
  value!: any;

  @ApiProperty({ enum: ['string', 'number', 'boolean', 'date', 'array', 'object'] })
  @IsEnum(['string', 'number', 'boolean', 'date', 'array', 'object'])
  valueType!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  caseSensitive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customExpression?: string;
}

export class ConditionalBranchDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [ConditionalRuleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionalRuleDto)
  rules!: ConditionalRuleDto[];

  @ApiProperty({ enum: ['AND', 'OR', 'XOR', 'NAND', 'NOR'] })
  @IsEnum(['AND', 'OR', 'XOR', 'NAND', 'NOR'])
  logic!: string;

  @ApiProperty()
  @IsNumber()
  priority!: number;

  @ApiProperty()
  @IsString()
  targetNodeId!: string;

  @ApiProperty()
  @IsBoolean()
  fallthrough!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;
}

export class CreateConditionalBranchingDto {
  @ApiProperty()
  @IsString()
  nodeId!: string;

  @ApiProperty({ type: [ConditionalBranchDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionalBranchDto)
  branches!: ConditionalBranchDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultBranchId?: string;

  @ApiProperty({ enum: ['first_match', 'best_match', 'all_match'] })
  @IsEnum(['first_match', 'best_match', 'all_match'])
  evaluationStrategy!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  timeout?: number;
}

// ============================================================================
// FEATURE 2: PARALLEL EXECUTION DTOs
// ============================================================================

export class ParallelBranchDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  nodeIds!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  estimatedDuration?: number;

  @ApiProperty({ enum: ['high', 'medium', 'low'] })
  @IsEnum(['high', 'medium', 'low'])
  priority!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dependencies?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxRetries?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  retryDelay?: number;

  @ApiProperty({ enum: ['fail_all', 'continue', 'retry', 'fallback'] })
  @IsEnum(['fail_all', 'continue', 'retry', 'fallback'])
  onError!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fallbackBranchId?: string;
}

export class CreateParallelExecutionDto {
  @ApiProperty()
  @IsString()
  nodeId!: string;

  @ApiProperty({ type: [ParallelBranchDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParallelBranchDto)
  branches!: ParallelBranchDto[];

  @ApiProperty({ enum: ['wait_all', 'wait_any', 'wait_majority', 'wait_custom', 'timed_join'] })
  @IsEnum(['wait_all', 'wait_any', 'wait_majority', 'wait_custom', 'timed_join'])
  joinStrategy!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  customThreshold?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  timeout?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  resourcePoolSize?: number;

  @ApiProperty({ enum: ['round_robin', 'least_loaded', 'random', 'priority'] })
  @IsEnum(['round_robin', 'least_loaded', 'random', 'priority'])
  loadBalancing!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  errorHandling?: {
    strategy: 'fail_all' | 'continue' | 'compensating_transaction';
    compensationWorkflow?: string;
  };
}

// ============================================================================
// FEATURE 3: WORKFLOW VERSIONING DTOs
// ============================================================================

export class CreateWorkflowVersionDto {
  @ApiProperty()
  @IsUUID()
  workflowId!: string;

  @ApiProperty()
  @IsString()
  @Matches(/^\d+\.\d+\.\d+$/, { message: 'Version must follow semantic versioning (e.g., 1.0.0)' })
  version!: string;

  @ApiProperty()
  @IsString()
  commitMessage!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branchName?: string;

  @ApiProperty()
  @IsObject()
  config!: Record<string, any>;
}

export class CompareVersionsDto {
  @ApiProperty()
  @IsString()
  versionA!: string;

  @ApiProperty()
  @IsString()
  versionB!: string;
}

// ============================================================================
// FEATURE 4: TEMPLATE LIBRARY DTOs
// ============================================================================

export class WorkflowTemplateMetadataDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  categories!: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jurisdiction?: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  practiceAreas!: string[];

  @ApiProperty({ enum: ['beginner', 'intermediate', 'advanced', 'expert'] })
  @IsEnum(['beginner', 'intermediate', 'advanced', 'expert'])
  complexity!: string;

  @ApiProperty()
  @IsObject()
  estimatedDuration!: {
    min: number;
    max: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
  };

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  requiredRoles!: string[];
}

export class CreateWorkflowTemplateDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => WorkflowTemplateMetadataDto)
  metadata!: WorkflowTemplateMetadataDto;

  @ApiProperty()
  @IsArray()
  nodes!: any[];

  @ApiProperty()
  @IsArray()
  connections!: any[];

  @ApiProperty()
  @IsArray()
  variables!: any[];

  @ApiProperty()
  @IsObject()
  config!: Record<string, any>;

  @ApiProperty()
  @IsString()
  version!: string;

  @ApiProperty()
  @IsBoolean()
  isPublic!: boolean;

  @ApiProperty({ enum: ['proprietary', 'mit', 'apache', 'cc-by', 'cc-by-sa'] })
  @IsEnum(['proprietary', 'mit', 'apache', 'cc-by', 'cc-by-sa'])
  license!: string;
}

export class RateWorkflowTemplateDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}

// ============================================================================
// FEATURE 5: SLA MONITORING DTOs
// ============================================================================

export class BusinessHoursDto {
  @ApiProperty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  start!: string;

  @ApiProperty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  end!: string;

  @ApiProperty()
  @IsString()
  timezone!: string;

  @ApiProperty()
  @IsBoolean()
  excludeWeekends!: boolean;

  @ApiProperty()
  @IsBoolean()
  excludeHolidays!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  holidayCalendar?: string;
}

export class EscalationLevelDto {
  @ApiProperty()
  @IsNumber()
  level!: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  triggerAt!: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  escalateTo!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  escalateToRole?: string;

  @ApiProperty()
  @IsArray()
  actions!: any[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  repeatInterval?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxRepeats?: number;
}

export class CreateSLAConfigDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  targetDuration!: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  warningThreshold!: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(200)
  criticalThreshold!: number;

  @ApiProperty()
  @IsBoolean()
  businessHoursOnly!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessHoursDto)
  businessHours?: BusinessHoursDto;

  @ApiProperty({ type: [EscalationLevelDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EscalationLevelDto)
  escalationLevels!: EscalationLevelDto[];
}

// ============================================================================
// FEATURE 6: APPROVAL CHAINS DTOs
// ============================================================================

export class ApprovalApproverDto {
  @ApiProperty({ enum: ['user', 'role', 'group', 'dynamic'] })
  @IsEnum(['user', 'role', 'group', 'dynamic'])
  type!: string;

  @ApiProperty()
  @IsString()
  id!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dynamicResolver?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  notifyBefore?: number;
}

export class ApprovalLevelDto {
  @ApiProperty()
  @IsNumber()
  level!: number;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ type: [ApprovalApproverDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalApproverDto)
  approvers!: ApprovalApproverDto[];

  @ApiProperty()
  @IsNumber()
  @Min(1)
  requiredApprovals!: number;

  @ApiProperty()
  @IsBoolean()
  allowDelegation!: boolean;

  @ApiProperty()
  @IsBoolean()
  requireComments!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  timeout?: number;
}

export class CreateApprovalChainDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [ApprovalLevelDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalLevelDto)
  levels!: ApprovalLevelDto[];

  @ApiProperty()
  @IsBoolean()
  requireSequential!: boolean;

  @ApiProperty()
  @IsBoolean()
  allowParallel!: boolean;

  @ApiProperty({ enum: ['auto_approve', 'auto_reject', 'escalate', 'extend'] })
  @IsEnum(['auto_approve', 'auto_reject', 'escalate', 'extend'])
  timeoutAction!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  timeoutDuration?: number;
}

export class ApprovalDecisionDto {
  @ApiProperty({ enum: ['approve', 'reject', 'abstain'] })
  @IsEnum(['approve', 'reject', 'abstain'])
  decision!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}

// ============================================================================
// FEATURE 7: ROLLBACK MECHANISM DTOs
// ============================================================================

export class CreateSnapshotDto {
  @ApiProperty()
  @IsUUID()
  workflowInstanceId!: string;

  @ApiProperty({ enum: ['manual', 'milestone', 'scheduled'] })
  @IsEnum(['manual', 'milestone', 'scheduled'])
  type!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['permanent', 'temporary', 'time_based'] })
  @IsEnum(['permanent', 'temporary', 'time_based'])
  retentionPolicy!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class RollbackDto {
  @ApiProperty()
  @IsUUID()
  snapshotId!: string;

  @ApiProperty({ enum: ['full', 'partial', 'compensating'] })
  @IsEnum(['full', 'partial', 'compensating'])
  strategy!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  affectedNodes?: string[];

  @ApiProperty()
  @IsBoolean()
  dryRun!: boolean;
}

// ============================================================================
// FEATURE 8: WORKFLOW ANALYTICS DTOs
// ============================================================================

export class AnalyticsPeriodDto {
  @ApiProperty()
  @IsDateString()
  start!: string;

  @ApiProperty()
  @IsDateString()
  end!: string;
}

export class GetWorkflowAnalyticsDto {
  @ApiProperty()
  @IsUUID()
  workflowId!: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => AnalyticsPeriodDto)
  period!: AnalyticsPeriodDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includeBottlenecks?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includeSuggestions?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includeTrends?: boolean;
}

// ============================================================================
// FEATURE 9: AI-POWERED SUGGESTIONS DTOs
// ============================================================================

export class GetAISuggestionsDto {
  @ApiProperty()
  @IsUUID()
  workflowId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  minConfidence?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  types?: string[];
}

export class ApplyAISuggestionDto {
  @ApiProperty()
  @IsUUID()
  suggestionId!: string;

  @ApiProperty()
  @IsBoolean()
  autoApply!: boolean;
}

export class AIFeedbackDto {
  @ApiProperty()
  @IsUUID()
  suggestionId!: string;

  @ApiProperty()
  @IsBoolean()
  accepted!: boolean;

  @ApiProperty()
  @IsBoolean()
  implemented!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comments?: string;
}

// ============================================================================
// FEATURE 10: EXTERNAL TRIGGERS DTOs
// ============================================================================

export class WebhookConfigDto {
  @ApiProperty()
  @IsString()
  type!: 'webhook';

  @ApiProperty()
  @IsUrl()
  url!: string;

  @ApiProperty({ enum: ['POST', 'PUT', 'PATCH'] })
  @IsEnum(['POST', 'PUT', 'PATCH'])
  method!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  expectedHeaders?: Record<string, string>;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ipWhitelist?: string[];
}

export class ApiPollConfigDto {
  @ApiProperty()
  @IsString()
  type!: 'api_poll';

  @ApiProperty()
  @IsUrl()
  endpoint!: string;

  @ApiProperty({ enum: ['GET', 'POST'] })
  @IsEnum(['GET', 'POST'])
  method!: string;

  @ApiProperty()
  @IsNumber()
  pollInterval!: number;

  @ApiProperty()
  @IsBoolean()
  deduplicate!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deduplicateField?: string;
}

export class EmailConfigDto {
  @ApiProperty()
  @IsString()
  type!: 'email';

  @ApiProperty()
  @IsEmail()
  emailAddress!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subjectFilter?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  senderFilter?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  attachmentRequired?: boolean;
}

export class CreateExternalTriggerDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['webhook', 'api_poll', 'email', 'file_watch', 'database', 'queue', 'custom'] })
  @IsEnum(['webhook', 'api_poll', 'email', 'file_watch', 'database', 'queue', 'custom'])
  type!: string;

  @ApiProperty()
  @IsBoolean()
  enabled!: boolean;

  @ApiProperty()
  @IsObject()
  config!: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  filters?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  transformation?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  authentication?: any;
}

export class TestExternalTriggerDto {
  @ApiProperty()
  @IsUUID()
  triggerId!: string;

  @ApiProperty()
  @IsObject()
  payload!: Record<string, any>;
}

// ============================================================================
// WORKFLOW INSTANCE DTOs
// ============================================================================

export class CreateWorkflowInstanceDto {
  @ApiProperty()
  @IsUUID()
  templateId!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  matterId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}

export class UpdateWorkflowInstanceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}

export class WorkflowExecutionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  input?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;
}

export class WorkflowQueryDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  status?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  createdBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string;
}

// ============================================================================
// TYPE ALIASES FOR SERVICE LAYER
// ============================================================================

// Conditional Branching Types
export type ConditionalBranchingConfig = CreateConditionalBranchingDto;

// Parallel Execution Types
export type ParallelExecutionConfig = CreateParallelExecutionDto;

// Versioning Types
export interface WorkflowVersion {
  id: string;
  workflowId: string;
  version: string;
  major: number;
  minor: number;
  patch: number;
  commitMessage: string;
  author: string;
  tag?: string;
  branchName?: string;
  nodes: any[];
  connections: any[];
  config: Record<string, any>;
  checksum: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface WorkflowDiff {
  versionA: string;
  versionB: string;
  addedNodes: any[];
  removedNodes: any[];
  modifiedNodes: any[];
  addedConnections: any[];
  removedConnections: any[];
  nodesAdded: any[];
  nodesRemoved: any[];
  nodesModified: any[];
  connectionsAdded: any[];
  connectionsRemoved: any[];
  configChanges: any[];
  breakingChanges: boolean;
  migrationRequired: boolean;
}

// Template Types (using Create DTO as base)
export type WorkflowTemplate = CreateWorkflowTemplateDto;

// SLA Types
export interface SLAConfig {
  id: string;
  name: string;
  description?: string;
  targetDuration: number;
  warningThreshold: number;
  criticalThreshold: number;
  businessHoursOnly: boolean;
  businessHours?: BusinessHoursDto;
  escalationLevels: EscalationLevelDto[];
  escalationPolicy: {
    levels: EscalationLevelDto[];
  };
}

export interface SLAStatus {
  nodeId: string;
  slaConfigId: string;
  status: 'on_track' | 'at_risk' | 'breached';
  startTime: string;
  targetTime: string;
  currentTime: string;
  elapsedTime: number;
  remainingTime: number;
  percentageUsed: number;
  pauseDuration: number;
  escalations: Array<{
    level: number;
    triggeredAt: string;
    resolved: boolean;
  }>;
}

// Approval Chain Types
export interface ApprovalChain {
  id: string;
  name: string;
  description?: string;
  levels: Array<ApprovalLevelDto & {
    onApprove?: any[];
    onReject?: any[];
  }>;
  requireSequential: boolean;
  allowParallel: boolean;
  timeoutAction: 'auto_approve' | 'auto_reject' | 'escalate' | 'extend';
  timeoutDuration?: number;
}

export interface ApprovalInstance {
  id: string;
  chainId: string;
  workflowInstanceId: string;
  currentLevel: number;
  status: 'pending' | 'approved' | 'rejected' | 'timeout';
  decisions: Array<{
    level: number;
    approverId: string;
    decision: 'approve' | 'reject' | 'abstain';
    comments?: string;
    timestamp: Date | string;
    weight?: number;
  }>;
  startedAt: Date;
  completedAt?: Date | string;
}

export type ApprovalDecision = ApprovalDecisionDto;

// Rollback Types
export interface WorkflowSnapshot {
  id: string;
  workflowInstanceId: string;
  version: number;
  type: 'manual' | 'milestone' | 'scheduled' | 'auto';
  label?: string;
  description?: string;
  state: WorkflowState;
  capturedAt: Date;
  createdAt: string;
  createdBy: string;
  checksum: string;
  compressed: boolean;
  sizeBytes: number;
  retentionPolicy: 'permanent' | 'temporary' | 'time_based';
  expiresAt?: Date;
  restoreCount: number;
}

export interface WorkflowState {
  currentNodeId: string;
  nodes: any[];
  connections: any[];
  variables: Record<string, any>;
  completedNodes: string[];
  pendingNodes: string[];
  currentNodes: string[];
  context: Record<string, any>;
  approvals: any[];
  slaStatuses: any[];
  parallelExecutions: any[];
  conditionalBranches: any[];
  externalTriggers: any[];
}

export interface RollbackOperation {
  id: string;
  snapshotId: string;
  workflowInstanceId: string;
  initiatedBy: string;
  initiatedAt: string;
  strategy: 'full' | 'partial' | 'compensating';
  affectedNodes?: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date | string;
  dryRun: boolean;
  error?: string;
  compensatingActions?: any[];
}

// Analytics Types
export interface WorkflowAnalytics {
  workflowId: string;
  period: {
    start: Date | string;
    end: Date | string;
  };
  summary: any;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageDuration: number;
  medianDuration: number;
  nodeMetrics: Array<{
    nodeId: string;
    averageDuration: number;
    failureRate: number;
    executionCount: number;
  }>;
  bottlenecks?: WorkflowBottleneck[];
  suggestions?: OptimizationSuggestion[];
  optimizationSuggestions: OptimizationSuggestion[];
  trends: any[];
  comparisons: any[];
}

export interface WorkflowBottleneck {
  nodeId: string;
  type: 'duration' | 'failure_rate' | 'wait_time';
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: number;
  description: string;
}

export interface OptimizationSuggestion {
  id: string;
  type: 'parallel' | 'caching' | 'simplification' | 'automation' | 'resource_allocation';
  targetNodeIds: string[];
  description: string;
  estimatedImprovement: number;
  confidence: number;
  implementationComplexity: 'low' | 'medium' | 'high';
}

// AI Suggestions Types
export interface AIWorkflowSuggestion {
  id: string;
  workflowId: string;
  type: 'optimization' | 'structure' | 'automation' | 'compliance' | 'best_practice' | 'parallelization';
  title: string;
  description: string;
  rationale: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  implementation: {
    steps: string[];
    estimatedEffort: string;
    affectedNodes: string[];
  };
  dataPoints: any[];
  changes: any[];
  implementationDifficulty: 'easy' | 'medium' | 'hard';
  autoApply: boolean;
  status: 'pending' | 'applied' | 'rejected';
  createdAt: Date | string;
  updatedAt: string;
  userId: string;
}

// External Trigger Types
export interface ExternalTrigger {
  id: string;
  name: string;
  description?: string;
  type: 'webhook' | 'api_poll' | 'email' | 'file_watch' | 'database' | 'queue' | 'custom';
  enabled: boolean;
  config: Record<string, any>;
  filters?: any[];
  transformation?: any;
  authentication?: any;
  workflowId: string;
}

export interface TriggerEvent {
  id: string;
  triggerId: string;
  timestamp: string;
  payload: Record<string, any>;
  receivedAt: Date;
  processedAt?: Date | string;
  status: 'pending' | 'processed' | 'failed' | 'ignored' | 'completed';
  workflowInstanceId?: string;
  error?: string;
}

// Enhanced Workflow Instance
export interface EnhancedWorkflowInstance {
  id: string;
  templateId: string;
  name: string;
  description?: string;
  status: string;
  nodes: any[];
  connections: any[];
  variables: Record<string, any>;
  context: Record<string, any>;
  completedNodes: string[];
  currentNodes: string[];
  currentNodeId?: string;
  startedAt: Date;
  completedAt?: Date;
  createdBy: string;
  assignedTo?: string;
  snapshots: any[];
  approvalInstances: any[];
  slaStatuses: any[];
}
