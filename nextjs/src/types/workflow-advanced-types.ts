/**
 * @file workflow-advanced-types.ts
 * @description Elite workflow designer advanced type system with 10 integrated features
 * @author PhD-Level Engineering Team
 * @architecture Backend-first with PostgreSQL persistence
 * @version 2.0.0
 * 
 * TYPE SYSTEM ARCHITECTURE:
 * - Conditional Branching: Rule-based decision trees with expression evaluation
 * - Parallel Execution: Concurrent task orchestration with join strategies
 * - Workflow Versioning: Git-style version control with diff tracking
 * - Template Library 2.0: AI-categorized searchable marketplace
 * - SLA Monitoring: Real-time deadline tracking with escalation policies
 * - Approval Chains: Multi-level hierarchical approval workflows
 * - Rollback Mechanism: State snapshots with temporal restoration
 * - Workflow Analytics: Performance metrics with bottleneck detection
 * - AI-Powered Suggestions: ML-based workflow optimization
 * - External Triggers: Event-driven workflow automation via webhooks
 */

import { BaseEntity, UserId } from './primitives';
import { WorkflowNode, WorkflowConnection } from './workflow-types';

// ============================================================================
// FEATURE 1: CONDITIONAL BRANCHING ENGINE
// ============================================================================

/**
 * Rule evaluation engine for conditional branching
 * Supports complex logical expressions with AND/OR operators
 */
export interface ConditionalRule {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'regex' | 'custom';
  value: unknown;
  valueType: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  caseSensitive?: boolean;
  customExpression?: string; // For advanced JavaScript expressions
}

export interface ConditionalBranch {
  id: string;
  name: string;
  description?: string;
  rules: ConditionalRule[];
  logic: 'AND' | 'OR' | 'XOR' | 'NAND' | 'NOR'; // Logical operators
  priority: number; // Evaluation order
  targetNodeId: string;
  fallthrough: boolean; // Continue to next branch if true
  color?: string; // Visual distinction
}

export interface ConditionalBranchingConfig {
  nodeId: string;
  branches: ConditionalBranch[];
  defaultBranchId?: string; // Fallback if no rules match
  evaluationStrategy: 'first_match' | 'best_match' | 'all_match';
  timeout?: number; // Max evaluation time in ms
  metadata?: {
    lastModified: string;
    modifiedBy: UserId;
    testResults?: Array<{
      input: Record<string, unknown>;
      matchedBranch: string;
      timestamp: string;
    }>;
  };
}

// ============================================================================
// FEATURE 2: PARALLEL EXECUTION SYSTEM
// ============================================================================

/**
 * Concurrent task execution with advanced join strategies
 */
export type ParallelJoinStrategy = 
  | 'wait_all'           // Wait for all branches to complete
  | 'wait_any'           // Continue when first branch completes
  | 'wait_majority'      // Continue when >50% complete
  | 'wait_custom'        // Custom threshold
  | 'timed_join';        // Continue after timeout regardless

export interface ParallelBranch {
  id: string;
  name: string;
  nodeIds: string[]; // Sequence of nodes in this branch
  estimatedDuration?: number; // In milliseconds
  priority: 'high' | 'medium' | 'low';
  dependencies?: string[]; // Other branch IDs that must complete first
  maxRetries?: number;
  retryDelay?: number;
  onError: 'fail_all' | 'continue' | 'retry' | 'fallback';
  fallbackBranchId?: string;
}

export interface ParallelExecutionConfig {
  nodeId: string;
  branches: ParallelBranch[];
  joinStrategy: ParallelJoinStrategy;
  customThreshold?: number; // For wait_custom (0-1 ratio)
  timeout?: number; // Max wait time for timed_join
  resourcePoolSize?: number; // Max concurrent executions
  loadBalancing: 'round_robin' | 'least_loaded' | 'random' | 'priority';
  errorHandling: {
    strategy: 'fail_fast' | 'continue_on_error' | 'compensating_transaction';
    compensationWorkflow?: string; // Workflow ID to run on failure
  };
  metrics?: {
    totalExecutions: number;
    averageDuration: number;
    successRate: number;
  };
}

// ============================================================================
// FEATURE 3: WORKFLOW VERSIONING
// ============================================================================

/**
 * Git-style version control for workflows with diff tracking
 */
export interface WorkflowVersion extends BaseEntity {
  workflowId: string;
  semanticVersion: string; // Semantic versioning (e.g., "1.2.3")
  major: number;
  minor: number;
  patch: number;
  tag?: string; // e.g., "beta", "stable", "deprecated"
  commitMessage: string;
  author: UserId;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  config: Record<string, unknown>;
  checksum: string; // SHA-256 hash of workflow structure
  parentVersionId?: string; // Previous version
  branchName?: string; // For workflow branching
  mergeConflicts?: WorkflowMergeConflict[];
  status: 'draft' | 'published' | 'archived' | 'deprecated';
  publishedAt?: string;
  deprecationReason?: string;
}

export interface WorkflowDiff {
  versionA: string;
  versionB: string;
  nodesAdded: WorkflowNode[];
  nodesRemoved: WorkflowNode[];
  nodesModified: Array<{
    nodeId: string;
    changes: Array<{
      field: string;
      oldValue: unknown;
      newValue: unknown;
    }>;
  }>;
  connectionsAdded: WorkflowConnection[];
  connectionsRemoved: WorkflowConnection[];
  configChanges: Array<{
    path: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
  breakingChanges: boolean;
  migrationRequired: boolean;
}

export interface WorkflowMergeConflict {
  id: string;
  conflictType: 'node_modified' | 'node_deleted' | 'connection_conflict' | 'config_conflict';
  nodeId?: string;
  connectionId?: string;
  configPath?: string;
  baseValue: unknown;
  branchAValue: unknown;
  branchBValue: unknown;
  resolution?: 'use_branch_a' | 'use_branch_b' | 'manual' | 'merge_both';
  resolvedValue?: unknown;
  resolvedBy?: UserId;
  resolvedAt?: string;
}

// ============================================================================
// FEATURE 4: TEMPLATE LIBRARY 2.0
// ============================================================================

/**
 * AI-categorized searchable template marketplace
 */
export interface WorkflowTemplateMetadata {
  categories: string[];
  tags: string[];
  jurisdiction?: string[];
  practiceAreas: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedDuration: {
    min: number;
    max: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
  };
  requiredRoles: string[];
  requiredIntegrations?: string[];
  costEstimate?: {
    min: number;
    max: number;
    currency: string;
  };
  aiCategories?: Array<{
    category: string;
    confidence: number;
    suggestedBy: 'ml_model' | 'user' | 'admin';
  }>;
}

export interface WorkflowTemplate extends BaseEntity {
  name: string;
  description: string;
  icon?: string;
  thumbnail?: string;
  metadata: WorkflowTemplateMetadata;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  variables: WorkflowVariable[];
  config: Record<string, unknown>;
  semanticVersion: string;
  author: UserId;
  rating: number;
  usageCount: number;
  favoriteCount: number;
  forkedFrom?: string; // Parent template ID
  forkCount: number;
  isPublic: boolean;
  isCertified: boolean; // Vetted by legal experts
  license: 'proprietary' | 'mit' | 'apache' | 'cc-by' | 'cc-by-sa';
  changeLog: Array<{
    version: string;
    changes: string;
    date: string;
  }>;
  reviews?: WorkflowTemplateReview[];
}

export interface WorkflowTemplateReview {
  id: string;
  userId: UserId;
  rating: number; // 1-5
  comment: string;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  response?: {
    text: string;
    by: UserId;
    at: string;
  };
}

export interface WorkflowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object' | 'user' | 'case' | 'document';
  required: boolean;
  defaultValue?: unknown;
  description?: string;
  validation?: {
    pattern?: string; // Regex
    min?: number;
    max?: number;
    options?: unknown[]; // For enum-like variables
  };
}

// ============================================================================
// FEATURE 5: SLA MONITORING DASHBOARD
// ============================================================================

/**
 * Real-time SLA tracking with escalation policies
 */
export interface SLAConfig {
  id: string;
  name: string;
  description?: string;
  targetDuration: number; // In milliseconds
  warningThreshold: number; // Percentage (e.g., 80 = warn at 80% of target)
  criticalThreshold: number; // Percentage (e.g., 100 = critical when exceeded)
  businessHoursOnly: boolean;
  businessHours?: {
    start: string; // HH:MM
    end: string;   // HH:MM
    timezone: string;
    excludeWeekends: boolean;
    excludeHolidays: boolean;
    holidayCalendar?: string; // ISO country code or custom calendar ID
  };
  escalationPolicy: EscalationPolicy;
  pauseConditions?: Array<{
    condition: string; // Expression to evaluate
    reason: string;
  }>;
  metrics?: {
    totalViolations: number;
    averageCompletionTime: number;
    complianceRate: number;
  };
}

export interface EscalationPolicy {
  id: string;
  levels: EscalationLevel[];
  autoResolve: boolean; // Automatically close escalation when task completes
  notifyOnEscalation: boolean;
  notifyOnResolution: boolean;
}

export interface EscalationLevel {
  level: number;
  triggerAt: number; // Percentage of SLA (e.g., 90)
  escalateTo: UserId[];
  escalateToRole?: string;
  actions: EscalationAction[];
  repeatInterval?: number; // Re-notify every X minutes
  maxRepeats?: number;
}

export type EscalationAction =
  | { type: 'email'; to: string[]; template: string }
  | { type: 'sms'; to: string[]; message: string }
  | { type: 'slack'; channel: string; message: string }
  | { type: 'webhook'; url: string; payload: Record<string, unknown> }
  | { type: 'create_task'; assignee: UserId; priority: 'high' | 'urgent' }
  | { type: 'reassign_workflow'; to: UserId }
  | { type: 'trigger_workflow'; workflowId: string };

export interface SLAStatus {
  nodeId: string;
  slaConfigId: string;
  status: 'on_track' | 'at_risk' | 'breached' | 'paused' | 'completed';
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
    resolvedAt?: string;
  }>;
}

// ============================================================================
// FEATURE 6: APPROVAL CHAIN BUILDER
// ============================================================================

/**
 * Multi-level approval hierarchies with delegation
 */
export interface ApprovalChain {
  id: string;
  name: string;
  description?: string;
  levels: ApprovalLevel[];
  requireSequential: boolean; // Must approve in order
  allowParallel: boolean; // Multiple approvers at same level can approve concurrently
  defaultAction: 'approve' | 'reject' | 'none';
  timeoutAction: 'auto_approve' | 'auto_reject' | 'escalate' | 'extend';
  timeoutDuration?: number; // In milliseconds
  notificationStrategy: 'immediate' | 'digest' | 'on_demand';
}

export interface ApprovalLevel {
  level: number;
  name: string;
  approvers: ApprovalApprover[];
  requiredApprovals: number; // How many approvers must approve (e.g., 2 of 3)
  allowDelegation: boolean;
  allowComments: boolean;
  requireComments: boolean;
  attachmentRequired: boolean;
  timeout?: number; // Level-specific timeout
  skipConditions?: Array<{
    condition: string; // Expression
    reason: string;
  }>;
  onApprove?: WorkflowAction[];
  onReject?: WorkflowAction[];
}

export interface ApprovalApprover {
  type: 'user' | 'role' | 'group' | 'dynamic';
  id: string; // User ID, role name, or group ID
  dynamicResolver?: string; // Expression to resolve approver at runtime
  weight?: number; // Weighted approval (e.g., senior partner = 2 votes)
  notifyBefore?: number; // Notify X minutes before timeout
}

export type WorkflowAction =
  | { type: 'email'; config: Record<string, unknown> }
  | { type: 'notification'; config: Record<string, unknown> }
  | { type: 'webhook'; config: Record<string, unknown> }
  | { type: 'update_field'; field: string; value: unknown }
  | { type: 'trigger_workflow'; workflowId: string }
  | { type: 'script'; code: string };

export interface ApprovalInstance {
  id: string;
  chainId: string;
  workflowInstanceId: string;
  nodeId: string;
  currentLevel: number;
  status: 'pending' | 'approved' | 'rejected' | 'timeout' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  decisions: ApprovalDecision[];
  delegations: ApprovalDelegation[];
}

export interface ApprovalDecision {
  id: string;
  level: number;
  approverId: UserId;
  decision: 'approve' | 'reject' | 'abstain';
  comments?: string;
  attachments?: string[];
  decidedAt: string;
  weight: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface ApprovalDelegation {
  id: string;
  from: UserId;
  to: UserId;
  level: number;
  reason?: string;
  expiresAt?: string;
  delegatedAt: string;
  accepted: boolean;
  acceptedAt?: string;
}

// ============================================================================
// FEATURE 7: ROLLBACK MECHANISM
// ============================================================================

/**
 * State snapshots with temporal restoration
 */
export interface WorkflowSnapshot {
  id: string;
  workflowInstanceId: string;
  version: number;
  type: 'auto' | 'manual' | 'milestone' | 'error' | 'scheduled';
  label?: string;
  description?: string;
  createdAt: string;
  createdBy: UserId;
  state: WorkflowState;
  checksum: string; // Integrity verification
  compressed: boolean;
  sizeBytes: number;
  retentionPolicy: 'permanent' | 'temporary' | 'time_based';
  expiresAt?: string;
  restoreCount: number;
  lastRestoredAt?: string;
}

export interface WorkflowState {
  currentNodeId: string;
  completedNodes: string[];
  pendingNodes: string[];
  variables: Record<string, unknown>;
  context: Record<string, unknown>;
  approvals: ApprovalInstance[];
  slaStatuses: SLAStatus[];
  parallelExecutions: Array<{
    configId: string;
    branchStatuses: Record<string, 'pending' | 'running' | 'completed' | 'failed'>;
  }>;
  conditionalBranches: Array<{
    configId: string;
    evaluatedRules: Record<string, boolean>;
    selectedBranch: string;
  }>;
  externalTriggers: Array<{
    id: string;
    status: 'listening' | 'triggered' | 'completed' | 'failed';
  }>;
}

export interface RollbackOperation {
  id: string;
  workflowInstanceId: string;
  snapshotId: string;
  initiatedBy: UserId;
  initiatedAt: string;
  completedAt?: string;
  status: 'in_progress' | 'completed' | 'failed' | 'cancelled';
  strategy: 'full' | 'partial' | 'compensating';
  affectedNodes: string[];
  compensatingActions?: Array<{
    action: string;
    status: 'pending' | 'completed' | 'failed';
    error?: string;
  }>;
  error?: string;
  dryRun: boolean; // Simulate rollback without executing
}

// ============================================================================
// FEATURE 8: WORKFLOW ANALYTICS ENGINE
// ============================================================================

/**
 * Performance metrics with bottleneck detection
 */
export interface WorkflowAnalytics {
  workflowId: string;
  period: {
    start: string;
    end: string;
  };
  summary: WorkflowPerformanceSummary;
  nodeMetrics: WorkflowNodeMetrics[];
  bottlenecks: WorkflowBottleneck[];
  optimizationSuggestions: OptimizationSuggestion[];
  trends: WorkflowTrend[];
  comparisons: WorkflowComparison[];
}

export interface WorkflowPerformanceSummary {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  cancelledExecutions: number;
  averageDuration: number;
  medianDuration: number;
  p95Duration: number;
  p99Duration: number;
  minDuration: number;
  maxDuration: number;
  successRate: number;
  slaComplianceRate: number;
  averageNodesExecuted: number;
  totalCost?: number;
  costPerExecution?: number;
}

export interface WorkflowNodeMetrics {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  executionCount: number;
  averageDuration: number;
  medianDuration: number;
  failureRate: number;
  retryRate: number;
  skippedRate: number;
  averageWaitTime: number; // Time waiting before execution
  throughput: number; // Executions per hour
  resourceUtilization?: number; // CPU/Memory if tracked
  errorTypes: Array<{
    errorType: string;
    count: number;
    percentage: number;
  }>;
}

export interface WorkflowBottleneck {
  id: string;
  nodeId: string;
  nodeName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'duration' | 'waiting' | 'resource' | 'error' | 'sequential';
  description: string;
  impact: {
    averageDelay: number;
    affectedExecutions: number;
    costImpact?: number;
  };
  detectedAt: string;
  recommendation: string;
  estimatedImprovement: {
    durationReduction?: number;
    successRateIncrease?: number;
    costSavings?: number;
  };
}

export interface OptimizationSuggestion {
  id: string;
  type: 'parallelization' | 'caching' | 'reordering' | 'elimination' | 'consolidation' | 'automation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedNodes: string[];
  estimatedImpact: {
    durationReduction?: number;
    costSavings?: number;
    errorReduction?: number;
  };
  effort: 'low' | 'medium' | 'high';
  autoApplicable: boolean;
  implementation?: {
    steps: string[];
    risks: string[];
    testingRequired: boolean;
  };
}

export interface WorkflowTrend {
  metric: string;
  values: Array<{
    timestamp: string;
    value: number;
  }>;
  trend: 'improving' | 'stable' | 'degrading';
  trendPercentage: number;
  forecast?: Array<{
    timestamp: string;
    value: number;
    confidence: number;
  }>;
}

export interface WorkflowComparison {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  significant: boolean;
}

// ============================================================================
// FEATURE 9: AI-POWERED WORKFLOW SUGGESTIONS
// ============================================================================

/**
 * ML-based workflow optimization and intelligent recommendations
 */
export interface AIWorkflowSuggestion {
  id: string;
  workflowId: string;
  type: 'optimization' | 'automation' | 'simplification' | 'best_practice' | 'compliance' | 'risk_mitigation';
  confidence: number; // 0-1
  title: string;
  description: string;
  rationale: string;
  dataPoints: Array<{
    metric: string;
    currentValue: unknown;
    expectedValue: unknown;
  }>;
  changes: AIWorkflowChange[];
  impact: {
    durationReduction?: number;
    costSavings?: number;
    riskReduction?: number;
    qualityImprovement?: number;
  };
  implementationDifficulty: 'trivial' | 'easy' | 'moderate' | 'difficult' | 'expert';
  autoApply: boolean;
  appliedAt?: string;
  appliedBy?: UserId;
  status: 'pending' | 'accepted' | 'rejected' | 'applied';
  feedback?: {
    helpful: boolean;
    comments?: string;
    actualImpact?: Record<string, number>;
  };
}

export interface AIWorkflowChange {
  action: 'add_node' | 'remove_node' | 'modify_node' | 'add_connection' | 'remove_connection' | 'reorder' | 'parallelize' | 'add_approval';
  target?: string; // Node ID or connection ID
  details: Record<string, unknown>;
  reversible: boolean;
}

export interface AIWorkflowModel {
  modelId: string;
  modelType: 'pattern_recognition' | 'anomaly_detection' | 'optimization' | 'prediction' | 'classification';
  version: string;
  trainedOn: {
    datasetSize: number;
    lastTrainedAt: string;
    accuracy: number;
    precision: number;
    recall: number;
  };
  features: string[];
  hyperparameters: Record<string, unknown>;
}

export interface AILearningFeedback {
  suggestionId: string;
  accepted: boolean;
  implemented: boolean;
  actualOutcome?: {
    durationChange?: number;
    costChange?: number;
    qualityChange?: number;
  };
  userFeedback?: {
    rating: number; // 1-5
    comments?: string;
  };
  timestamp: string;
}

// ============================================================================
// FEATURE 10: EXTERNAL SYSTEM TRIGGERS
// ============================================================================

/**
 * Event-driven workflow automation via webhooks and API integrations
 */
export interface ExternalTrigger {
  id: string;
  name: string;
  description?: string;
  type: 'webhook' | 'api_poll' | 'email' | 'file_watch' | 'database' | 'queue' | 'custom';
  enabled: boolean;
  config: ExternalTriggerConfig;
  filters: TriggerFilter[];
  transformation?: DataTransformation;
  authentication?: TriggerAuthentication;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  retryPolicy?: {
    maxRetries: number;
    backoffStrategy: 'fixed' | 'exponential' | 'linear';
    initialDelay: number;
    maxDelay: number;
  };
  metrics: {
    totalTriggers: number;
    successfulTriggers: number;
    failedTriggers: number;
    lastTriggeredAt?: string;
    averageProcessingTime: number;
  };
}

export type ExternalTriggerConfig = 
  | WebhookConfig
  | ApiPollConfig
  | EmailConfig
  | FileWatchConfig
  | DatabaseConfig
  | QueueConfig
  | CustomConfig;

export interface WebhookConfig {
  type: 'webhook';
  url: string; // Generated webhook URL
  method: 'POST' | 'PUT' | 'PATCH';
  expectedHeaders?: Record<string, string>;
  signatureValidation?: {
    header: string;
    secret: string;
    algorithm: 'sha256' | 'sha512' | 'hmac';
  };
  ipWhitelist?: string[];
}

export interface ApiPollConfig {
  type: 'api_poll';
  endpoint: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  pollInterval: number; // In milliseconds
  deduplicate: boolean;
  deduplicateField?: string; // Field to use for deduplication
  lastPollTimestamp?: string;
}

export interface EmailConfig {
  type: 'email';
  emailAddress: string; // Generated email address
  subjectFilter?: string; // Regex
  senderFilter?: string; // Regex
  attachmentRequired?: boolean;
  autoReply?: {
    enabled: boolean;
    template: string;
  };
}

export interface FileWatchConfig {
  type: 'file_watch';
  path: string;
  pattern: string; // Glob pattern
  events: Array<'created' | 'modified' | 'deleted'>;
  recursive: boolean;
  debounce: number; // Wait X ms after last change
}

export interface DatabaseConfig {
  type: 'database';
  connectionString: string;
  query: string;
  pollInterval: number;
  lastCheckTimestamp?: string;
  triggerOnChange: boolean;
}

export interface QueueConfig {
  type: 'queue';
  queueType: 'sqs' | 'rabbitmq' | 'kafka' | 'redis' | 'azure_queue';
  connectionConfig: Record<string, unknown>;
  queueName: string;
  consumeStrategy: 'peek' | 'consume' | 'subscribe';
  acknowledgeOnSuccess: boolean;
}

export interface CustomConfig {
  type: 'custom';
  code: string; // JavaScript function
  dependencies?: string[];
  timeout: number;
}

export interface TriggerFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'regex' | 'greater_than' | 'less_than' | 'exists';
  value: unknown;
  caseSensitive?: boolean;
}

export interface DataTransformation {
  type: 'jmespath' | 'jsonata' | 'javascript' | 'template';
  expression: string;
  outputSchema?: Record<string, unknown>;
  validateOutput: boolean;
}

export interface TriggerAuthentication {
  type: 'none' | 'basic' | 'bearer' | 'api_key' | 'oauth2' | 'custom';
  credentials?: Record<string, string>;
  oauth2Config?: {
    authUrl: string;
    tokenUrl: string;
    clientId: string;
    clientSecret: string;
    scope: string[];
  };
}

export interface TriggerEvent {
  id: string;
  triggerId: string;
  timestamp: string;
  payload: Record<string, unknown>;
  headers?: Record<string, string>;
  metadata?: Record<string, unknown>;
  processedAt?: string;
  workflowInstanceId?: string;
  status: 'received' | 'processing' | 'completed' | 'failed' | 'ignored';
  error?: string;
}

// ============================================================================
// UNIFIED WORKFLOW INSTANCE WITH ALL FEATURES
// ============================================================================

export interface EnhancedWorkflowInstance extends BaseEntity {
  templateId: string;
  semanticVersion: string;
  name: string;
  description?: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled' | 'rolled_back';
  
  // Core workflow data
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  currentNodeId?: string;
  completedNodes: string[];
  failedNodes: string[];
  
  // Feature integrations
  conditionalConfigs: ConditionalBranchingConfig[];
  parallelConfigs: ParallelExecutionConfig[];
  slaConfigs: SLAConfig[];
  slaStatuses: SLAStatus[];
  approvalChains: ApprovalChain[];
  approvalInstances: ApprovalInstance[];
  snapshots: WorkflowSnapshot[];
  analytics?: WorkflowAnalytics;
  aiSuggestions: AIWorkflowSuggestion[];
  externalTriggers: ExternalTrigger[];
  triggerEvents: TriggerEvent[];

  // Execution metadata
  variables: Record<string, unknown>;
  context: Record<string, unknown>;
  startedAt?: string;
  completedAt?: string;
  pausedAt?: string;
  cancelledAt?: string;
  duration?: number;
  estimatedCompletion?: string;
  
  // Ownership and permissions
  createdBy: UserId;
  assignedTo?: UserId[];
  teamId?: string;
  caseId?: string;
  matterId?: string;
  
  // Audit trail
  auditLog: Array<{
    timestamp: string;
    userId: UserId;
    action: string;
    details: Record<string, unknown>;
  }>;

  // Integration hooks
  webhookUrl?: string;
  callbackUrl?: string;

  metadata: Record<string, unknown>;
}

// ============================================================================
// QUERY AND FILTER TYPES
// ============================================================================

export interface WorkflowQueryFilters {
  status?: EnhancedWorkflowInstance['status'][];
  createdBy?: UserId;
  assignedTo?: UserId;
  caseId?: string;
  matterId?: string;
  templateId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  slaStatus?: SLAStatus['status'][];
  hasBottlenecks?: boolean;
  hasPendingApprovals?: boolean;
  tags?: string[];
  search?: string;
}

export interface WorkflowSortOptions {
  field: 'createdAt' | 'updatedAt' | 'startedAt' | 'completedAt' | 'duration' | 'priority' | 'slaStatus';
  order: 'asc' | 'desc';
}

// ============================================================================
// ALL TYPES EXPORTED VIA NAMED EXPORTS ABOVE
// No need for redundant export type {} declarations
// ============================================================================
