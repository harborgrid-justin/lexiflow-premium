/**
 * Enterprise Data Agent Interfaces
 *
 * Type definitions for the data handling multi-agent system.
 *
 * @module DataAgentInterfaces
 * @version 1.0.0
 */

/**
 * Data agent types
 */
export enum DataAgentType {
  VALIDATION = 'VALIDATION',
  TRANSFORMATION = 'TRANSFORMATION',
  MIGRATION = 'MIGRATION',
  QUALITY = 'QUALITY',
  INDEXING = 'INDEXING',
  REPLICATION = 'REPLICATION',
  ARCHIVAL = 'ARCHIVAL',
  RECOVERY = 'RECOVERY',
  INTEGRITY = 'INTEGRITY',
  OPTIMIZATION = 'OPTIMIZATION',
  COORDINATOR = 'COORDINATOR',
  SCRATCHPAD = 'SCRATCHPAD',
}

/**
 * Data operation types
 */
export enum DataOperationType {
  VALIDATE = 'VALIDATE',
  TRANSFORM = 'TRANSFORM',
  MIGRATE = 'MIGRATE',
  ANALYZE = 'ANALYZE',
  INDEX = 'INDEX',
  REPLICATE = 'REPLICATE',
  ARCHIVE = 'ARCHIVE',
  RECOVER = 'RECOVER',
  CHECK_INTEGRITY = 'CHECK_INTEGRITY',
  OPTIMIZE = 'OPTIMIZE',
  SYNC = 'SYNC',
  SEED = 'SEED',
}

/**
 * Data validation rules
 */
export interface DataValidationRule {
  field: string;
  type: 'required' | 'format' | 'range' | 'reference' | 'custom';
  constraint: unknown;
  errorMessage: string;
}

/**
 * Data validation result
 */
export interface DataValidationResult {
  isValid: boolean;
  errors: DataValidationError[];
  warnings: DataValidationWarning[];
  validatedAt: Date;
  recordsChecked: number;
  recordsValid: number;
  recordsInvalid: number;
}

/**
 * Data validation error
 */
export interface DataValidationError {
  field: string;
  value: unknown;
  rule: string;
  message: string;
  severity: 'error' | 'critical';
  recordId?: string;
}

/**
 * Data validation warning
 */
export interface DataValidationWarning {
  field: string;
  value: unknown;
  message: string;
  suggestion?: string;
  recordId?: string;
}

/**
 * Data transformation configuration
 */
export interface DataTransformationConfig {
  sourceFormat: string;
  targetFormat: string;
  mappings: FieldMapping[];
  defaultValues?: Record<string, unknown>;
  filters?: DataFilter[];
}

/**
 * Field mapping for transformation
 */
export interface FieldMapping {
  source: string;
  target: string;
  transform?: 'uppercase' | 'lowercase' | 'trim' | 'date' | 'number' | 'custom';
  customTransform?: (value: unknown) => unknown;
}

/**
 * Data filter
 */
export interface DataFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'regex';
  value: unknown;
}

/**
 * Data quality metrics
 */
export interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  uniqueness: number;
  validity: number;
  overallScore: number;
  checkedAt: Date;
  recordsAnalyzed: number;
  issues: DataQualityIssue[];
}

/**
 * Data quality issue
 */
export interface DataQualityIssue {
  type: 'duplicate' | 'missing' | 'invalid' | 'inconsistent' | 'outdated';
  entity: string;
  field?: string;
  affectedRecords: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

/**
 * Data migration plan
 */
export interface DataMigrationPlan {
  id: string;
  name: string;
  sourceConnection: DatabaseConnection;
  targetConnection: DatabaseConnection;
  entities: EntityMigration[];
  strategy: 'full' | 'incremental' | 'delta';
  scheduledAt?: Date;
  estimatedDuration: number;
  rollbackEnabled: boolean;
}

/**
 * Database connection config
 */
export interface DatabaseConnection {
  type: 'postgres' | 'mysql' | 'sqlite' | 'mongodb';
  host: string;
  port: number;
  database: string;
  username?: string;
  ssl?: boolean;
}

/**
 * Entity migration config
 */
export interface EntityMigration {
  sourceEntity: string;
  targetEntity: string;
  fieldMappings: FieldMapping[];
  batchSize: number;
  skipDuplicates: boolean;
  validateBeforeInsert: boolean;
}

/**
 * Data index configuration
 */
export interface DataIndexConfig {
  entity: string;
  fields: IndexField[];
  type: 'btree' | 'hash' | 'gin' | 'gist' | 'fulltext';
  unique: boolean;
  sparse: boolean;
}

/**
 * Index field
 */
export interface IndexField {
  name: string;
  direction: 'asc' | 'desc';
  weight?: number;
}

/**
 * Replication configuration
 */
export interface ReplicationConfig {
  source: DatabaseConnection;
  targets: DatabaseConnection[];
  mode: 'sync' | 'async';
  conflictResolution: 'source_wins' | 'target_wins' | 'latest_wins' | 'merge';
  retryPolicy: RetryPolicy;
}

/**
 * Retry policy
 */
export interface RetryPolicy {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

/**
 * Archive configuration
 */
export interface ArchiveConfig {
  entity: string;
  retentionDays: number;
  archiveLocation: string;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  scheduleExpression?: string;
}

/**
 * Recovery configuration
 */
export interface RecoveryConfig {
  backupId: string;
  targetPoint: Date | 'latest';
  entities?: string[];
  validateAfterRestore: boolean;
  dryRun: boolean;
}

/**
 * Integrity check result
 */
export interface IntegrityCheckResult {
  isHealthy: boolean;
  checksPerformed: IntegrityCheck[];
  issues: IntegrityIssue[];
  checkedAt: Date;
  duration: number;
}

/**
 * Integrity check
 */
export interface IntegrityCheck {
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'skipped';
  details?: string;
}

/**
 * Integrity issue
 */
export interface IntegrityIssue {
  type: 'orphan' | 'broken_reference' | 'constraint_violation' | 'checksum_mismatch';
  entity: string;
  affectedRecords: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoFixable: boolean;
  fixQuery?: string;
}

/**
 * Optimization recommendation
 */
export interface OptimizationRecommendation {
  type: 'index' | 'query' | 'schema' | 'configuration' | 'cleanup';
  priority: 'low' | 'medium' | 'high';
  description: string;
  estimatedImpact: string;
  implementationSteps: string[];
  automaticallyApplicable: boolean;
}

/**
 * Data agent task
 */
export interface DataAgentTask {
  id: string;
  agentType: DataAgentType;
  operationType: DataOperationType;
  payload: unknown;
  priority: 'low' | 'normal' | 'high' | 'critical';
  createdAt: Date;
  scheduledAt?: Date;
  timeout?: number;
  retryPolicy?: RetryPolicy;
}

/**
 * Data agent result
 */
export interface DataAgentResult {
  taskId: string;
  success: boolean;
  data?: unknown;
  error?: string;
  processingTime: number;
  metadata?: Record<string, unknown>;
}

/**
 * Data scratchpad entry
 */
export interface DataScratchpadEntry {
  key: string;
  value: unknown;
  agentId: string;
  createdAt: Date;
  expiresAt?: Date;
  tags?: string[];
}

/**
 * Data event
 */
export interface DataEvent {
  type: string;
  payload: unknown;
  sourceAgentId: string;
  timestamp: Date;
  correlationId?: string;
}
