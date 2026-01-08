import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@common/base/base.entity';

export enum RetentionAction {
  ARCHIVE = 'archive',
  DELETE = 'delete',
  ANONYMIZE = 'anonymize',
  ENCRYPT = 'encrypt',
  EXPORT = 'export',
  RETAIN = 'retain',
}

export enum RetentionRuleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived',
}

@Entity('data_retention_rules')
@Index(['resourceType'])
@Index(['status'])
@Index(['nextExecutionDate'])
@Index(['priority'])
export class DataRetentionRule extends BaseEntity {
  @ApiProperty({ description: 'Name of the retention rule' })
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ description: 'Description of the rule' })
  @Column({ type: 'text', nullable: true })
  description!: string;

  @ApiProperty({ description: 'Resource type (e.g., document, case, email, audit_log)' })
  @Column({ name: 'resource_type', type: 'varchar', length: 100 })
  resourceType!: string;

  @ApiProperty({ description: 'Retention period in days' })
  @Column({ name: 'retention_period_days', type: 'integer' })
  retentionPeriodDays!: number;

  @ApiProperty({ enum: RetentionAction, description: 'Action to take when retention expires' })
  @Column({
    type: 'enum',
    enum: RetentionAction,
    default: RetentionAction.ARCHIVE,
  })
  action!: RetentionAction;

  @ApiProperty({ enum: RetentionRuleStatus, description: 'Status of the rule' })
  @Column({
    type: 'enum',
    enum: RetentionRuleStatus,
    default: RetentionRuleStatus.ACTIVE,
  })
  status!: RetentionRuleStatus;

  @ApiProperty({ description: 'Legal basis for this retention rule (e.g., GDPR Art. 6)' })
  @Column({ name: 'legal_basis', type: 'text', nullable: true })
  legalBasis!: string;

  @ApiProperty({ description: 'Regulatory framework (GDPR, HIPAA, SOX, etc.)' })
  @Column({ name: 'regulatory_framework', type: 'varchar', length: 100, nullable: true })
  regulatoryFramework!: string;

  @ApiProperty({ description: 'Priority level (1-10, higher = more important)' })
  @Column({ type: 'integer', default: 5 })
  priority!: number;

  @ApiProperty({ description: 'Conditions that trigger this rule' })
  @Column({ type: 'jsonb', nullable: true })
  conditions!: {
    field?: string;
    operator?: string;
    value?: unknown;
    logicalOperator?: 'AND' | 'OR';
  }[];

  @ApiProperty({ description: 'Exceptions to this rule' })
  @Column({ type: 'jsonb', nullable: true })
  exceptions!: {
    type?: string;
    description?: string;
    condition?: Record<string, unknown>;
    expiresAt?: Date;
  }[];

  @ApiProperty({ description: 'Applicable jurisdictions' })
  @Column({ type: 'text', array: true, default: '{}' })
  jurisdictions!: string[];

  @ApiProperty({ description: 'Affected departments or teams' })
  @Column({ type: 'text', array: true, default: '{}' })
  departments!: string[];

  @ApiProperty({ description: 'Date rule becomes effective' })
  @Column({ name: 'effective_date', type: 'timestamp' })
  effectiveDate!: Date;

  @ApiProperty({ description: 'Date rule expires (if applicable)' })
  @Column({ name: 'expiration_date', type: 'timestamp', nullable: true })
  expirationDate!: Date;

  @ApiProperty({ description: 'Next scheduled execution date' })
  @Column({ name: 'next_execution_date', type: 'timestamp', nullable: true })
  nextExecutionDate!: Date;

  @ApiProperty({ description: 'Last execution date' })
  @Column({ name: 'last_execution_date', type: 'timestamp', nullable: true })
  lastExecutionDate!: Date;

  @ApiProperty({ description: 'Execution frequency (daily, weekly, monthly)' })
  @Column({ name: 'execution_frequency', type: 'varchar', length: 50, default: 'daily' })
  executionFrequency!: string;

  @ApiProperty({ description: 'Number of resources processed in last execution' })
  @Column({ name: 'resources_processed', type: 'integer', default: 0 })
  resourcesProcessed!: number;

  @ApiProperty({ description: 'Number of resources affected by this rule' })
  @Column({ name: 'resources_affected', type: 'integer', default: 0 })
  resourcesAffected!: number;

  @ApiProperty({ description: 'Automatic execution enabled' })
  @Column({ name: 'auto_execute', type: 'boolean', default: false })
  autoExecute!: boolean;

  @ApiProperty({ description: 'Require approval before execution' })
  @Column({ name: 'require_approval', type: 'boolean', default: true })
  requireApproval!: boolean;

  @ApiProperty({ description: 'Approved by user ID' })
  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy!: string;

  @ApiProperty({ description: 'Approval date' })
  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt!: Date;

  @ApiProperty({ description: 'Send notification before execution' })
  @Column({ name: 'notify_before_days', type: 'integer', nullable: true })
  notifyBeforeDays!: number;

  @ApiProperty({ description: 'Notification recipients' })
  @Column({ name: 'notification_recipients', type: 'text', array: true, default: '{}' })
  notificationRecipients!: string[];

  @ApiProperty({ description: 'Backup before deletion' })
  @Column({ name: 'backup_before_action', type: 'boolean', default: true })
  backupBeforeAction!: boolean;

  @ApiProperty({ description: 'Backup location or configuration' })
  @Column({ name: 'backup_config', type: 'jsonb', nullable: true })
  backupConfig!: Record<string, unknown>;

  @ApiProperty({ description: 'Audit trail for rule changes' })
  @Column({ name: 'change_history', type: 'jsonb', nullable: true })
  changeHistory!: {
    changedAt?: Date;
    changedBy?: string;
    field?: string;
    oldValue?: unknown;
    newValue?: unknown;
    reason?: string;
  }[];

  @ApiProperty({ description: 'Last execution results' })
  @Column({ name: 'last_execution_results', type: 'jsonb', nullable: true })
  lastExecutionResults!: {
    startedAt?: Date;
    completedAt?: Date;
    status?: string;
    processed?: number;
    succeeded?: number;
    failed?: number;
    errors?: string[];
  };

  @ApiProperty({ description: 'Tags for categorization' })
  @Column({ type: 'text', array: true, default: '{}' })
  tags!: string[];

  @ApiProperty({ description: 'Additional metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;

  @ApiProperty({ description: 'Notes or comments' })
  @Column({ type: 'text', nullable: true })
  notes!: string;
}
